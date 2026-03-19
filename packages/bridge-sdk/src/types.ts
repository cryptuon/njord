import { PublicKey, Keypair } from "@solana/web3.js";
import { z } from "zod";

// ============== Configuration ==============

export interface BridgeConfig {
  // Solana
  solanaRpc: string;
  bridgeKeypair: Keypair;
  programId?: PublicKey;

  // Payment Provider
  paymentProvider: PaymentProviderType;
  paymentProviderConfig: PaymentProviderConfig;

  // Server
  port?: number;
  host?: string;

  // Redis (for queue management)
  redisUrl?: string;

  // Fraud Detection
  fraudDetection?: FraudDetectionConfig;
}

export type PaymentProviderType = "stripe" | "razorpay" | "manual";

export interface PaymentProviderConfig {
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  [key: string]: unknown;
}

export interface FraudDetectionConfig {
  enabled: boolean;
  maxFraudScore: number;
  velocityCheckWindow: number; // seconds
  maxAttributionsPerWindow: number;
}

// ============== Payment Events ==============

export const PaymentEventSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  metadata: z.object({
    campaignId: z.string(),
    affiliateId: z.string(),
    customerId: z.string().optional(),
  }),
  createdAt: z.date(),
});

export type PaymentEvent = z.infer<typeof PaymentEventSchema>;

// ============== Attribution Events ==============

export interface AttributionEvent {
  campaignId: string;
  affiliateId: string;
  actionValue: number; // in smallest unit (e.g., cents)
  customerHash: Uint8Array;
  nonce: Uint8Array;
  fraudScore: number;
  metadata?: Record<string, unknown>;
}

export interface AttributionResult {
  success: boolean;
  transactionSignature?: string;
  attributionId?: string;
  error?: string;
}

// ============== Fraud Detection ==============

export interface FraudCheckResult {
  score: number; // 0-100
  flags: FraudFlag[];
  recommendation: "approve" | "review" | "reject";
}

export enum FraudFlag {
  HighVelocity = "high_velocity",
  DuplicateCustomer = "duplicate_customer",
  SuspiciousIP = "suspicious_ip",
  BotDetected = "bot_detected",
  GeoMismatch = "geo_mismatch",
  DisposableEmail = "disposable_email",
  DeviceAnomaly = "device_anomaly",
}

export interface FraudCheckInput {
  campaignId: string;
  affiliateId: string;
  customerId?: string;
  customerEmail?: string;
  customerIP?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

// ============== Webhook Handlers ==============

export interface WebhookHandler {
  provider: PaymentProviderType;
  verify(payload: unknown, signature: string): boolean;
  parse(payload: unknown): PaymentEvent | null;
}

// ============== Bridge Status ==============

export interface BridgeStatus {
  isHealthy: boolean;
  solanaConnected: boolean;
  paymentProviderConnected: boolean;
  redisConnected: boolean;
  queueSize: number;
  stats: BridgeStats;
}

export interface BridgeStats {
  totalAttributions: number;
  totalVolume: number; // in USD cents
  todayAttributions: number;
  todayVolume: number;
  fraudRejections: number;
  averageFraudScore: number;
}
