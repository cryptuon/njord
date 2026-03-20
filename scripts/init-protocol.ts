/**
 * Initialize Njord Protocol on Devnet or Mainnet
 *
 * Usage:
 *   npx ts-node scripts/init-protocol.ts --network devnet
 *   npx ts-node scripts/init-protocol.ts --network mainnet
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, BN, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, clusterApiUrl } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// Program ID (deployed)
const PROGRAM_ID = new PublicKey("Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv");

// Configuration
const CONFIG = {
  devnet: {
    rpcUrl: "https://api.devnet.solana.com",
    walletPath: "~/.config/solana/njord-devnet-deployer.json",
    // Devnet NJORD mint - create a mock token for testing
    njordMint: null as PublicKey | null, // Will be created if null
    // Treasury - deployer address by default
    treasury: null as PublicKey | null, // Will use deployer if null
    // Protocol fee: 2.5% (250 basis points)
    protocolFeeBps: 250,
    // Minimum challenge bond: 100 USDC (6 decimals)
    minChallengeBond: 100_000_000,
  },
  mainnet: {
    rpcUrl: "https://api.mainnet-beta.solana.com",
    walletPath: "~/.config/solana/njord-mainnet-deployer.json",
    // Mainnet NJORD mint - must be specified
    njordMint: null as PublicKey | null,
    // Treasury - multi-sig or DAO treasury
    treasury: null as PublicKey | null,
    // Protocol fee: 2.5% (250 basis points)
    protocolFeeBps: 250,
    // Minimum challenge bond: 100 USDC (6 decimals)
    minChallengeBond: 100_000_000,
  },
};

interface InitArgs {
  network: "devnet" | "mainnet";
}

function parseArgs(): InitArgs {
  const args = process.argv.slice(2);
  let network: "devnet" | "mainnet" = "devnet";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--network" && args[i + 1]) {
      if (args[i + 1] === "mainnet") {
        network = "mainnet";
      } else if (args[i + 1] === "devnet") {
        network = "devnet";
      }
    }
  }

  return { network };
}

function loadWallet(walletPath: string): Keypair {
  const expandedPath = walletPath.replace("~", process.env.HOME || "");
  const secretKey = JSON.parse(fs.readFileSync(expandedPath, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

async function createMockMint(
  provider: AnchorProvider,
  authority: Keypair
): Promise<PublicKey> {
  const { Token, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");

  console.log("Creating mock NJORD mint for devnet...");

  const mint = await Token.createMint(
    provider.connection,
    authority,
    authority.publicKey,
    null,
    9, // 9 decimals like SOL
    TOKEN_PROGRAM_ID
  );

  console.log(`Mock NJORD mint created: ${mint.publicKey.toBase58()}`);
  return mint.publicKey;
}

async function main() {
  const { network } = parseArgs();
  const config = CONFIG[network];

  console.log(`\n========================================`);
  console.log(`  Njord Protocol Initialization`);
  console.log(`  Network: ${network.toUpperCase()}`);
  console.log(`========================================\n`);

  // Safety check for mainnet
  if (network === "mainnet") {
    console.log("WARNING: Mainnet deployment requires:");
    console.log("  - Valid NJORD mint address");
    console.log("  - Treasury multi-sig address");
    console.log("  - Audit completion");
    console.log("");

    if (!config.njordMint || !config.treasury) {
      console.error("ERROR: Mainnet requires njordMint and treasury to be set");
      process.exit(1);
    }
  }

  // Load wallet
  const wallet = loadWallet(config.walletPath);
  console.log(`Authority: ${wallet.publicKey.toBase58()}`);

  // Create connection and provider
  const connection = new Connection(config.rpcUrl, "confirmed");
  const provider = new AnchorProvider(
    connection,
    new Wallet(wallet),
    { commitment: "confirmed" }
  );

  // Load IDL
  const idlPath = path.join(__dirname, "../target/idl/njord.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));

  // Create program interface
  const program = new Program(idl, provider);

  // Get or create NJORD mint
  let njordMint = config.njordMint;
  if (!njordMint && network === "devnet") {
    // For devnet, we'll use a placeholder mint
    // In real deployment, create or specify the actual NJORD token mint
    njordMint = Keypair.generate().publicKey;
    console.log(`Using placeholder NJORD mint: ${njordMint.toBase58()}`);
    console.log("NOTE: Replace with actual NJORD mint for production use");
  }

  if (!njordMint) {
    console.error("ERROR: NJORD mint address required");
    process.exit(1);
  }

  // Get or set treasury
  let treasury = config.treasury || wallet.publicKey;
  console.log(`Treasury: ${treasury.toBase58()}`);

  // Derive protocol config PDA
  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("protocol_config")],
    PROGRAM_ID
  );
  console.log(`Protocol Config PDA: ${configPDA.toBase58()}`);

  // Check if already initialized
  const existingConfig = await connection.getAccountInfo(configPDA);
  if (existingConfig) {
    console.log("\nProtocol already initialized!");
    console.log("Account data length:", existingConfig.data.length);
    return;
  }

  console.log(`\nInitializing protocol with:`);
  console.log(`  Protocol Fee: ${config.protocolFeeBps / 100}%`);
  console.log(`  Min Challenge Bond: ${config.minChallengeBond / 1_000_000} USDC`);

  try {
    const tx = await program.methods
      .initialize(config.protocolFeeBps, new BN(config.minChallengeBond))
      .accounts({
        authority: wallet.publicKey,
        config: configPDA,
        treasury: treasury,
        njordMint: njordMint,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();

    console.log(`\nInitialization successful!`);
    console.log(`Transaction: ${tx}`);
    console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=${network}`);

    // Verify initialization
    const configAccount = await connection.getAccountInfo(configPDA);
    if (configAccount) {
      console.log(`\nProtocol Config created:`);
      console.log(`  Address: ${configPDA.toBase58()}`);
      console.log(`  Data length: ${configAccount.data.length} bytes`);
    }

  } catch (error) {
    console.error("\nInitialization failed:", error);
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`  Initialization Complete!`);
  console.log(`========================================\n`);
}

main().catch(console.error);
