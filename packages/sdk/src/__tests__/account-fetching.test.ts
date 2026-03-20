import { describe, it, expect, vi, beforeEach } from "vitest";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { NjordClient } from "../client";

// Create a mock connection with configurable responses
function createMockConnection(overrides?: Partial<Connection>): Connection {
  return {
    getAccountInfo: vi.fn().mockResolvedValue(null),
    getBalance: vi.fn().mockResolvedValue(1000000000),
    getLatestBlockhash: vi.fn().mockResolvedValue({
      blockhash: "mock-blockhash",
      lastValidBlockHeight: 1000,
    }),
    rpcEndpoint: "https://api.devnet.solana.com",
    ...overrides,
  } as unknown as Connection;
}

describe("Account Fetching", () => {
  let client: NjordClient;
  let mockConnection: Connection;

  beforeEach(() => {
    mockConnection = createMockConnection();
    client = new NjordClient({
      connection: mockConnection,
    });
  });

  describe("getProtocolConfig", () => {
    it("returns null when account does not exist", async () => {
      const result = await client.getProtocolConfig();
      expect(result).toBeNull();
      expect(mockConnection.getAccountInfo).toHaveBeenCalledTimes(1);
    });

    it("calls getAccountInfo with correct PDA", async () => {
      await client.getProtocolConfig();

      const [expectedPda] = client.getProtocolConfigPDA();
      expect(mockConnection.getAccountInfo).toHaveBeenCalledWith(expectedPda);
    });

    it("handles connection errors gracefully", async () => {
      const errorConnection = createMockConnection({
        getAccountInfo: vi.fn().mockRejectedValue(new Error("Connection failed")),
      });
      const errorClient = new NjordClient({ connection: errorConnection });

      const result = await errorClient.getProtocolConfig();
      expect(result).toBeNull();
    });
  });

  describe("getCampaign", () => {
    it("returns null when campaign does not exist", async () => {
      const campaignId = new BN(1);
      const result = await client.getCampaign(campaignId);

      expect(result).toBeNull();
    });

    it("calls getAccountInfo with correct campaign PDA", async () => {
      const campaignId = new BN(42);
      await client.getCampaign(campaignId);

      const [expectedPda] = client.getCampaignPDA(campaignId);
      expect(mockConnection.getAccountInfo).toHaveBeenCalledWith(expectedPda);
    });

    it("handles large campaign IDs", async () => {
      const largeCampaignId = new BN("18446744073709551615"); // Max u64
      const result = await client.getCampaign(largeCampaignId);

      expect(result).toBeNull();
      expect(mockConnection.getAccountInfo).toHaveBeenCalledTimes(1);
    });

    it("handles connection errors gracefully", async () => {
      const errorConnection = createMockConnection({
        getAccountInfo: vi.fn().mockRejectedValue(new Error("RPC timeout")),
      });
      const errorClient = new NjordClient({ connection: errorConnection });

      const result = await errorClient.getCampaign(new BN(1));
      expect(result).toBeNull();
    });
  });

  describe("getAffiliateProfile", () => {
    it("returns null when profile does not exist", async () => {
      const wallet = Keypair.generate().publicKey;
      const result = await client.getAffiliateProfile(wallet);

      expect(result).toBeNull();
    });

    it("calls getAccountInfo with correct affiliate PDA", async () => {
      const wallet = Keypair.generate().publicKey;
      await client.getAffiliateProfile(wallet);

      const [expectedPda] = client.getAffiliateProfilePDA(wallet);
      expect(mockConnection.getAccountInfo).toHaveBeenCalledWith(expectedPda);
    });

    it("handles connection errors gracefully", async () => {
      const errorConnection = createMockConnection({
        getAccountInfo: vi.fn().mockRejectedValue(new Error("Network error")),
      });
      const errorClient = new NjordClient({ connection: errorConnection });

      const wallet = Keypair.generate().publicKey;
      const result = await errorClient.getAffiliateProfile(wallet);
      expect(result).toBeNull();
    });
  });

  describe("getBridge", () => {
    it("returns null when bridge does not exist", async () => {
      const operator = Keypair.generate().publicKey;
      const result = await client.getBridge(operator);

      expect(result).toBeNull();
    });

    it("calls getAccountInfo with correct bridge PDA", async () => {
      const operator = Keypair.generate().publicKey;
      await client.getBridge(operator);

      const [expectedPda] = client.getBridgePDA(operator);
      expect(mockConnection.getAccountInfo).toHaveBeenCalledWith(expectedPda);
    });

    it("handles connection errors gracefully", async () => {
      const errorConnection = createMockConnection({
        getAccountInfo: vi.fn().mockRejectedValue(new Error("Service unavailable")),
      });
      const errorClient = new NjordClient({ connection: errorConnection });

      const operator = Keypair.generate().publicKey;
      const result = await errorClient.getBridge(operator);
      expect(result).toBeNull();
    });
  });

  describe("Multiple concurrent fetches", () => {
    it("handles multiple concurrent account fetches", async () => {
      const wallet1 = Keypair.generate().publicKey;
      const wallet2 = Keypair.generate().publicKey;
      const wallet3 = Keypair.generate().publicKey;

      const results = await Promise.all([
        client.getAffiliateProfile(wallet1),
        client.getAffiliateProfile(wallet2),
        client.getAffiliateProfile(wallet3),
      ]);

      expect(results).toHaveLength(3);
      results.forEach((result) => expect(result).toBeNull());
      expect(mockConnection.getAccountInfo).toHaveBeenCalledTimes(3);
    });

    it("handles mixed account type fetches", async () => {
      const wallet = Keypair.generate().publicKey;
      const campaignId = new BN(1);

      const results = await Promise.all([
        client.getProtocolConfig(),
        client.getCampaign(campaignId),
        client.getAffiliateProfile(wallet),
        client.getBridge(wallet),
      ]);

      expect(results).toHaveLength(4);
      expect(mockConnection.getAccountInfo).toHaveBeenCalledTimes(4);
    });
  });
});
