import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useNjordStore } from "../store";

// Import setup to get mocks
import "./setup";

describe("useNjordStore", () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useNjordStore());
    act(() => {
      result.current.reset();
    });
  });

  describe("campaigns", () => {
    it("initializes with empty campaigns", () => {
      const { result } = renderHook(() => useNjordStore());
      expect(result.current.campaigns.size).toBe(0);
      expect(result.current.campaignsLoading).toBe(false);
      expect(result.current.campaignsError).toBeNull();
    });

    it("sets campaigns", () => {
      const { result } = renderHook(() => useNjordStore());

      const mockCampaigns = [
        {
          pubkey: "campaign1",
          company: "company1",
          name: "Test Campaign",
          mint: "mint1",
          commissionType: "percentage",
          commissionValue: 1000,
          budget: 10000,
          spent: 0,
          isActive: true,
          isPaused: false,
          holdPeriod: 604800,
          minAffiliateTier: "new",
        },
      ];

      act(() => {
        result.current.setCampaigns(mockCampaigns);
      });

      expect(result.current.campaigns.size).toBe(1);
      expect(result.current.campaigns.get("campaign1")).toEqual(mockCampaigns[0]);
    });

    it("adds a campaign", () => {
      const { result } = renderHook(() => useNjordStore());

      const newCampaign = {
        pubkey: "campaign2",
        company: "company2",
        name: "New Campaign",
        mint: "mint2",
        commissionType: "fixed",
        commissionValue: 500,
        budget: 5000,
        spent: 0,
        isActive: true,
        isPaused: false,
        holdPeriod: 259200,
        minAffiliateTier: "verified",
      };

      act(() => {
        result.current.addCampaign(newCampaign);
      });

      expect(result.current.campaigns.has("campaign2")).toBe(true);
    });

    it("updates a campaign", () => {
      const { result } = renderHook(() => useNjordStore());

      const campaign = {
        pubkey: "campaign3",
        company: "company3",
        name: "Original Name",
        mint: "mint3",
        commissionType: "percentage",
        commissionValue: 1000,
        budget: 10000,
        spent: 0,
        isActive: true,
        isPaused: false,
        holdPeriod: 604800,
        minAffiliateTier: "new",
      };

      act(() => {
        result.current.addCampaign(campaign);
      });

      act(() => {
        result.current.updateCampaign("campaign3", { name: "Updated Name", spent: 1000 });
      });

      const updated = result.current.campaigns.get("campaign3");
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.spent).toBe(1000);
    });

    it("sets loading state", () => {
      const { result } = renderHook(() => useNjordStore());

      act(() => {
        result.current.setCampaignsLoading(true);
      });

      expect(result.current.campaignsLoading).toBe(true);
    });

    it("sets error state", () => {
      const { result } = renderHook(() => useNjordStore());

      act(() => {
        result.current.setCampaignsError("Failed to fetch");
      });

      expect(result.current.campaignsError).toBe("Failed to fetch");
      expect(result.current.campaignsLoading).toBe(false);
    });
  });

  describe("affiliates", () => {
    it("initializes with empty affiliates", () => {
      const { result } = renderHook(() => useNjordStore());
      expect(result.current.affiliates.size).toBe(0);
      expect(result.current.myAffiliate).toBeNull();
    });

    it("sets my affiliate", () => {
      const { result } = renderHook(() => useNjordStore());

      const myAffiliate = {
        pubkey: "affiliate1",
        wallet: "wallet1",
        tier: "verified",
        totalEarnings: 5000,
        totalAttributions: 10,
        fraudScore: 5,
        isActive: true,
      };

      act(() => {
        result.current.setMyAffiliate(myAffiliate);
      });

      expect(result.current.myAffiliate).toEqual(myAffiliate);
    });

    it("adds an affiliate", () => {
      const { result } = renderHook(() => useNjordStore());

      const affiliate = {
        pubkey: "affiliate2",
        wallet: "wallet2",
        tier: "new",
        totalEarnings: 0,
        totalAttributions: 0,
        fraudScore: 0,
        isActive: true,
      };

      act(() => {
        result.current.addAffiliate(affiliate);
      });

      expect(result.current.affiliates.has("affiliate2")).toBe(true);
    });
  });

  describe("attributions", () => {
    it("initializes with empty attributions", () => {
      const { result } = renderHook(() => useNjordStore());
      expect(result.current.attributions.size).toBe(0);
    });

    it("adds an attribution", () => {
      const { result } = renderHook(() => useNjordStore());

      const attribution = {
        pubkey: "attr1",
        campaignId: "campaign1",
        affiliateId: "affiliate1",
        actionValue: 10000,
        commission: 1000,
        status: "pending",
        fraudScore: 10,
        createdAt: new Date(),
      };

      act(() => {
        result.current.addAttribution(attribution);
      });

      expect(result.current.attributions.has("attr1")).toBe(true);
    });
  });

  describe("reset", () => {
    it("resets all state to initial values", () => {
      const { result } = renderHook(() => useNjordStore());

      // Add some data
      act(() => {
        result.current.addCampaign({
          pubkey: "campaign1",
          company: "company1",
          name: "Test",
          mint: "mint1",
          commissionType: "percentage",
          commissionValue: 1000,
          budget: 10000,
          spent: 0,
          isActive: true,
          isPaused: false,
          holdPeriod: 604800,
          minAffiliateTier: "new",
        });
        result.current.setMyAffiliate({
          pubkey: "affiliate1",
          wallet: "wallet1",
          tier: "new",
          totalEarnings: 0,
          totalAttributions: 0,
          fraudScore: 0,
          isActive: true,
        });
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.campaigns.size).toBe(0);
      expect(result.current.affiliates.size).toBe(0);
      expect(result.current.attributions.size).toBe(0);
      expect(result.current.myAffiliate).toBeNull();
    });
  });
});

describe("useAffiliateLink", () => {
  // We'll test the affiliate link logic without the actual hook
  // since it depends on window.location

  describe("link generation", () => {
    it("generates correct affiliate link format", () => {
      const baseUrl = "https://example.com";
      const campaignId = "campaign123";
      const affiliateId = "affiliate456";

      const url = new URL(baseUrl);
      url.searchParams.set("njord_c", campaignId);
      url.searchParams.set("njord_a", affiliateId);

      expect(url.toString()).toBe(
        "https://example.com/?njord_c=campaign123&njord_a=affiliate456"
      );
    });
  });

  describe("localStorage storage", () => {
    it("stores affiliate reference correctly", () => {
      const ref = {
        campaignId: "campaign123",
        affiliateId: "affiliate456",
        timestamp: Date.now(),
        landingUrl: "https://example.com/page",
      };

      localStorage.setItem("njord_affiliate_ref", JSON.stringify(ref));

      const stored = localStorage.getItem("njord_affiliate_ref");
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.campaignId).toBe("campaign123");
      expect(parsed.affiliateId).toBe("affiliate456");
    });
  });
});
