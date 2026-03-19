#!/usr/bin/env node

import "dotenv/config";
import { NjordIndexer } from "./indexer";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "./db/schema";

interface Config {
  databaseUrl: string;
  solanaRpc: string;
  programId: string;
  apiPort: number;
  apiHost: string;
  startSlot?: number;
}

function loadConfig(): Config {
  return {
    databaseUrl:
      process.env.DATABASE_URL ?? "postgres://localhost:5432/njord_indexer",
    solanaRpc: process.env.SOLANA_RPC ?? "https://api.devnet.solana.com",
    programId:
      process.env.PROGRAM_ID ?? "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
    apiPort: parseInt(process.env.API_PORT ?? "4000"),
    apiHost: process.env.API_HOST ?? "0.0.0.0",
    startSlot: process.env.START_SLOT
      ? parseInt(process.env.START_SLOT)
      : undefined,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "serve";

  switch (command) {
    case "serve":
      await runServer();
      break;

    case "migrate":
      await runMigrations();
      break;

    case "backfill":
      await runBackfill(args[1] ? parseInt(args[1]) : undefined);
      break;

    case "status":
      await checkStatus();
      break;

    case "help":
    default:
      printHelp();
      break;
  }
}

async function runServer() {
  console.log("Starting Njord Indexer...\n");

  const config = loadConfig();

  console.log(`Database: ${config.databaseUrl.replace(/:[^:@]+@/, ":***@")}`);
  console.log(`Solana RPC: ${config.solanaRpc}`);
  console.log(`Program ID: ${config.programId}`);
  console.log(`API Port: ${config.apiPort}`);
  console.log();

  const indexer = new NjordIndexer({
    database: { connectionString: config.databaseUrl },
    solanaRpc: config.solanaRpc,
    programId: config.programId,
    apiPort: config.apiPort,
    apiHost: config.apiHost,
    startSlot: config.startSlot,
  });

  // Handle shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await indexer.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nShutting down...");
    await indexer.stop();
    process.exit(0);
  });

  await indexer.start();
}

async function runMigrations() {
  console.log("Running database migrations...\n");

  const config = loadConfig();
  const pool = new Pool({ connectionString: config.databaseUrl });

  try {
    const db = drizzle(pool, { schema });

    // Run migrations from drizzle folder
    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("Migrations completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function runBackfill(startSlot?: number) {
  if (!startSlot) {
    console.error("Please provide a start slot: njord-indexer backfill <slot>");
    process.exit(1);
  }

  console.log(`Starting backfill from slot ${startSlot}...\n`);

  const config = loadConfig();

  const indexer = new NjordIndexer({
    database: { connectionString: config.databaseUrl },
    solanaRpc: config.solanaRpc,
    programId: config.programId,
    apiPort: config.apiPort,
    apiHost: config.apiHost,
  });

  // Handle shutdown
  process.on("SIGINT", async () => {
    console.log("\nStopping backfill...");
    await indexer.stop();
    process.exit(0);
  });

  try {
    await indexer.backfill(startSlot);
    console.log("Backfill completed!");
  } finally {
    await indexer.stop();
  }
}

async function checkStatus() {
  const config = loadConfig();

  try {
    const response = await fetch(
      `http://localhost:${config.apiPort}/health`
    );
    const status = await response.json();

    console.log("Indexer Status:");
    console.log("===============");
    console.log(`API Health: ${status.status === "healthy" ? "OK" : "UNHEALTHY"}`);

    // Query GraphQL for global stats
    const gqlResponse = await fetch(
      `http://localhost:${config.apiPort}/graphql`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              globalStats {
                totalCampaigns
                activeCampaigns
                totalAffiliates
                totalBridges
                totalAttributions
                totalVolume
              }
            }
          `,
        }),
      }
    );

    const gqlData = await gqlResponse.json();
    if (gqlData.data?.globalStats) {
      const stats = gqlData.data.globalStats;
      console.log();
      console.log("Global Stats:");
      console.log(`  Campaigns: ${stats.totalCampaigns} (${stats.activeCampaigns} active)`);
      console.log(`  Affiliates: ${stats.totalAffiliates}`);
      console.log(`  Bridges: ${stats.totalBridges}`);
      console.log(`  Attributions: ${stats.totalAttributions}`);
      console.log(`  Total Volume: ${stats.totalVolume}`);
    }
  } catch (err) {
    console.error("Failed to connect to indexer API");
    console.error("Is the indexer running?");
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Njord Indexer CLI

Usage:
  njord-indexer <command> [options]

Commands:
  serve           Start the indexer and API server (default)
  migrate         Run database migrations
  backfill <slot> Backfill events from a specific slot
  status          Check indexer status
  help            Show this help message

Environment Variables:
  DATABASE_URL    PostgreSQL connection string
  SOLANA_RPC      Solana RPC URL
  PROGRAM_ID      Njord program ID
  API_PORT        API server port (default: 4000)
  API_HOST        API server host (default: 0.0.0.0)
  START_SLOT      Start indexing from this slot

Examples:
  # Run migrations
  njord-indexer migrate

  # Start indexer
  njord-indexer serve

  # Backfill from slot
  njord-indexer backfill 200000000

  # Check status
  njord-indexer status
`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
