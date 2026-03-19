import pino from "pino";
import { createDatabase, Database, DatabaseConfig } from "./db";
import { NjordListener, ListenerConfig } from "./listener";
import { EventHandler } from "./handlers";
import { ApiServer, ApiServerConfig } from "./api";
import { Pool } from "pg";

export interface IndexerConfig {
  // Database
  database: DatabaseConfig;

  // Solana
  solanaRpc: string;
  programId: string;
  startSlot?: number;

  // API
  apiPort?: number;
  apiHost?: string;
  corsOrigins?: string[];
}

export class NjordIndexer {
  private db: Database;
  private pool: Pool;
  private listener: NjordListener;
  private eventHandler: EventHandler;
  private apiServer: ApiServer;
  private logger: pino.Logger;
  private isRunning = false;

  constructor(config: IndexerConfig) {
    this.logger = pino({ name: "njord-indexer" });

    // Initialize database
    const { db, pool } = createDatabase(config.database);
    this.db = db;
    this.pool = pool;

    // Initialize event handler
    this.eventHandler = new EventHandler(this.db);

    // Initialize Solana listener
    this.listener = new NjordListener({
      solanaRpc: config.solanaRpc,
      programId: config.programId,
      startSlot: config.startSlot,
    });

    // Register event handler
    this.listener.onEvent(this.eventHandler.handle.bind(this.eventHandler));

    // Initialize API server
    this.apiServer = new ApiServer({
      db: this.db,
      port: config.apiPort,
      host: config.apiHost,
      corsOrigins: config.corsOrigins,
    });
  }

  /**
   * Start the indexer
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn("Indexer already running");
      return;
    }

    this.logger.info("Starting Njord Indexer...");
    this.isRunning = true;

    // Test database connection
    try {
      await this.pool.query("SELECT 1");
      this.logger.info("Database connected");
    } catch (err) {
      this.logger.error({ err }, "Failed to connect to database");
      throw err;
    }

    // Start API server
    await this.apiServer.start();
    this.logger.info("API server started");

    // Start Solana listener
    await this.listener.start();
    this.logger.info("Solana listener started");

    this.logger.info("Njord Indexer running");
  }

  /**
   * Stop the indexer
   */
  async stop(): Promise<void> {
    this.logger.info("Stopping Njord Indexer...");
    this.isRunning = false;

    await this.listener.stop();
    await this.apiServer.stop();
    await this.pool.end();

    this.logger.info("Njord Indexer stopped");
  }

  /**
   * Get indexer status
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    database: { connected: boolean };
    listener: {
      isRunning: boolean;
      lastProcessedSlot: number;
      currentSlot: number;
    };
  }> {
    let dbConnected = false;
    try {
      await this.pool.query("SELECT 1");
      dbConnected = true;
    } catch {
      dbConnected = false;
    }

    const listenerStatus = await this.listener.getStatus();

    return {
      isRunning: this.isRunning,
      database: { connected: dbConnected },
      listener: {
        isRunning: listenerStatus.isRunning,
        lastProcessedSlot: listenerStatus.lastProcessedSlot,
        currentSlot: listenerStatus.currentSlot,
      },
    };
  }

  /**
   * Backfill from a specific slot
   */
  async backfill(startSlot: number): Promise<void> {
    this.logger.info({ startSlot }, "Starting backfill");
    await this.listener.backfillFromSlot(startSlot);
    this.logger.info("Backfill complete");
  }
}
