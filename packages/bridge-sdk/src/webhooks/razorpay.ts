import { Request, Response, Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { z } from "zod";
import { PaymentEvent, WebhookHandler } from "../types";
import { Logger } from "pino";

const RazorpayNotesSchema = z.object({
  campaign_id: z.string(),
  affiliate_id: z.string(),
  customer_id: z.string().optional(),
});

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        notes: Record<string, string>;
        created_at: number;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        notes: Record<string, string>;
        created_at: number;
      };
    };
  };
}

export interface RazorpayWebhookConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  logger?: Logger;
}

export class RazorpayWebhookHandler implements WebhookHandler {
  provider = "razorpay" as const;
  private razorpay: Razorpay;
  private webhookSecret: string;
  private logger?: Logger;

  constructor(config: RazorpayWebhookConfig) {
    this.razorpay = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });
    this.webhookSecret = config.webhookSecret;
    this.logger = config.logger;
  }

  verify(payload: string | Buffer, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(typeof payload === "string" ? payload : payload.toString())
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (err) {
      this.logger?.warn({ err }, "Razorpay webhook verification failed");
      return false;
    }
  }

  parse(payload: string | Buffer, signature: string): PaymentEvent | null {
    try {
      const data: RazorpayWebhookPayload = JSON.parse(
        typeof payload === "string" ? payload : payload.toString()
      );

      // Only process successful payments
      if (data.event !== "payment.captured" && data.event !== "order.paid") {
        return null;
      }

      const entity = data.payload.payment?.entity ?? data.payload.order?.entity;
      if (!entity) {
        return null;
      }

      // Extract notes (Razorpay's metadata)
      const notes = RazorpayNotesSchema.safeParse(entity.notes);
      if (!notes.success) {
        this.logger?.warn({ notes: entity.notes }, "Invalid Razorpay notes");
        return null;
      }

      return {
        id: entity.id,
        amount: entity.amount, // Amount in paise (smallest unit)
        currency: entity.currency.toUpperCase(),
        status: "completed",
        metadata: {
          campaignId: notes.data.campaign_id,
          affiliateId: notes.data.affiliate_id,
          customerId: notes.data.customer_id,
        },
        createdAt: new Date(entity.created_at * 1000),
      };
    } catch (err) {
      this.logger?.error({ err }, "Failed to parse Razorpay webhook");
      return null;
    }
  }

  /**
   * Create Express router for Razorpay webhooks
   */
  createRouter(onPayment: (event: PaymentEvent) => Promise<void>): Router {
    const router = Router();

    router.post("/", async (req: Request, res: Response) => {
      const signature = req.headers["x-razorpay-signature"] as string;
      const rawBody = JSON.stringify(req.body);

      if (!this.verify(rawBody, signature)) {
        this.logger?.warn("Invalid Razorpay signature");
        return res.status(400).json({ error: "Invalid signature" });
      }

      const paymentEvent = this.parse(rawBody, signature);
      if (!paymentEvent) {
        return res.status(200).json({ received: true, processed: false });
      }

      try {
        await onPayment(paymentEvent);
        this.logger?.info(
          { paymentId: paymentEvent.id },
          "Razorpay payment processed"
        );
        res.status(200).json({ received: true, processed: true });
      } catch (err) {
        this.logger?.error({ err, paymentId: paymentEvent.id }, "Payment processing failed");
        res.status(500).json({ error: "Processing failed" });
      }
    });

    return router;
  }

  /**
   * Create an order with affiliate tracking
   */
  async createOrder(params: {
    campaignId: string;
    affiliateId: string;
    customerId?: string;
    amount: number;
    currency?: string;
    receipt?: string;
  }): Promise<Razorpay.Orders.RazorpayOrder> {
    return this.razorpay.orders.create({
      amount: params.amount,
      currency: params.currency ?? "INR",
      receipt: params.receipt ?? `order_${Date.now()}`,
      notes: {
        campaign_id: params.campaignId,
        affiliate_id: params.affiliateId,
        customer_id: params.customerId ?? "",
      },
    }) as Promise<Razorpay.Orders.RazorpayOrder>;
  }

  /**
   * Verify payment signature (for client-side verification)
   */
  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    const body = params.orderId + "|" + params.paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(body)
      .digest("hex");

    return expectedSignature === params.signature;
  }
}

export default RazorpayWebhookHandler;
