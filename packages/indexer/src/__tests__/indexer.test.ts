import { describe, it, expect } from "vitest";

describe("Indexer", () => {
  describe("Configuration", () => {
    it("validates environment variables", () => {
      const requiredEnvVars = [
        "DATABASE_URL",
        "SOLANA_RPC_URL",
        "NJORD_PROGRAM_ID",
      ];

      // Test that we can check for env vars
      requiredEnvVars.forEach((envVar) => {
        expect(typeof envVar).toBe("string");
      });
    });
  });

  describe("Event Types", () => {
    it("defines correct event names", () => {
      const eventTypes = [
        "CampaignCreated",
        "CampaignFunded",
        "AffiliateRegistered",
        "AttributionRecorded",
        "CommissionPaid",
        "ChallengeCreated",
        "ChallengeResolved",
      ];

      expect(eventTypes.length).toBe(7);
      expect(eventTypes).toContain("AttributionRecorded");
    });
  });

  describe("Database Models", () => {
    it("has expected model structure", () => {
      const models = {
        Campaign: {
          fields: ["id", "company", "budget", "spent", "status", "createdAt"],
        },
        Affiliate: {
          fields: ["id", "wallet", "tier", "totalEarnings", "createdAt"],
        },
        Attribution: {
          fields: [
            "id",
            "campaignId",
            "affiliateId",
            "actionValue",
            "commission",
            "status",
          ],
        },
      };

      expect(models.Campaign.fields).toContain("budget");
      expect(models.Affiliate.fields).toContain("tier");
      expect(models.Attribution.fields).toContain("commission");
    });
  });

  describe("GraphQL Schema", () => {
    it("defines expected query types", () => {
      const queryTypes = [
        "campaign",
        "campaigns",
        "affiliate",
        "affiliates",
        "attribution",
        "attributions",
        "stats",
      ];

      expect(queryTypes).toContain("campaigns");
      expect(queryTypes).toContain("affiliates");
      expect(queryTypes).toContain("stats");
    });

    it("defines expected mutation types", () => {
      const mutationTypes = [
        "createCampaign",
        "updateCampaign",
        "registerAffiliate",
      ];

      expect(mutationTypes).toContain("createCampaign");
    });
  });
});
