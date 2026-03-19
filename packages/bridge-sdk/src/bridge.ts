import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { NjordClient, NJORD_PROGRAM_ID, BN } from "@njord/sdk";
import { EventEmitter } from "events";
import {
  BridgeConfig,
  AttributionEvent,
  AttributionResult,
  BridgeStatus,
  BridgeStats,
  FraudCheckInput,
  FraudCheckResult,
  FraudFlag,
  PaymentEvent,
} from "./types";

export class NjordBridge extends EventEmitter {
  private config: BridgeConfig;
  private client: NjordClient;
  private connection: Connection;
  private bridgeKeypair: Keypair;
  private stats: BridgeStats;
  private isRunning: boolean = false;

  constructor(config: BridgeConfig) {
    super();
    this.config = config;
    this.bridgeKeypair = config.bridgeKeypair;
    this.connection = new Connection(config.solanaRpc, "confirmed");
    this.client = new NjordClient({
      connection: this.connection,
      programId: config.programId ?? NJORD_PROGRAM_ID,
    });
    this.stats = {
      totalAttributions: 0,
      totalVolume: 0,
      todayAttributions: 0,
      todayVolume: 0,
      fraudRejections: 0,
      averageFraudScore: 0,
    };
  }

  // ============== Lifecycle ==============

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Bridge is already running");
    }

    // Verify Solana connection
    const version = await this.connection.getVersion();
    console.log(`Connected to Solana: ${version["solana-core"]}`);

    // Verify bridge is registered on-chain
    const bridgePDA = this.client.getBridgePDA(this.bridgeKeypair.publicKey);
    const bridgeAccount = await this.connection.getAccountInfo(bridgePDA[0]);
    if (!bridgeAccount) {
      console.warn("Bridge not registered on-chain. Register before processing attributions.");
    }

    this.isRunning = true;
    this.emit("started");
    console.log("Njord Bridge started");
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.emit("stopped");
    console.log("Njord Bridge stopped");
  }

  // ============== Attribution Processing ==============

  async processAttribution(event: AttributionEvent): Promise<AttributionResult> {
    if (!this.isRunning) {
      return { success: false, error: "Bridge is not running" };
    }

    try {
      // Run fraud check
      const fraudCheck = await this.checkFraud({
        campaignId: event.campaignId,
        affiliateId: event.affiliateId,
        customerId: Buffer.from(event.customerHash).toString("hex"),
      });

      // Reject if fraud score too high
      if (
        this.config.fraudDetection?.enabled &&
        fraudCheck.score > (this.config.fraudDetection.maxFraudScore ?? 80)
      ) {
        this.stats.fraudRejections++;
        this.emit("fraudRejected", { event, fraudCheck });
        return {
          success: false,
          error: `Fraud score too high: ${fraudCheck.score}`,
        };
      }

      // Submit to Solana
      const result = await this.submitAttribution({
        ...event,
        fraudScore: fraudCheck.score,
      });

      if (result.success) {
        this.stats.totalAttributions++;
        this.stats.todayAttributions++;
        this.stats.totalVolume += event.actionValue;
        this.stats.todayVolume += event.actionValue;
        this.updateAverageFraudScore(fraudCheck.score);
        this.emit("attributionProcessed", { event, result });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.emit("error", { event, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  private async submitAttribution(event: AttributionEvent): Promise<AttributionResult> {
    // In production, this would build and send the Solana transaction
    // For now, return a mock success
    console.log("Submitting attribution to Solana:", {
      campaign: event.campaignId,
      affiliate: event.affiliateId,
      value: event.actionValue,
      fraudScore: event.fraudScore,
    });

    // TODO: Build actual Solana transaction using Anchor
    // const tx = await this.program.methods
    //   .recordAttribution({
    //     actionValue: new BN(event.actionValue),
    //     customerHash: event.customerHash,
    //     nonce: event.nonce,
    //     fraudScore: event.fraudScore,
    //   })
    //   .accounts({...})
    //   .signers([this.bridgeKeypair])
    //   .rpc();

    return {
      success: true,
      transactionSignature: "mock_signature_" + Date.now(),
      attributionId: `attr_${event.campaignId}_${Date.now()}`,
    };
  }

  // ============== Fraud Detection ==============

  async checkFraud(input: FraudCheckInput): Promise<FraudCheckResult> {
    const flags: FraudFlag[] = [];
    let score = 0;

    // Velocity check
    if (this.config.fraudDetection?.enabled) {
      const recentCount = await this.getRecentAttributionCount(
        input.affiliateId,
        this.config.fraudDetection.velocityCheckWindow ?? 3600
      );

      if (recentCount > (this.config.fraudDetection.maxAttributionsPerWindow ?? 100)) {
        flags.push(FraudFlag.HighVelocity);
        score += 30;
      }
    }

    // IP check (placeholder)
    if (input.customerIP) {
      // Check against known bad IPs, data centers, etc.
      // score += ipCheckScore;
    }

    // Email check (placeholder)
    if (input.customerEmail) {
      // Check for disposable email domains
      const disposableDomains = ["tempmail.com", "throwaway.com", "mailinator.com"];
      const domain = input.customerEmail.split("@")[1];
      if (disposableDomains.includes(domain)) {
        flags.push(FraudFlag.DisposableEmail);
        score += 25;
      }
    }

    // Determine recommendation
    let recommendation: "approve" | "review" | "reject";
    if (score < 30) {
      recommendation = "approve";
    } else if (score < 60) {
      recommendation = "review";
    } else {
      recommendation = "reject";
    }

    return { score, flags, recommendation };
  }

  private async getRecentAttributionCount(
    affiliateId: string,
    windowSeconds: number
  ): Promise<number> {
    // In production, query Redis or database
    // For now, return 0
    return 0;
  }

  private updateAverageFraudScore(newScore: number): void {
    const total = this.stats.totalAttributions;
    this.stats.averageFraudScore =
      (this.stats.averageFraudScore * (total - 1) + newScore) / total;
  }

  // ============== Payment Webhook Handling ==============

  async handlePaymentWebhook(event: PaymentEvent): Promise<AttributionResult> {
    if (event.status !== "completed") {
      return { success: false, error: `Payment not completed: ${event.status}` };
    }

    const { campaignId, affiliateId, customerId } = event.metadata;

    // Generate customer hash from ID
    const customerHash = this.client.hashCustomer(customerId ?? event.id);
    const nonce = this.client.generateNonce();

    return this.processAttribution({
      campaignId,
      affiliateId,
      actionValue: event.amount,
      customerHash,
      nonce,
      fraudScore: 0, // Will be calculated in processAttribution
    });
  }

  // ============== Status & Health ==============

  async getStatus(): Promise<BridgeStatus> {
    let solanaConnected = false;
    try {
      await this.connection.getSlot();
      solanaConnected = true;
    } catch {
      solanaConnected = false;
    }

    return {
      isHealthy: this.isRunning && solanaConnected,
      solanaConnected,
      paymentProviderConnected: true, // Placeholder
      redisConnected: !!this.config.redisUrl, // Placeholder
      queueSize: 0, // Placeholder
      stats: { ...this.stats },
    };
  }

  getStats(): BridgeStats {
    return { ...this.stats };
  }

  // Reset daily stats (call via cron)
  resetDailyStats(): void {
    this.stats.todayAttributions = 0;
    this.stats.todayVolume = 0;
  }
}

export default NjordBridge;
