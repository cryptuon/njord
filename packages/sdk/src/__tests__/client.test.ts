import { describe, it, expect, vi, beforeEach } from "vitest";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { NjordClient, NJORD_PROGRAM_ID } from "../client";
import { SEEDS } from "../types";

// Create a deterministic keypair from a seed string
function keypairFromSeed(seed: string): Keypair {
  const seedBytes = new Uint8Array(32);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(seed);
  for (let i = 0; i < Math.min(encoded.length, 32); i++) {
    seedBytes[i] = encoded[i];
  }
  return Keypair.fromSeed(seedBytes);
}

// Create a mock connection
function createMockConnection(): Connection {
  return {
    getAccountInfo: vi.fn().mockResolvedValue(null),
    getBalance: vi.fn().mockResolvedValue(1000000000),
    getLatestBlockhash: vi.fn().mockResolvedValue({
      blockhash: "mock-blockhash",
      lastValidBlockHeight: 1000,
    }),
    getRecentBlockhash: vi.fn().mockResolvedValue({
      blockhash: "mock-blockhash",
      feeCalculator: { lamportsPerSignature: 5000 },
    }),
    sendRawTransaction: vi.fn().mockResolvedValue("mock-signature"),
    confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
    rpcEndpoint: "https://api.devnet.solana.com",
  } as unknown as Connection;
}

describe("NjordClient", () => {
  let client: NjordClient;
  let mockConnection: Connection;

  beforeEach(() => {
    mockConnection = createMockConnection();
    client = new NjordClient({
      connection: mockConnection,
    });
  });

  describe("constructor", () => {
    it("creates client with default program ID", () => {
      expect(client).toBeDefined();
      expect(client.programId.equals(NJORD_PROGRAM_ID)).toBe(true);
    });

    it("creates client with custom program ID", () => {
      const customProgramId = Keypair.generate().publicKey;
      const customClient = new NjordClient({
        connection: mockConnection,
        programId: customProgramId,
      });
      expect(customClient.programId.equals(customProgramId)).toBe(true);
    });

    it("creates client without wallet (read-only)", () => {
      const readOnlyClient = new NjordClient({
        connection: mockConnection,
      });
      expect(readOnlyClient.wallet).toBeUndefined();
    });
  });

  describe("PDA derivation", () => {
    it("derives protocol config PDA correctly", () => {
      const [expectedPda] = PublicKey.findProgramAddressSync(
        [SEEDS.PROTOCOL_CONFIG],
        NJORD_PROGRAM_ID
      );

      const [derivedPda] = client.getProtocolConfigPDA();
      expect(derivedPda.equals(expectedPda)).toBe(true);
    });

    it("derives campaign PDA correctly", () => {
      const campaignId = new BN(1);

      const [expectedPda] = PublicKey.findProgramAddressSync(
        [SEEDS.CAMPAIGN, campaignId.toArrayLike(Buffer, "le", 8)],
        NJORD_PROGRAM_ID
      );

      const [derivedPda] = client.getCampaignPDA(campaignId);
      expect(derivedPda.equals(expectedPda)).toBe(true);
    });

    it("derives affiliate profile PDA correctly", () => {
      const wallet = keypairFromSeed("affiliate").publicKey;

      const [expectedPda] = PublicKey.findProgramAddressSync(
        [SEEDS.AFFILIATE_PROFILE, wallet.toBuffer()],
        NJORD_PROGRAM_ID
      );

      const [derivedPda] = client.getAffiliateProfilePDA(wallet);
      expect(derivedPda.equals(expectedPda)).toBe(true);
    });

    it("derives bridge PDA correctly", () => {
      const operator = keypairFromSeed("bridge").publicKey;

      const [expectedPda] = PublicKey.findProgramAddressSync(
        [SEEDS.BRIDGE, operator.toBuffer()],
        NJORD_PROGRAM_ID
      );

      const [derivedPda] = client.getBridgePDA(operator);
      expect(derivedPda.equals(expectedPda)).toBe(true);
    });

    it("derives escrow PDA correctly", () => {
      const campaign = keypairFromSeed("campaign").publicKey;

      const [expectedPda] = PublicKey.findProgramAddressSync(
        [SEEDS.ESCROW, campaign.toBuffer()],
        NJORD_PROGRAM_ID
      );

      const [derivedPda] = client.getEscrowPDA(campaign);
      expect(derivedPda.equals(expectedPda)).toBe(true);
    });

    it("derives affiliate registration PDA correctly", () => {
      const campaign = keypairFromSeed("campaign").publicKey;
      const affiliateProfile = keypairFromSeed("affiliate").publicKey;

      const [expectedPda] = PublicKey.findProgramAddressSync(
        [
          SEEDS.AFFILIATE_REGISTRATION,
          campaign.toBuffer(),
          affiliateProfile.toBuffer(),
        ],
        NJORD_PROGRAM_ID
      );

      const [derivedPda] = client.getAffiliateRegistrationPDA(
        campaign,
        affiliateProfile
      );
      expect(derivedPda.equals(expectedPda)).toBe(true);
    });

    it("derives challenge PDA correctly", () => {
      const attribution = keypairFromSeed("attribution").publicKey;

      const [expectedPda] = PublicKey.findProgramAddressSync(
        [SEEDS.CHALLENGE, attribution.toBuffer()],
        NJORD_PROGRAM_ID
      );

      const [derivedPda] = client.getChallengePDA(attribution);
      expect(derivedPda.equals(expectedPda)).toBe(true);
    });

    it("derives attribution PDA correctly", () => {
      const campaign = keypairFromSeed("campaign").publicKey;
      const nonce = new Uint8Array(16).fill(42);

      const [expectedPda] = PublicKey.findProgramAddressSync(
        [SEEDS.ATTRIBUTION, campaign.toBuffer(), Buffer.from(nonce)],
        NJORD_PROGRAM_ID
      );

      const [derivedPda] = client.getAttributionPDA(campaign, nonce);
      expect(derivedPda.equals(expectedPda)).toBe(true);
    });
  });

  describe("utility functions", () => {
    it("generates nonce of correct length", () => {
      const nonce = client.generateNonce();
      expect(nonce.length).toBe(16);
    });

    it("generates unique nonces", () => {
      const nonce1 = client.generateNonce();
      const nonce2 = client.generateNonce();
      expect(Buffer.from(nonce1).toString("hex")).not.toBe(
        Buffer.from(nonce2).toString("hex")
      );
    });

    it("hashes customer identifier to 32 bytes", () => {
      const hash = client.hashCustomer("customer@example.com");
      expect(hash.length).toBe(32);
    });

    it("produces deterministic hashes", () => {
      const hash1 = client.hashCustomer("customer123");
      const hash2 = client.hashCustomer("customer123");
      expect(Buffer.from(hash1).toString("hex")).toBe(
        Buffer.from(hash2).toString("hex")
      );
    });

    it("produces different hashes for different inputs", () => {
      const hash1 = client.hashCustomer("customer123");
      const hash2 = client.hashCustomer("customer456");
      expect(Buffer.from(hash1).toString("hex")).not.toBe(
        Buffer.from(hash2).toString("hex")
      );
    });

    it("calculates commission correctly", () => {
      const value = new BN(10000); // $100 in cents
      const rateBps = 1000; // 10%
      const commission = client.calculateCommission(value, rateBps);
      expect(commission.toNumber()).toBe(1000); // $10 in cents
    });

    it("calculates commission with different rates", () => {
      const value = new BN(50000); // $500 in cents
      const rateBps = 500; // 5%
      const commission = client.calculateCommission(value, rateBps);
      expect(commission.toNumber()).toBe(2500); // $25 in cents
    });
  });

  describe("static factory methods", () => {
    it("creates client from connection", () => {
      const newClient = NjordClient.fromConnection(mockConnection);
      expect(newClient).toBeInstanceOf(NjordClient);
      expect(newClient.connection).toBe(mockConnection);
    });

    it("creates client from URL", () => {
      const newClient = NjordClient.fromUrl("https://api.devnet.solana.com");
      expect(newClient).toBeInstanceOf(NjordClient);
    });
  });
});

describe("NJORD_PROGRAM_ID", () => {
  it("exports a valid PublicKey", () => {
    expect(NJORD_PROGRAM_ID).toBeDefined();
    expect(NJORD_PROGRAM_ID).toBeInstanceOf(PublicKey);
  });

  it("is a valid base58 string", () => {
    expect(() => new PublicKey(NJORD_PROGRAM_ID.toBase58())).not.toThrow();
  });
});
