import { Request, Response, Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { PaymentEvent, WebhookHandler } from "../types";
import { Logger } from "pino";

const StripeMetadataSchema = z.object({
  campaign_id: z.string(),
  affiliate_id: z.string(),
  customer_id: z.string().optional(),
});

export interface StripeWebhookConfig {
  secretKey: string;
  webhookSecret: string;
  logger?: Logger;
}

export class StripeWebhookHandler implements WebhookHandler {
  provider = "stripe" as const;
  private stripe: Stripe;
  private webhookSecret: string;
  private logger?: Logger;

  constructor(config: StripeWebhookConfig) {
    this.stripe = new Stripe(config.secretKey);
    this.webhookSecret = config.webhookSecret;
    this.logger = config.logger;
  }

  verify(payload: string | Buffer, signature: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
      return true;
    } catch (err) {
      this.logger?.warn({ err }, "Stripe webhook verification failed");
      return false;
    }
  }

  parse(payload: string | Buffer, signature: string): PaymentEvent | null {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      // Only process successful payments
      if (event.type !== "checkout.session.completed" &&
          event.type !== "payment_intent.succeeded") {
        return null;
      }

      const data = event.data.object as Stripe.PaymentIntent | Stripe.Checkout.Session;

      // Extract metadata
      const metadata = StripeMetadataSchema.safeParse(data.metadata);
      if (!metadata.success) {
        this.logger?.warn({ metadata: data.metadata }, "Invalid Stripe metadata");
        return null;
      }

      const amount = "amount_received" in data
        ? data.amount_received
        : (data as Stripe.Checkout.Session).amount_total;

      return {
        id: data.id,
        amount: amount ?? 0,
        currency: (data.currency ?? "usd").toUpperCase(),
        status: "completed",
        metadata: {
          campaignId: metadata.data.campaign_id,
          affiliateId: metadata.data.affiliate_id,
          customerId: metadata.data.customer_id,
        },
        createdAt: new Date((data.created ?? Date.now() / 1000) * 1000),
      };
    } catch (err) {
      this.logger?.error({ err }, "Failed to parse Stripe webhook");
      return null;
    }
  }

  /**
   * Create Express router for Stripe webhooks
   */
  createRouter(onPayment: (event: PaymentEvent) => Promise<void>): Router {
    const router = Router();

    router.post(
      "/",
      // Raw body parser for signature verification
      (req: Request, res: Response, next) => {
        if (req.headers["content-type"] === "application/json") {
          let data = "";
          req.setEncoding("utf8");
          req.on("data", (chunk) => (data += chunk));
          req.on("end", () => {
            (req as any).rawBody = data;
            next();
          });
        } else {
          next();
        }
      },
      async (req: Request, res: Response) => {
        const signature = req.headers["stripe-signature"] as string;
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);

        if (!this.verify(rawBody, signature)) {
          this.logger?.warn("Invalid Stripe signature");
          return res.status(400).json({ error: "Invalid signature" });
        }

        const paymentEvent = this.parse(rawBody, signature);
        if (!paymentEvent) {
          // Not a payment event we care about
          return res.status(200).json({ received: true, processed: false });
        }

        try {
          await onPayment(paymentEvent);
          this.logger?.info(
            { paymentId: paymentEvent.id },
            "Stripe payment processed"
          );
          res.status(200).json({ received: true, processed: true });
        } catch (err) {
          this.logger?.error({ err, paymentId: paymentEvent.id }, "Payment processing failed");
          res.status(500).json({ error: "Processing failed" });
        }
      }
    );

    return router;
  }

  /**
   * Create a checkout session with affiliate tracking
   */
  async createCheckoutSession(params: {
    campaignId: string;
    affiliateId: string;
    customerId?: string;
    amount: number;
    currency?: string;
    successUrl: string;
    cancelUrl: string;
    productName?: string;
  }): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: params.currency ?? "usd",
            product_data: {
              name: params.productName ?? "Purchase",
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        campaign_id: params.campaignId,
        affiliate_id: params.affiliateId,
        customer_id: params.customerId ?? "",
      },
    });
  }
}

export default StripeWebhookHandler;
