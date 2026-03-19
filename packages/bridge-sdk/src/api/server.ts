import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino";
import pinoHttp from "pino-http";
import { z } from "zod";
import { NjordBridge } from "../bridge";
import { StripeWebhookHandler, StripeWebhookConfig } from "../webhooks/stripe";
import { RazorpayWebhookHandler, RazorpayWebhookConfig } from "../webhooks/razorpay";
import { AttributionEvent, BridgeStatus } from "../types";

// Request schemas
const RecordAttributionSchema = z.object({
  campaignId: z.string().min(1),
  affiliateId: z.string().min(1),
  actionValue: z.number().positive(),
  customerId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerIp: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const CreateCheckoutSchema = z.object({
  provider: z.enum(["stripe", "razorpay"]),
  campaignId: z.string().min(1),
  affiliateId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  customerId: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  productName: z.string().optional(),
});

export interface BridgeServerConfig {
  bridge: NjordBridge;
  port?: number;
  host?: string;
  corsOrigins?: string[];
  stripe?: StripeWebhookConfig;
  razorpay?: RazorpayWebhookConfig;
}

export class BridgeServer {
  private app: Express;
  private bridge: NjordBridge;
  private logger: pino.Logger;
  private port: number;
  private host: string;
  private stripeHandler?: StripeWebhookHandler;
  private razorpayHandler?: RazorpayWebhookHandler;

  constructor(config: BridgeServerConfig) {
    this.bridge = config.bridge;
    this.port = config.port ?? 3000;
    this.host = config.host ?? "0.0.0.0";
    this.logger = pino({ name: "njord-bridge" });

    // Initialize webhook handlers
    if (config.stripe) {
      this.stripeHandler = new StripeWebhookHandler({
        ...config.stripe,
        logger: this.logger,
      });
    }
    if (config.razorpay) {
      this.razorpayHandler = new RazorpayWebhookHandler({
        ...config.razorpay,
        logger: this.logger,
      });
    }

    this.app = this.createApp(config.corsOrigins);
  }

  private createApp(corsOrigins?: string[]): Express {
    const app = express();

    // Security middleware
    app.use(helmet());
    app.use(cors({
      origin: corsOrigins ?? "*",
      methods: ["GET", "POST"],
    }));

    // Logging
    app.use(pinoHttp({ logger: this.logger }));

    // JSON parser (except for webhook routes that need raw body)
    app.use((req, res, next) => {
      if (req.path.startsWith("/webhooks/stripe")) {
        next();
      } else {
        express.json()(req, res, next);
      }
    });

    // Routes
    this.setupRoutes(app);

    // Error handler
    app.use(this.errorHandler.bind(this));

    return app;
  }

  private setupRoutes(app: Express): void {
    // Health check
    app.get("/health", async (req: Request, res: Response) => {
      const status = await this.bridge.getStatus();
      res.status(status.isHealthy ? 200 : 503).json(status);
    });

    // Status
    app.get("/status", async (req: Request, res: Response) => {
      const status = await this.bridge.getStatus();
      res.json(status);
    });

    // Stats
    app.get("/stats", (req: Request, res: Response) => {
      res.json(this.bridge.getStats());
    });

    // Record attribution manually
    app.post("/attributions", async (req: Request, res: Response) => {
      const parsed = RecordAttributionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: parsed.error.errors,
        });
      }

      const { campaignId, affiliateId, actionValue, customerId } = parsed.data;

      // Generate hashes
      const customerHash = new Uint8Array(32);
      const customerIdStr = customerId ?? `${campaignId}_${Date.now()}`;
      const encoder = new TextEncoder();
      const encoded = encoder.encode(customerIdStr);
      for (let i = 0; i < encoded.length; i++) {
        customerHash[i % 32] ^= encoded[i];
      }

      const nonce = new Uint8Array(16);
      crypto.getRandomValues(nonce);

      const event: AttributionEvent = {
        campaignId,
        affiliateId,
        actionValue,
        customerHash,
        nonce,
        fraudScore: 0,
        metadata: parsed.data.metadata,
      };

      const result = await this.bridge.processAttribution(event);
      res.status(result.success ? 200 : 400).json(result);
    });

    // Create checkout session
    app.post("/checkout", async (req: Request, res: Response) => {
      const parsed = CreateCheckoutSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: parsed.error.errors,
        });
      }

      const { provider, campaignId, affiliateId, amount, currency, customerId, successUrl, cancelUrl, productName } = parsed.data;

      try {
        if (provider === "stripe" && this.stripeHandler) {
          const session = await this.stripeHandler.createCheckoutSession({
            campaignId,
            affiliateId,
            customerId,
            amount,
            currency,
            successUrl,
            cancelUrl,
            productName,
          });
          return res.json({ url: session.url, sessionId: session.id });
        }

        if (provider === "razorpay" && this.razorpayHandler) {
          const order = await this.razorpayHandler.createOrder({
            campaignId,
            affiliateId,
            customerId,
            amount,
            currency,
          });
          return res.json({ orderId: order.id, amount: order.amount });
        }

        return res.status(400).json({ error: `Provider ${provider} not configured` });
      } catch (err) {
        this.logger.error({ err }, "Failed to create checkout");
        return res.status(500).json({ error: "Failed to create checkout" });
      }
    });

    // Webhook routes
    if (this.stripeHandler) {
      const stripeRouter = this.stripeHandler.createRouter(
        this.handlePaymentWebhook.bind(this)
      );
      app.use("/webhooks/stripe", stripeRouter);
    }

    if (this.razorpayHandler) {
      const razorpayRouter = this.razorpayHandler.createRouter(
        this.handlePaymentWebhook.bind(this)
      );
      app.use("/webhooks/razorpay", razorpayRouter);
    }

    // List campaigns (proxy to indexer or on-chain)
    app.get("/campaigns", async (req: Request, res: Response) => {
      // TODO: Implement campaign listing from indexer
      res.json({ campaigns: [], message: "Connect to indexer for campaign data" });
    });

    // Get campaign details
    app.get("/campaigns/:id", async (req: Request, res: Response) => {
      // TODO: Implement campaign fetching
      res.json({ campaign: null, message: "Connect to indexer for campaign data" });
    });
  }

  private async handlePaymentWebhook(event: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    metadata: {
      campaignId: string;
      affiliateId: string;
      customerId?: string;
    };
    createdAt: Date;
  }): Promise<void> {
    const customerHash = new Uint8Array(32);
    const customerId = event.metadata.customerId ?? event.id;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(customerId);
    for (let i = 0; i < encoded.length; i++) {
      customerHash[i % 32] ^= encoded[i];
    }

    const nonce = new Uint8Array(16);
    crypto.getRandomValues(nonce);

    const attribution: AttributionEvent = {
      campaignId: event.metadata.campaignId,
      affiliateId: event.metadata.affiliateId,
      actionValue: event.amount,
      customerHash,
      nonce,
      fraudScore: 0,
    };

    const result = await this.bridge.processAttribution(attribution);
    if (!result.success) {
      throw new Error(result.error ?? "Attribution failed");
    }
  }

  private errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    this.logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  }

  async start(): Promise<void> {
    await this.bridge.start();

    return new Promise((resolve) => {
      this.app.listen(this.port, this.host, () => {
        this.logger.info(`Bridge API server running on http://${this.host}:${this.port}`);
        resolve();
      });
    });
  }

  getApp(): Express {
    return this.app;
  }
}

export default BridgeServer;
