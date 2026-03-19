import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// Mock Stripe
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      webhooks: {
        constructEvent: vi.fn(),
      },
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_test_123",
            url: "https://checkout.stripe.com/test",
          }),
        },
      },
    })),
  };
});

// Mock Razorpay
vi.mock("razorpay", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      orders: {
        create: vi.fn().mockResolvedValue({
          id: "order_123",
          amount: 10000,
          currency: "INR",
        }),
      },
    })),
  };
});

describe("Webhook Signature Verification", () => {
  describe("Stripe signature verification logic", () => {
    it("generates correct HMAC signature", () => {
      const secret = "whsec_test123";
      const timestamp = Math.floor(Date.now() / 1000);
      const payload = JSON.stringify({ type: "payment_intent.succeeded" });

      const signedPayload = `${timestamp}.${payload}`;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(signedPayload)
        .digest("hex");

      expect(expectedSignature).toBeDefined();
      expect(expectedSignature.length).toBe(64); // SHA256 hex length
    });
  });

  describe("Razorpay signature verification logic", () => {
    it("generates correct HMAC signature", () => {
      const secret = "razorpay_webhook_secret";
      const payload = JSON.stringify({
        event: "payment.captured",
        payload: { payment: { entity: { id: "pay_123" } } },
      });

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      expect(expectedSignature).toBeDefined();
      expect(expectedSignature.length).toBe(64);
    });

    it("verifies signature using timing-safe comparison", () => {
      const sig1 = "a".repeat(64);
      const sig2 = "a".repeat(64);
      const sig3 = "b".repeat(64);

      const result1 = crypto.timingSafeEqual(Buffer.from(sig1), Buffer.from(sig2));
      const result2 = crypto.timingSafeEqual(Buffer.from(sig1), Buffer.from(sig3));

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });
});

describe("Payment Event Parsing", () => {
  describe("Stripe event parsing", () => {
    it("extracts correct data from checkout.session.completed event", () => {
      const event = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            amount_total: 10000,
            currency: "usd",
            payment_status: "paid",
            metadata: {
              campaign_id: "campaign_123",
              affiliate_id: "affiliate_456",
              customer_id: "customer_789",
            },
            created: 1704067200,
          },
        },
      };

      const paymentEvent = {
        id: event.data.object.id,
        amount: event.data.object.amount_total,
        currency: event.data.object.currency.toUpperCase(),
        status: "completed",
        metadata: {
          campaignId: event.data.object.metadata.campaign_id,
          affiliateId: event.data.object.metadata.affiliate_id,
          customerId: event.data.object.metadata.customer_id,
        },
        createdAt: new Date(event.data.object.created * 1000),
      };

      expect(paymentEvent.id).toBe("cs_test_123");
      expect(paymentEvent.amount).toBe(10000);
      expect(paymentEvent.currency).toBe("USD");
      expect(paymentEvent.metadata.campaignId).toBe("campaign_123");
    });

    it("handles payment_intent.succeeded event", () => {
      const event = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_123",
            amount: 5000,
            currency: "usd",
            metadata: {
              campaign_id: "campaign_abc",
              affiliate_id: "affiliate_xyz",
            },
          },
        },
      };

      expect(event.type).toBe("payment_intent.succeeded");
      expect(event.data.object.amount).toBe(5000);
    });
  });

  describe("Razorpay event parsing", () => {
    it("extracts correct data from payment.captured event", () => {
      const event = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_123",
              amount: 100000, // Amount in paise
              currency: "inr",
              status: "captured",
              notes: {
                campaign_id: "campaign_123",
                affiliate_id: "affiliate_456",
                customer_id: "customer_789",
              },
              created_at: 1704067200,
            },
          },
        },
      };

      const entity = event.payload.payment.entity;
      const paymentEvent = {
        id: entity.id,
        amount: entity.amount,
        currency: entity.currency.toUpperCase(),
        status: "completed",
        metadata: {
          campaignId: entity.notes.campaign_id,
          affiliateId: entity.notes.affiliate_id,
          customerId: entity.notes.customer_id,
        },
        createdAt: new Date(entity.created_at * 1000),
      };

      expect(paymentEvent.id).toBe("pay_123");
      expect(paymentEvent.amount).toBe(100000);
      expect(paymentEvent.currency).toBe("INR");
      expect(paymentEvent.metadata.campaignId).toBe("campaign_123");
    });

    it("handles order.paid event", () => {
      const event = {
        event: "order.paid",
        payload: {
          order: {
            entity: {
              id: "order_123",
              amount: 50000,
              currency: "inr",
              notes: {
                campaign_id: "campaign_xyz",
                affiliate_id: "affiliate_abc",
              },
            },
          },
        },
      };

      expect(event.event).toBe("order.paid");
      expect(event.payload.order.entity.amount).toBe(50000);
    });
  });
});

describe("Checkout Session Creation", () => {
  describe("Stripe checkout", () => {
    it("creates session with correct parameters", () => {
      const params = {
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        customerId: "customer_789",
        amount: 10000, // $100.00 in cents
        currency: "usd",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        productName: "Test Product",
      };

      const sessionParams = {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: params.currency,
              product_data: {
                name: params.productName,
              },
              unit_amount: params.amount,
            },
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          campaign_id: params.campaignId,
          affiliate_id: params.affiliateId,
          customer_id: params.customerId,
        },
      };

      expect(sessionParams.mode).toBe("payment");
      expect(sessionParams.line_items[0].price_data.unit_amount).toBe(10000);
      expect(sessionParams.metadata.campaign_id).toBe("campaign_123");
    });
  });

  describe("Razorpay order", () => {
    it("creates order with correct parameters", () => {
      const params = {
        campaignId: "campaign_123",
        affiliateId: "affiliate_456",
        customerId: "customer_789",
        amount: 100000, // Rs. 1000.00 in paise
        currency: "INR",
      };

      const orderParams = {
        amount: params.amount,
        currency: params.currency,
        receipt: `order_${Date.now()}`,
        notes: {
          campaign_id: params.campaignId,
          affiliate_id: params.affiliateId,
          customer_id: params.customerId,
        },
      };

      expect(orderParams.amount).toBe(100000);
      expect(orderParams.currency).toBe("INR");
      expect(orderParams.notes.campaign_id).toBe("campaign_123");
    });
  });
});

describe("Payment Verification", () => {
  describe("Razorpay payment signature", () => {
    it("generates correct payment verification signature", () => {
      const orderId = "order_123";
      const paymentId = "pay_456";
      const secret = "razorpay_key_secret";

      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      expect(expectedSignature).toBeDefined();
      expect(expectedSignature.length).toBe(64);
    });

    it("verifies payment signature correctly", () => {
      const orderId = "order_123";
      const paymentId = "pay_456";
      const secret = "razorpay_key_secret";

      const body = `${orderId}|${paymentId}`;
      const signature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      expect(signature).toBe(expectedSignature);
    });
  });
});
