#!/usr/bin/env node

import { Keypair, Connection } from "@solana/web3.js";
import { NjordBridge } from "./bridge";
import { BridgeServer } from "./api/server";
import fs from "fs";
import path from "path";

interface Config {
  solanaRpc: string;
  keypairPath: string;
  port: number;
  host: string;
  redisUrl?: string;
  stripe?: {
    secretKey: string;
    webhookSecret: string;
  };
  razorpay?: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  };
  fraudDetection?: {
    enabled: boolean;
    maxFraudScore: number;
  };
}

function loadConfig(): Config {
  const configPath = process.env.NJORD_CONFIG ?? "./njord-bridge.json";

  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  }

  // Fall back to environment variables
  return {
    solanaRpc: process.env.SOLANA_RPC ?? "https://api.devnet.solana.com",
    keypairPath: process.env.KEYPAIR_PATH ?? "./bridge-keypair.json",
    port: parseInt(process.env.PORT ?? "3000"),
    host: process.env.HOST ?? "0.0.0.0",
    redisUrl: process.env.REDIS_URL,
    stripe: process.env.STRIPE_SECRET_KEY
      ? {
          secretKey: process.env.STRIPE_SECRET_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
        }
      : undefined,
    razorpay: process.env.RAZORPAY_KEY_ID
      ? {
          keyId: process.env.RAZORPAY_KEY_ID,
          keySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
          webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
        }
      : undefined,
    fraudDetection: {
      enabled: process.env.FRAUD_DETECTION_ENABLED === "true",
      maxFraudScore: parseInt(process.env.MAX_FRAUD_SCORE ?? "80"),
    },
  };
}

function loadKeypair(keypairPath: string): Keypair {
  if (!fs.existsSync(keypairPath)) {
    console.log(`Keypair not found at ${keypairPath}, generating new one...`);
    const keypair = Keypair.generate();
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
    console.log(`New keypair generated: ${keypair.publicKey.toBase58()}`);
    return keypair;
  }

  const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "serve";

  switch (command) {
    case "serve":
      await runServer();
      break;

    case "init":
      await initConfig();
      break;

    case "keygen":
      await generateKeypair(args[1]);
      break;

    case "status":
      await checkStatus(args[1]);
      break;

    case "help":
    default:
      printHelp();
      break;
  }
}

async function runServer() {
  console.log("Starting Njord Bridge Server...\n");

  const config = loadConfig();
  const keypair = loadKeypair(config.keypairPath);

  console.log(`Bridge Operator: ${keypair.publicKey.toBase58()}`);
  console.log(`Solana RPC: ${config.solanaRpc}`);
  console.log(`Port: ${config.port}`);
  console.log(`Stripe: ${config.stripe ? "Configured" : "Not configured"}`);
  console.log(`Razorpay: ${config.razorpay ? "Configured" : "Not configured"}`);
  console.log();

  const bridge = new NjordBridge({
    solanaRpc: config.solanaRpc,
    bridgeKeypair: keypair,
    paymentProvider: config.stripe ? "stripe" : config.razorpay ? "razorpay" : "manual",
    paymentProviderConfig: {},
    redisUrl: config.redisUrl,
    fraudDetection: config.fraudDetection,
  });

  const server = new BridgeServer({
    bridge,
    port: config.port,
    host: config.host,
    stripe: config.stripe,
    razorpay: config.razorpay,
  });

  // Handle shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await bridge.stop();
    process.exit(0);
  });

  await server.start();
}

async function initConfig() {
  const configPath = "./njord-bridge.json";

  if (fs.existsSync(configPath)) {
    console.log(`Config already exists at ${configPath}`);
    return;
  }

  const defaultConfig: Config = {
    solanaRpc: "https://api.devnet.solana.com",
    keypairPath: "./bridge-keypair.json",
    port: 3000,
    host: "0.0.0.0",
    redisUrl: "redis://localhost:6379",
    stripe: {
      secretKey: "sk_test_...",
      webhookSecret: "whsec_...",
    },
    razorpay: {
      keyId: "rzp_test_...",
      keySecret: "...",
      webhookSecret: "...",
    },
    fraudDetection: {
      enabled: true,
      maxFraudScore: 80,
    },
  };

  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log(`Config created at ${configPath}`);
  console.log("Edit the file with your credentials before starting the server.");
}

async function generateKeypair(outputPath?: string) {
  const keypairPath = outputPath ?? "./bridge-keypair.json";
  const keypair = Keypair.generate();

  fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));

  console.log(`Keypair generated successfully!`);
  console.log(`Public Key: ${keypair.publicKey.toBase58()}`);
  console.log(`Saved to: ${keypairPath}`);
  console.log();
  console.log("IMPORTANT: Keep this file secure. Anyone with access can operate your bridge.");
}

async function checkStatus(url?: string) {
  const baseUrl = url ?? "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/status`);
    const status = await response.json();

    console.log("Bridge Status:");
    console.log("==============");
    console.log(`Healthy: ${status.isHealthy ? "Yes" : "No"}`);
    console.log(`Solana Connected: ${status.solanaConnected ? "Yes" : "No"}`);
    console.log(`Redis Connected: ${status.redisConnected ? "Yes" : "No"}`);
    console.log();
    console.log("Stats:");
    console.log(`  Total Attributions: ${status.stats.totalAttributions}`);
    console.log(`  Total Volume: $${(status.stats.totalVolume / 100).toFixed(2)}`);
    console.log(`  Today Attributions: ${status.stats.todayAttributions}`);
    console.log(`  Today Volume: $${(status.stats.todayVolume / 100).toFixed(2)}`);
    console.log(`  Fraud Rejections: ${status.stats.fraudRejections}`);
  } catch (err) {
    console.error(`Failed to connect to bridge at ${baseUrl}`);
    console.error("Is the bridge server running?");
  }
}

function printHelp() {
  console.log(`
Njord Bridge CLI

Usage:
  njord-bridge <command> [options]

Commands:
  serve           Start the bridge API server (default)
  init            Create a default configuration file
  keygen [path]   Generate a new bridge keypair
  status [url]    Check bridge status
  help            Show this help message

Environment Variables:
  NJORD_CONFIG              Path to config file (default: ./njord-bridge.json)
  SOLANA_RPC                Solana RPC URL
  KEYPAIR_PATH              Path to bridge keypair
  PORT                      Server port (default: 3000)
  REDIS_URL                 Redis connection URL
  STRIPE_SECRET_KEY         Stripe secret key
  STRIPE_WEBHOOK_SECRET     Stripe webhook secret
  RAZORPAY_KEY_ID           Razorpay key ID
  RAZORPAY_KEY_SECRET       Razorpay key secret
  RAZORPAY_WEBHOOK_SECRET   Razorpay webhook secret

Examples:
  # Initialize configuration
  njord-bridge init

  # Generate keypair
  njord-bridge keygen ./my-bridge.json

  # Start server
  njord-bridge serve

  # Check status
  njord-bridge status http://localhost:3000
`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
