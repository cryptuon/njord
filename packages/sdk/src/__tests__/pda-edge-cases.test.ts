import { describe, it, expect } from "vitest";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { NjordClient, NJORD_PROGRAM_ID } from "../client";
import { SEEDS } from "../types";

// Mock connection for client initialization
const mockConnection = {
  getAccountInfo: () => Promise.resolve(null),
  rpcEndpoint: "https://api.devnet.solana.com",
} as unknown as Connection;

describe("PDA Edge Cases", () => {
  const client = new NjordClient({ connection: mockConnection });

  describe("Campaign PDA with boundary values", () => {
    it("handles campaign ID of 0", () => {
      const campaignId = new BN(0);
      const [pda, bump] = client.getCampaignPDA(campaignId);

      expect(pda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    it("handles campaign ID of 1", () => {
      const campaignId = new BN(1);
      const [pda, bump] = client.getCampaignPDA(campaignId);

      expect(pda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("handles maximum u64 campaign ID", () => {
      const maxU64 = new BN("18446744073709551615");
      const [pda, bump] = client.getCampaignPDA(maxU64);

      expect(pda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("generates different PDAs for different campaign IDs", () => {
      const [pda1] = client.getCampaignPDA(new BN(1));
      const [pda2] = client.getCampaignPDA(new BN(2));
      const [pda3] = client.getCampaignPDA(new BN(1000));

      expect(pda1.equals(pda2)).toBe(false);
      expect(pda1.equals(pda3)).toBe(false);
      expect(pda2.equals(pda3)).toBe(false);
    });

    it("generates same PDA for same campaign ID", () => {
      const campaignId = new BN(12345);
      const [pda1] = client.getCampaignPDA(campaignId);
      const [pda2] = client.getCampaignPDA(new BN(12345));

      expect(pda1.equals(pda2)).toBe(true);
    });
  });

  describe("Attribution PDA with various nonces", () => {
    const campaign = Keypair.generate().publicKey;

    it("handles empty nonce (all zeros)", () => {
      const nonce = new Uint8Array(16).fill(0);
      const [pda, bump] = client.getAttributionPDA(campaign, nonce);

      expect(pda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("handles maximum value nonce (all 255s)", () => {
      const nonce = new Uint8Array(16).fill(255);
      const [pda, bump] = client.getAttributionPDA(campaign, nonce);

      expect(pda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("handles random nonce values", () => {
      const nonce = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
      const [pda, bump] = client.getAttributionPDA(campaign, nonce);

      expect(pda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("generates different PDAs for different nonces", () => {
      const nonce1 = new Uint8Array(16).fill(1);
      const nonce2 = new Uint8Array(16).fill(2);

      const [pda1] = client.getAttributionPDA(campaign, nonce1);
      const [pda2] = client.getAttributionPDA(campaign, nonce2);

      expect(pda1.equals(pda2)).toBe(false);
    });

    it("generates different PDAs for same nonce but different campaigns", () => {
      const campaign1 = Keypair.generate().publicKey;
      const campaign2 = Keypair.generate().publicKey;
      const nonce = new Uint8Array(16).fill(42);

      const [pda1] = client.getAttributionPDA(campaign1, nonce);
      const [pda2] = client.getAttributionPDA(campaign2, nonce);

      expect(pda1.equals(pda2)).toBe(false);
    });
  });

  describe("Customer Attribution PDA with various hashes", () => {
    const campaign = Keypair.generate().publicKey;

    it("handles empty hash (all zeros)", () => {
      const hash = new Uint8Array(32).fill(0);
      const [pda, bump] = client.getCustomerAttributionPDA(campaign, hash);

      expect(pda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("handles maximum value hash (all 255s)", () => {
      const hash = new Uint8Array(32).fill(255);
      const [pda, bump] = client.getCustomerAttributionPDA(campaign, hash);

      expect(pda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("generates different PDAs for different customer hashes", () => {
      const hash1 = client.hashCustomer("customer1@example.com");
      const hash2 = client.hashCustomer("customer2@example.com");

      const [pda1] = client.getCustomerAttributionPDA(campaign, hash1);
      const [pda2] = client.getCustomerAttributionPDA(campaign, hash2);

      expect(pda1.equals(pda2)).toBe(false);
    });
  });

  describe("Registration PDA ordering", () => {
    it("uses consistent ordering for campaign and profile", () => {
      const campaign = Keypair.generate().publicKey;
      const profile = Keypair.generate().publicKey;

      const [pda1] = client.getAffiliateRegistrationPDA(campaign, profile);
      const [pda2] = client.getAffiliateRegistrationPDA(campaign, profile);

      expect(pda1.equals(pda2)).toBe(true);
    });

    it("generates different PDAs when arguments are swapped", () => {
      const key1 = Keypair.generate().publicKey;
      const key2 = Keypair.generate().publicKey;

      // Using key1 as campaign, key2 as profile
      const [pda1] = client.getAffiliateRegistrationPDA(key1, key2);
      // Using key2 as campaign, key1 as profile
      const [pda2] = client.getAffiliateRegistrationPDA(key2, key1);

      expect(pda1.equals(pda2)).toBe(false);
    });
  });

  describe("Escrow PDA derivation", () => {
    it("generates unique escrow for each campaign", () => {
      const campaign1 = Keypair.generate().publicKey;
      const campaign2 = Keypair.generate().publicKey;

      const [escrow1] = client.getEscrowPDA(campaign1);
      const [escrow2] = client.getEscrowPDA(campaign2);

      expect(escrow1.equals(escrow2)).toBe(false);
    });

    it("generates deterministic escrow for same campaign", () => {
      const campaign = Keypair.generate().publicKey;

      const [escrow1] = client.getEscrowPDA(campaign);
      const [escrow2] = client.getEscrowPDA(campaign);

      expect(escrow1.equals(escrow2)).toBe(true);
    });
  });

  describe("Stake PDA derivation", () => {
    it("derives affiliate stake PDA from profile", () => {
      const profile = Keypair.generate().publicKey;
      const [stakePda, bump] = client.getAffiliateStakePDA(profile);

      expect(stakePda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("derives bridge stake PDA from bridge", () => {
      const bridge = Keypair.generate().publicKey;
      const [stakePda, bump] = client.getBridgeStakePDA(bridge);

      expect(stakePda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("generates different stake PDAs for different entities", () => {
      const entity1 = Keypair.generate().publicKey;
      const entity2 = Keypair.generate().publicKey;

      const [affiliateStake1] = client.getAffiliateStakePDA(entity1);
      const [affiliateStake2] = client.getAffiliateStakePDA(entity2);
      const [bridgeStake1] = client.getBridgeStakePDA(entity1);
      const [bridgeStake2] = client.getBridgeStakePDA(entity2);

      expect(affiliateStake1.equals(affiliateStake2)).toBe(false);
      expect(bridgeStake1.equals(bridgeStake2)).toBe(false);
      // Different seed prefixes mean same input generates different PDAs
      expect(affiliateStake1.equals(bridgeStake1)).toBe(false);
    });
  });

  describe("Challenge PDA derivation", () => {
    it("derives challenge PDA from attribution", () => {
      const attribution = Keypair.generate().publicKey;
      const [challengePda, bump] = client.getChallengePDA(attribution);

      expect(challengePda).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
    });

    it("generates unique challenge PDA per attribution", () => {
      const attribution1 = Keypair.generate().publicKey;
      const attribution2 = Keypair.generate().publicKey;

      const [challenge1] = client.getChallengePDA(attribution1);
      const [challenge2] = client.getChallengePDA(attribution2);

      expect(challenge1.equals(challenge2)).toBe(false);
    });
  });

  describe("PDA with custom program ID", () => {
    it("generates different PDAs with different program IDs", () => {
      const customProgramId = Keypair.generate().publicKey;
      const customClient = new NjordClient({
        connection: mockConnection,
        programId: customProgramId,
      });

      const [defaultPda] = client.getProtocolConfigPDA();
      const [customPda] = customClient.getProtocolConfigPDA();

      expect(defaultPda.equals(customPda)).toBe(false);
    });

    it("all PDA methods use the configured program ID", () => {
      const customProgramId = Keypair.generate().publicKey;
      const customClient = new NjordClient({
        connection: mockConnection,
        programId: customProgramId,
      });

      const wallet = Keypair.generate().publicKey;
      const campaignId = new BN(1);

      // Compare with default client
      const [defaultCampaign] = client.getCampaignPDA(campaignId);
      const [customCampaign] = customClient.getCampaignPDA(campaignId);

      const [defaultAffiliate] = client.getAffiliateProfilePDA(wallet);
      const [customAffiliate] = customClient.getAffiliateProfilePDA(wallet);

      expect(defaultCampaign.equals(customCampaign)).toBe(false);
      expect(defaultAffiliate.equals(customAffiliate)).toBe(false);
    });
  });
});
