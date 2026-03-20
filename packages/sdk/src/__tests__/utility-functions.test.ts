import { describe, it, expect } from "vitest";
import { Connection } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { NjordClient } from "../client";

// Mock connection for client initialization
const mockConnection = {
  getAccountInfo: () => Promise.resolve(null),
  rpcEndpoint: "https://api.devnet.solana.com",
} as unknown as Connection;

describe("Utility Functions", () => {
  const client = new NjordClient({ connection: mockConnection });

  describe("generateNonce", () => {
    it("generates 16-byte nonce", () => {
      const nonce = client.generateNonce();
      expect(nonce.length).toBe(16);
    });

    it("generates Uint8Array", () => {
      const nonce = client.generateNonce();
      expect(nonce).toBeInstanceOf(Uint8Array);
    });

    it("generates unique nonces on each call", () => {
      const nonces = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const nonce = client.generateNonce();
        const hex = Buffer.from(nonce).toString("hex");
        nonces.add(hex);
      }
      // All 100 nonces should be unique
      expect(nonces.size).toBe(100);
    });

    it("generates nonces with good entropy distribution", () => {
      const nonce = client.generateNonce();

      // Check that not all bytes are the same
      const uniqueBytes = new Set(nonce);
      expect(uniqueBytes.size).toBeGreaterThan(1);
    });
  });

  describe("hashCustomer", () => {
    it("generates 32-byte hash", () => {
      const hash = client.hashCustomer("test@example.com");
      expect(hash.length).toBe(32);
    });

    it("generates Uint8Array", () => {
      const hash = client.hashCustomer("test");
      expect(hash).toBeInstanceOf(Uint8Array);
    });

    it("produces deterministic output", () => {
      const input = "customer123";
      const hash1 = client.hashCustomer(input);
      const hash2 = client.hashCustomer(input);

      expect(Buffer.from(hash1).toString("hex")).toBe(
        Buffer.from(hash2).toString("hex")
      );
    });

    it("produces different hashes for different inputs", () => {
      const hash1 = client.hashCustomer("customer1");
      const hash2 = client.hashCustomer("customer2");

      expect(Buffer.from(hash1).toString("hex")).not.toBe(
        Buffer.from(hash2).toString("hex")
      );
    });

    it("handles empty string", () => {
      const hash = client.hashCustomer("");
      expect(hash.length).toBe(32);
      // Empty string should produce all zeros since no XOR operations happen
      expect(hash.every((b) => b === 0)).toBe(true);
    });

    it("handles very long strings", () => {
      const longString = "a".repeat(10000);
      const hash = client.hashCustomer(longString);
      expect(hash.length).toBe(32);
    });

    it("handles unicode characters", () => {
      const hash = client.hashCustomer("用户@example.com");
      expect(hash.length).toBe(32);
    });

    it("handles special characters", () => {
      const hash = client.hashCustomer("user+test@example.com!#$%");
      expect(hash.length).toBe(32);
    });

    it("is case sensitive", () => {
      const hash1 = client.hashCustomer("Customer");
      const hash2 = client.hashCustomer("customer");

      expect(Buffer.from(hash1).toString("hex")).not.toBe(
        Buffer.from(hash2).toString("hex")
      );
    });

    it("handles whitespace differences", () => {
      const hash1 = client.hashCustomer("customer");
      const hash2 = client.hashCustomer(" customer");
      const hash3 = client.hashCustomer("customer ");

      expect(Buffer.from(hash1).toString("hex")).not.toBe(
        Buffer.from(hash2).toString("hex")
      );
      expect(Buffer.from(hash1).toString("hex")).not.toBe(
        Buffer.from(hash3).toString("hex")
      );
    });
  });

  describe("calculateCommission", () => {
    it("calculates 10% commission correctly", () => {
      const value = new BN(10000); // $100.00
      const rateBps = 1000; // 10%
      const commission = client.calculateCommission(value, rateBps);

      expect(commission.toNumber()).toBe(1000); // $10.00
    });

    it("calculates 5% commission correctly", () => {
      const value = new BN(50000); // $500.00
      const rateBps = 500; // 5%
      const commission = client.calculateCommission(value, rateBps);

      expect(commission.toNumber()).toBe(2500); // $25.00
    });

    it("calculates 1% commission correctly", () => {
      const value = new BN(100000); // $1000.00
      const rateBps = 100; // 1%
      const commission = client.calculateCommission(value, rateBps);

      expect(commission.toNumber()).toBe(1000); // $10.00
    });

    it("calculates 100% commission correctly", () => {
      const value = new BN(10000);
      const rateBps = 10000; // 100%
      const commission = client.calculateCommission(value, rateBps);

      expect(commission.toNumber()).toBe(10000);
    });

    it("handles 0% rate", () => {
      const value = new BN(10000);
      const rateBps = 0;
      const commission = client.calculateCommission(value, rateBps);

      expect(commission.toNumber()).toBe(0);
    });

    it("handles 0 value", () => {
      const value = new BN(0);
      const rateBps = 1000;
      const commission = client.calculateCommission(value, rateBps);

      expect(commission.toNumber()).toBe(0);
    });

    it("handles very small values", () => {
      const value = new BN(1);
      const rateBps = 1000; // 10%
      const commission = client.calculateCommission(value, rateBps);

      // 1 * 1000 / 10000 = 0 (integer division)
      expect(commission.toNumber()).toBe(0);
    });

    it("handles minimum value for non-zero commission at 10%", () => {
      const value = new BN(10);
      const rateBps = 1000; // 10%
      const commission = client.calculateCommission(value, rateBps);

      // 10 * 1000 / 10000 = 1
      expect(commission.toNumber()).toBe(1);
    });

    it("handles large values", () => {
      const value = new BN("1000000000000"); // 1 trillion cents
      const rateBps = 500; // 5%
      const commission = client.calculateCommission(value, rateBps);

      expect(commission.toString()).toBe("50000000000");
    });

    it("handles fractional basis points", () => {
      const value = new BN(10000);
      const rateBps = 1; // 0.01%
      const commission = client.calculateCommission(value, rateBps);

      expect(commission.toNumber()).toBe(1);
    });

    it("truncates rather than rounds", () => {
      const value = new BN(999);
      const rateBps = 1000; // 10%
      const commission = client.calculateCommission(value, rateBps);

      // 999 * 1000 / 10000 = 99.9 -> 99
      expect(commission.toNumber()).toBe(99);
    });

    it("handles typical affiliate rates", () => {
      const testCases = [
        { value: 10000, rate: 300, expected: 300 }, // 3%
        { value: 10000, rate: 500, expected: 500 }, // 5%
        { value: 10000, rate: 750, expected: 750 }, // 7.5%
        { value: 10000, rate: 1000, expected: 1000 }, // 10%
        { value: 10000, rate: 1500, expected: 1500 }, // 15%
        { value: 10000, rate: 2000, expected: 2000 }, // 20%
        { value: 10000, rate: 3000, expected: 3000 }, // 30%
      ];

      testCases.forEach(({ value, rate, expected }) => {
        const commission = client.calculateCommission(new BN(value), rate);
        expect(commission.toNumber()).toBe(expected);
      });
    });
  });

  describe("Static factory methods", () => {
    describe("fromConnection", () => {
      it("creates client instance", () => {
        const newClient = NjordClient.fromConnection(mockConnection);
        expect(newClient).toBeInstanceOf(NjordClient);
      });

      it("uses provided connection", () => {
        const newClient = NjordClient.fromConnection(mockConnection);
        expect(newClient.connection).toBe(mockConnection);
      });

      it("uses default program ID", () => {
        const newClient = NjordClient.fromConnection(mockConnection);
        expect(newClient.programId).toBeDefined();
      });

      it("has no wallet", () => {
        const newClient = NjordClient.fromConnection(mockConnection);
        expect(newClient.wallet).toBeUndefined();
      });
    });

    describe("fromUrl", () => {
      it("creates client instance", () => {
        const newClient = NjordClient.fromUrl("https://api.devnet.solana.com");
        expect(newClient).toBeInstanceOf(NjordClient);
      });

      it("creates connection from URL", () => {
        const newClient = NjordClient.fromUrl("https://api.devnet.solana.com");
        expect(newClient.connection).toBeDefined();
      });

      it("uses default program ID", () => {
        const newClient = NjordClient.fromUrl("https://api.devnet.solana.com");
        expect(newClient.programId).toBeDefined();
      });

      it("accepts mainnet URL", () => {
        const newClient = NjordClient.fromUrl("https://api.mainnet-beta.solana.com");
        expect(newClient).toBeInstanceOf(NjordClient);
      });

      it("accepts localhost URL", () => {
        const newClient = NjordClient.fromUrl("http://localhost:8899");
        expect(newClient).toBeInstanceOf(NjordClient);
      });
    });
  });
});
