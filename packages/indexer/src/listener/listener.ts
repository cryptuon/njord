import {
  Connection,
  PublicKey,
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
  Commitment,
} from "@solana/web3.js";
import pino from "pino";
import { NjordEventParser } from "./parser";
import { NjordEvent, EventHandler, ListenerConfig } from "./types";

export class NjordListener {
  private connection: Connection;
  private programId: PublicKey;
  private parser: NjordEventParser;
  private logger: pino.Logger;
  private handlers: EventHandler[] = [];
  private isRunning = false;
  private lastProcessedSlot: number = 0;
  private commitment: Commitment;
  private subscriptionId: number | null = null;

  constructor(config: ListenerConfig) {
    this.connection = new Connection(config.solanaRpc, {
      commitment: config.commitment ?? "confirmed",
    });
    this.programId =
      typeof config.programId === "string"
        ? new PublicKey(config.programId)
        : config.programId;
    this.parser = new NjordEventParser(this.programId);
    this.logger = pino({ name: "njord-listener" });
    this.lastProcessedSlot = config.startSlot ?? 0;
    this.commitment = config.commitment ?? "confirmed";
  }

  /**
   * Add event handler
   */
  onEvent(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Start listening for events
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn("Listener already running");
      return;
    }

    this.isRunning = true;
    this.logger.info(
      { programId: this.programId.toBase58() },
      "Starting event listener"
    );

    // Subscribe to program logs
    this.subscriptionId = this.connection.onLogs(
      this.programId,
      async (logInfo) => {
        try {
          await this.processLogInfo(logInfo);
        } catch (err) {
          this.logger.error({ err, signature: logInfo.signature }, "Error processing logs");
        }
      },
      this.commitment
    );

    this.logger.info("Log subscription active");

    // If we have a start slot, backfill historical events
    if (this.lastProcessedSlot > 0) {
      await this.backfillFromSlot(this.lastProcessedSlot);
    }
  }

  /**
   * Stop listening
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.subscriptionId !== null) {
      await this.connection.removeOnLogsListener(this.subscriptionId);
      this.subscriptionId = null;
    }

    this.logger.info("Event listener stopped");
  }

  /**
   * Process log info from subscription
   */
  private async processLogInfo(logInfo: {
    signature: string;
    err: unknown;
    logs: string[];
  }): Promise<void> {
    if (logInfo.err) {
      this.logger.debug({ signature: logInfo.signature }, "Skipping failed transaction");
      return;
    }

    // Get transaction details for slot and block time
    const tx = await this.connection.getTransaction(logInfo.signature, {
      commitment: this.commitment,
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      this.logger.warn({ signature: logInfo.signature }, "Transaction not found");
      return;
    }

    const events = this.parser.parseFromLogs(
      logInfo.logs,
      tx.slot,
      logInfo.signature,
      tx.blockTime
    );

    for (const event of events) {
      await this.emitEvent(event);
    }

    this.lastProcessedSlot = Math.max(this.lastProcessedSlot, tx.slot);
  }

  /**
   * Backfill events from a specific slot
   */
  async backfillFromSlot(startSlot: number): Promise<void> {
    this.logger.info({ startSlot }, "Starting backfill");

    let lastSignature: string | undefined;
    let totalProcessed = 0;

    while (this.isRunning) {
      const signatures = await this.connection.getSignaturesForAddress(
        this.programId,
        {
          before: lastSignature,
          limit: 100,
        },
        this.commitment
      );

      if (signatures.length === 0) break;

      // Filter to signatures after our start slot
      const relevantSignatures = signatures.filter((sig) => sig.slot >= startSlot);

      if (relevantSignatures.length === 0) {
        // We've gone past our start slot
        break;
      }

      // Process in batches
      for (const sigInfo of relevantSignatures) {
        await this.processSignature(sigInfo);
        totalProcessed++;
      }

      lastSignature = signatures[signatures.length - 1].signature;

      this.logger.info(
        { processed: totalProcessed, lastSlot: signatures[signatures.length - 1].slot },
        "Backfill progress"
      );
    }

    this.logger.info({ totalProcessed }, "Backfill complete");
  }

  /**
   * Process a single transaction signature
   */
  private async processSignature(sigInfo: ConfirmedSignatureInfo): Promise<void> {
    if (sigInfo.err) return;

    const tx = await this.connection.getParsedTransaction(sigInfo.signature, {
      commitment: this.commitment,
      maxSupportedTransactionVersion: 0,
    });

    if (!tx?.meta?.logMessages) return;

    const events = this.parser.parseFromLogs(
      tx.meta.logMessages,
      sigInfo.slot,
      sigInfo.signature,
      sigInfo.blockTime
    );

    for (const event of events) {
      await this.emitEvent(event);
    }
  }

  /**
   * Emit event to all handlers
   */
  private async emitEvent(event: NjordEvent): Promise<void> {
    this.logger.debug(
      { type: event.type, signature: event.signature },
      "Emitting event"
    );

    for (const handler of this.handlers) {
      try {
        await handler(event);
      } catch (err) {
        this.logger.error(
          { err, type: event.type, signature: event.signature },
          "Event handler error"
        );
      }
    }
  }

  /**
   * Get current connection status
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    lastProcessedSlot: number;
    currentSlot: number;
    programId: string;
  }> {
    const currentSlot = await this.connection.getSlot();

    return {
      isRunning: this.isRunning,
      lastProcessedSlot: this.lastProcessedSlot,
      currentSlot,
      programId: this.programId.toBase58(),
    };
  }
}

export { NjordEventParser } from "./parser";
export * from "./types";
