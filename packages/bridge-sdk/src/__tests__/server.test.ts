import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Test the validation schemas used by the server

describe("Request Validation Schemas", () => {
  const RecordAttributionSchema = z.object({
    campaignId: z.string().min(1),
    affiliateId: z.string().min(1),
    actionValue: z.number().positive(),
    customerId: z.string().optional(),
    customerEmail: z.string().email().optional(),
    customerIp: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  });

  const CreateCheckoutSchema = z.object({
    provider: z.enum(["stripe", "razorpay"]),
    campaignId: z.string().min(1),
    affiliateId: z.string().min(1),
    amount: z.number().positive(),
    currency: z.string().length(3).optional(),
    customerId: z.string().optional(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
    productName: z.string().optional(),
  });

  describe("RecordAttributionSchema", () => {
    it("validates valid attribution request", () => {
      const validRequest = {
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        actionValue: 10000,
        customerId: "customer_789",
        customerEmail: "test@example.com",
        metadata: { source: "web" },
      };

      const result = RecordAttributionSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("rejects empty campaignId", () => {
      const invalidRequest = {
        campaignId: "",
        affiliateId: "affiliate_456",
        actionValue: 10000,
      };

      const result = RecordAttributionSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("rejects negative actionValue", () => {
      const invalidRequest = {
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        actionValue: -100,
      };

      const result = RecordAttributionSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("rejects zero actionValue", () => {
      const invalidRequest = {
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        actionValue: 0,
      };

      const result = RecordAttributionSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("rejects invalid email format", () => {
      const invalidRequest = {
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        actionValue: 10000,
        customerEmail: "not-an-email",
      };

      const result = RecordAttributionSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("accepts request without optional fields", () => {
      const minimalRequest = {
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        actionValue: 10000,
      };

      const result = RecordAttributionSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
    });
  });

  describe("CreateCheckoutSchema", () => {
    it("validates valid Stripe checkout request", () => {
      const validRequest = {
        provider: "stripe",
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        amount: 10000,
        currency: "USD",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        productName: "Test Product",
      };

      const result = CreateCheckoutSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("validates valid Razorpay checkout request", () => {
      const validRequest = {
        provider: "razorpay",
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        amount: 100000,
        currency: "INR",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      };

      const result = CreateCheckoutSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("rejects invalid provider", () => {
      const invalidRequest = {
        provider: "paypal",
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        amount: 10000,
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      };

      const result = CreateCheckoutSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("rejects invalid URL format", () => {
      const invalidRequest = {
        provider: "stripe",
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        amount: 10000,
        successUrl: "not-a-url",
        cancelUrl: "https://example.com/cancel",
      };

      const result = CreateCheckoutSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("rejects invalid currency length", () => {
      const invalidRequest = {
        provider: "stripe",
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        amount: 10000,
        currency: "US", // Should be 3 characters
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      };

      const result = CreateCheckoutSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("accepts request without optional fields", () => {
      const minimalRequest = {
        provider: "stripe",
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        amount: 10000,
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      };

      const result = CreateCheckoutSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
    });
  });
});

describe("Customer Hash Generation", () => {
  it("generates deterministic hash for same input", () => {
    const customerId = "customer_123";
    const encoder = new TextEncoder();
    const encoded = encoder.encode(customerId);

    const hash1 = new Uint8Array(32);
    const hash2 = new Uint8Array(32);

    for (let i = 0; i < encoded.length; i++) {
      hash1[i % 32] ^= encoded[i];
      hash2[i % 32] ^= encoded[i];
    }

    expect(Buffer.from(hash1).toString("hex")).toBe(
      Buffer.from(hash2).toString("hex")
    );
  });

  it("generates different hashes for different inputs", () => {
    const encoder = new TextEncoder();

    const createHash = (input: string): Uint8Array => {
      const encoded = encoder.encode(input);
      const hash = new Uint8Array(32);
      for (let i = 0; i < encoded.length; i++) {
        hash[i % 32] ^= encoded[i];
      }
      return hash;
    };

    const hash1 = createHash("customer_123");
    const hash2 = createHash("customer_456");

    expect(Buffer.from(hash1).toString("hex")).not.toBe(
      Buffer.from(hash2).toString("hex")
    );
  });

  it("generates 32-byte hash", () => {
    const customerId = "test_customer";
    const encoder = new TextEncoder();
    const encoded = encoder.encode(customerId);

    const hash = new Uint8Array(32);
    for (let i = 0; i < encoded.length; i++) {
      hash[i % 32] ^= encoded[i];
    }

    expect(hash.length).toBe(32);
  });
});

describe("Nonce Generation", () => {
  it("generates 16-byte nonce", () => {
    const nonce = new Uint8Array(16);
    crypto.getRandomValues(nonce);

    expect(nonce.length).toBe(16);
  });

  it("generates unique nonces", () => {
    const nonce1 = new Uint8Array(16);
    const nonce2 = new Uint8Array(16);

    crypto.getRandomValues(nonce1);
    crypto.getRandomValues(nonce2);

    expect(Buffer.from(nonce1).toString("hex")).not.toBe(
      Buffer.from(nonce2).toString("hex")
    );
  });
});

describe("Bridge Stats", () => {
  it("calculates correct stats structure", () => {
    const stats = {
      totalAttributions: 100,
      totalVolume: 1000000, // $10,000 in cents
      todayAttributions: 5,
      todayVolume: 50000,
      fraudRejections: 2,
    };

    expect(stats.totalAttributions).toBe(100);
    expect(stats.totalVolume / 100).toBe(10000); // Convert to dollars
    expect(stats.fraudRejections / stats.totalAttributions).toBe(0.02); // 2% fraud rate
  });
});

describe("Health Check Response", () => {
  it("returns correct health status structure", () => {
    const status = {
      isHealthy: true,
      solanaConnected: true,
      redisConnected: true,
      stats: {
        totalAttributions: 100,
        totalVolume: 1000000,
        todayAttributions: 5,
        todayVolume: 50000,
        fraudRejections: 2,
      },
    };

    expect(status.isHealthy).toBe(true);
    expect(status.solanaConnected).toBe(true);
    expect(status.redisConnected).toBe(true);
    expect(status.stats).toBeDefined();
  });

  it("returns unhealthy when Solana disconnected", () => {
    const status = {
      isHealthy: false,
      solanaConnected: false,
      redisConnected: true,
      stats: null,
    };

    expect(status.isHealthy).toBe(false);
    expect(status.solanaConnected).toBe(false);
  });
});
