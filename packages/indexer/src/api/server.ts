import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express, { Express } from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import { typeDefs } from "./schema";
import { createResolvers } from "./resolvers";
import { Database } from "../db";

export interface ApiServerConfig {
  db: Database;
  port?: number;
  host?: string;
  corsOrigins?: string[];
}

export class ApiServer {
  private app: Express;
  private apollo: ApolloServer;
  private db: Database;
  private logger: pino.Logger;
  private port: number;
  private host: string;

  constructor(config: ApiServerConfig) {
    this.db = config.db;
    this.port = config.port ?? 4000;
    this.host = config.host ?? "0.0.0.0";
    this.logger = pino({ name: "njord-indexer-api" });

    // Create Apollo Server
    this.apollo = new ApolloServer({
      typeDefs,
      resolvers: createResolvers(this.db),
    });

    // Create Express app
    this.app = express();
    this.app.use(cors({ origin: config.corsOrigins ?? "*" }));
    this.app.use(pinoHttp({ logger: this.logger }));

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({ status: "healthy" });
    });
  }

  async start(): Promise<void> {
    // Start Apollo Server
    await this.apollo.start();

    // Mount GraphQL middleware
    this.app.use(
      "/graphql",
      express.json(),
      expressMiddleware(this.apollo, {
        context: async () => ({ db: this.db }),
      })
    );

    // Start Express server
    return new Promise((resolve) => {
      this.app.listen(this.port, this.host, () => {
        this.logger.info(
          `Indexer API running at http://${this.host}:${this.port}/graphql`
        );
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    await this.apollo.stop();
  }

  getApp(): Express {
    return this.app;
  }
}
