import { describe, it, expect } from "vitest";
import {
  AffiliateTier,
  BridgeTier,
  CommissionType,
  AttributionStatus,
  ChallengeStatus,
  ChallengeOutcome,
  ChallengerType,
  ProposalType,
  ProposalStatus,
  VoteChoice,
  SEEDS,
  GOVERNANCE_SEEDS,
  HOLD_PERIODS,
  MIN_STAKES,
  BRIDGE_MIN_STAKES,
  GOVERNANCE_CONSTANTS,
  NJORD_DECIMALS,
  USDC_DECIMALS,
  BASIS_POINTS,
  CampaignStatus,
  AttributionModel,
  TargetAction,
  AffiliateStatus,
  BridgeStatus,
} from "../types";

describe("Additional Enums", () => {
  describe("CampaignStatus", () => {
    it("has correct values", () => {
      expect(CampaignStatus.Active).toBe(0);
      expect(CampaignStatus.Paused).toBe(1);
      expect(CampaignStatus.Ended).toBe(2);
    });

    it("covers all states", () => {
      const allStatuses = [
        CampaignStatus.Active,
        CampaignStatus.Paused,
        CampaignStatus.Ended,
      ];
      expect(allStatuses.length).toBe(3);
    });
  });

  describe("AttributionModel", () => {
    it("has correct values", () => {
      expect(AttributionModel.LastClick).toBe(0);
      expect(AttributionModel.FirstClick).toBe(1);
    });
  });

  describe("TargetAction", () => {
    it("has correct values", () => {
      expect(TargetAction.Purchase).toBe(0);
      expect(TargetAction.Signup).toBe(1);
      expect(TargetAction.AppInstall).toBe(2);
      expect(TargetAction.Subscription).toBe(3);
    });

    it("covers all action types", () => {
      const allActions = [
        TargetAction.Purchase,
        TargetAction.Signup,
        TargetAction.AppInstall,
        TargetAction.Subscription,
      ];
      expect(allActions.length).toBe(4);
    });
  });

  describe("AffiliateStatus", () => {
    it("has correct values", () => {
      expect(AffiliateStatus.Active).toBe(0);
      expect(AffiliateStatus.PendingApproval).toBe(1);
      expect(AffiliateStatus.Suspended).toBe(2);
    });
  });

  describe("BridgeStatus", () => {
    it("has correct values", () => {
      expect(BridgeStatus.Active).toBe(0);
      expect(BridgeStatus.Inactive).toBe(1);
      expect(BridgeStatus.Suspended).toBe(2);
      expect(BridgeStatus.Unbonding).toBe(3);
    });
  });
});

describe("Seed Constants", () => {
  describe("SEEDS", () => {
    it("has all required seeds", () => {
      expect(SEEDS.PROTOCOL_CONFIG).toBeDefined();
      expect(SEEDS.CAMPAIGN).toBeDefined();
      expect(SEEDS.ESCROW).toBeDefined();
      expect(SEEDS.AFFILIATE_PROFILE).toBeDefined();
      expect(SEEDS.AFFILIATE_STAKE).toBeDefined();
      expect(SEEDS.AFFILIATE_STAKE_VAULT).toBeDefined();
      expect(SEEDS.AFFILIATE_REGISTRATION).toBeDefined();
      expect(SEEDS.ATTRIBUTION).toBeDefined();
      expect(SEEDS.CUSTOMER_ATTRIBUTION).toBeDefined();
      expect(SEEDS.BRIDGE).toBeDefined();
      expect(SEEDS.BRIDGE_STAKE).toBeDefined();
      expect(SEEDS.BRIDGE_STAKE_VAULT).toBeDefined();
      expect(SEEDS.CHALLENGE).toBeDefined();
      expect(SEEDS.CHALLENGE_ESCROW).toBeDefined();
    });

    it("seeds are Buffer instances", () => {
      Object.values(SEEDS).forEach((seed) => {
        expect(Buffer.isBuffer(seed)).toBe(true);
      });
    });

    it("seeds have non-zero length", () => {
      Object.values(SEEDS).forEach((seed) => {
        expect(seed.length).toBeGreaterThan(0);
      });
    });

    it("seeds are unique", () => {
      const seedValues = Object.values(SEEDS).map((s) => s.toString("hex"));
      const uniqueSeeds = new Set(seedValues);
      expect(uniqueSeeds.size).toBe(seedValues.length);
    });

    it("seeds match expected string values", () => {
      expect(SEEDS.PROTOCOL_CONFIG.toString()).toBe("protocol_config");
      expect(SEEDS.CAMPAIGN.toString()).toBe("campaign");
      expect(SEEDS.ESCROW.toString()).toBe("escrow");
      expect(SEEDS.AFFILIATE_PROFILE.toString()).toBe("affiliate_profile");
      expect(SEEDS.BRIDGE.toString()).toBe("bridge");
      expect(SEEDS.CHALLENGE.toString()).toBe("challenge");
    });
  });

  describe("GOVERNANCE_SEEDS", () => {
    it("has all required governance seeds", () => {
      expect(GOVERNANCE_SEEDS.GOVERNANCE_CONFIG).toBeDefined();
      expect(GOVERNANCE_SEEDS.PROTOCOL_PARAMS).toBeDefined();
      expect(GOVERNANCE_SEEDS.VOTING_ESCROW).toBeDefined();
      expect(GOVERNANCE_SEEDS.ESCROW_VAULT).toBeDefined();
      expect(GOVERNANCE_SEEDS.ESCROW_VAULT_AUTH).toBeDefined();
      expect(GOVERNANCE_SEEDS.PROPOSAL).toBeDefined();
      expect(GOVERNANCE_SEEDS.VOTE_RECORD).toBeDefined();
    });

    it("governance seeds are Buffer instances", () => {
      Object.values(GOVERNANCE_SEEDS).forEach((seed) => {
        expect(Buffer.isBuffer(seed)).toBe(true);
      });
    });

    it("governance seeds are unique", () => {
      const seedValues = Object.values(GOVERNANCE_SEEDS).map((s) =>
        s.toString("hex")
      );
      const uniqueSeeds = new Set(seedValues);
      expect(uniqueSeeds.size).toBe(seedValues.length);
    });
  });
});

describe("Time Constants", () => {
  describe("HOLD_PERIODS", () => {
    it("New tier has 7 day hold", () => {
      const sevenDays = 7 * 24 * 60 * 60;
      expect(HOLD_PERIODS[AffiliateTier.New]).toBe(sevenDays);
    });

    it("Verified tier has 3 day hold", () => {
      const threeDays = 3 * 24 * 60 * 60;
      expect(HOLD_PERIODS[AffiliateTier.Verified]).toBe(threeDays);
    });

    it("Trusted tier has 24 hour hold", () => {
      const oneDay = 24 * 60 * 60;
      expect(HOLD_PERIODS[AffiliateTier.Trusted]).toBe(oneDay);
    });

    it("Elite tier has instant settlement", () => {
      expect(HOLD_PERIODS[AffiliateTier.Elite]).toBe(0);
    });

    it("hold periods decrease with tier", () => {
      expect(HOLD_PERIODS[AffiliateTier.New]).toBeGreaterThan(
        HOLD_PERIODS[AffiliateTier.Verified]
      );
      expect(HOLD_PERIODS[AffiliateTier.Verified]).toBeGreaterThan(
        HOLD_PERIODS[AffiliateTier.Trusted]
      );
      expect(HOLD_PERIODS[AffiliateTier.Trusted]).toBeGreaterThan(
        HOLD_PERIODS[AffiliateTier.Elite]
      );
    });
  });

  describe("GOVERNANCE_CONSTANTS", () => {
    it("min lock is 1 week", () => {
      const oneWeek = 7 * 24 * 60 * 60;
      expect(GOVERNANCE_CONSTANTS.MIN_LOCK_DURATION).toBe(oneWeek);
    });

    it("max lock is 4 years", () => {
      const fourYears = 4 * 365 * 24 * 60 * 60;
      expect(GOVERNANCE_CONSTANTS.MAX_LOCK_DURATION).toBe(fourYears);
    });

    it("default voting period is 3 days", () => {
      const threeDays = 3 * 24 * 60 * 60;
      expect(GOVERNANCE_CONSTANTS.DEFAULT_VOTING_PERIOD).toBe(threeDays);
    });

    it("default timelock is 1 day", () => {
      const oneDay = 24 * 60 * 60;
      expect(GOVERNANCE_CONSTANTS.DEFAULT_TIMELOCK_DELAY).toBe(oneDay);
    });

    it("default quorum is 4%", () => {
      expect(GOVERNANCE_CONSTANTS.DEFAULT_QUORUM_BPS).toBe(400);
    });

    it("max lock exceeds min lock", () => {
      expect(GOVERNANCE_CONSTANTS.MAX_LOCK_DURATION).toBeGreaterThan(
        GOVERNANCE_CONSTANTS.MIN_LOCK_DURATION
      );
    });
  });
});

describe("Staking Constants", () => {
  describe("MIN_STAKES for affiliates", () => {
    it("New tier requires no stake", () => {
      expect(MIN_STAKES[AffiliateTier.New]).toBe(0);
    });

    it("Verified tier requires 100 NJORD", () => {
      expect(MIN_STAKES[AffiliateTier.Verified]).toBe(100);
    });

    it("Trusted tier requires 1,000 NJORD", () => {
      expect(MIN_STAKES[AffiliateTier.Trusted]).toBe(1000);
    });

    it("Elite tier requires 10,000 NJORD", () => {
      expect(MIN_STAKES[AffiliateTier.Elite]).toBe(10000);
    });

    it("stakes increase with tier", () => {
      expect(MIN_STAKES[AffiliateTier.New]).toBeLessThan(
        MIN_STAKES[AffiliateTier.Verified]
      );
      expect(MIN_STAKES[AffiliateTier.Verified]).toBeLessThan(
        MIN_STAKES[AffiliateTier.Trusted]
      );
      expect(MIN_STAKES[AffiliateTier.Trusted]).toBeLessThan(
        MIN_STAKES[AffiliateTier.Elite]
      );
    });
  });

  describe("BRIDGE_MIN_STAKES", () => {
    it("Bronze requires 10,000 NJORD", () => {
      expect(BRIDGE_MIN_STAKES[BridgeTier.Bronze]).toBe(10000);
    });

    it("Silver requires 50,000 NJORD", () => {
      expect(BRIDGE_MIN_STAKES[BridgeTier.Silver]).toBe(50000);
    });

    it("Gold requires 200,000 NJORD", () => {
      expect(BRIDGE_MIN_STAKES[BridgeTier.Gold]).toBe(200000);
    });

    it("Platinum requires 500,000 NJORD", () => {
      expect(BRIDGE_MIN_STAKES[BridgeTier.Platinum]).toBe(500000);
    });

    it("bridge stakes increase with tier", () => {
      expect(BRIDGE_MIN_STAKES[BridgeTier.Bronze]).toBeLessThan(
        BRIDGE_MIN_STAKES[BridgeTier.Silver]
      );
      expect(BRIDGE_MIN_STAKES[BridgeTier.Silver]).toBeLessThan(
        BRIDGE_MIN_STAKES[BridgeTier.Gold]
      );
      expect(BRIDGE_MIN_STAKES[BridgeTier.Gold]).toBeLessThan(
        BRIDGE_MIN_STAKES[BridgeTier.Platinum]
      );
    });

    it("lowest bridge stake equals highest affiliate stake", () => {
      expect(BRIDGE_MIN_STAKES[BridgeTier.Bronze]).toBe(
        MIN_STAKES[AffiliateTier.Elite]
      );
    });
  });
});

describe("Token Constants", () => {
  it("NJORD has 9 decimals", () => {
    expect(NJORD_DECIMALS).toBe(9);
  });

  it("USDC has 6 decimals", () => {
    expect(USDC_DECIMALS).toBe(6);
  });

  it("BASIS_POINTS is 10000", () => {
    expect(BASIS_POINTS).toBe(10000);
  });

  it("100% in basis points equals BASIS_POINTS", () => {
    expect(BASIS_POINTS).toBe(10000);
  });

  it("1% equals 100 basis points", () => {
    expect(BASIS_POINTS / 100).toBe(100);
  });

  it("0.01% equals 1 basis point", () => {
    expect(BASIS_POINTS / 10000).toBe(1);
  });
});

describe("Enum Value Ranges", () => {
  it("all affiliate tiers are sequential from 0", () => {
    const tiers = [
      AffiliateTier.New,
      AffiliateTier.Verified,
      AffiliateTier.Trusted,
      AffiliateTier.Elite,
    ];
    tiers.forEach((tier, index) => {
      expect(tier).toBe(index);
    });
  });

  it("all bridge tiers are sequential from 0", () => {
    const tiers = [
      BridgeTier.Bronze,
      BridgeTier.Silver,
      BridgeTier.Gold,
      BridgeTier.Platinum,
    ];
    tiers.forEach((tier, index) => {
      expect(tier).toBe(index);
    });
  });

  it("all attribution statuses are sequential from 0", () => {
    const statuses = [
      AttributionStatus.Pending,
      AttributionStatus.Challenged,
      AttributionStatus.Settled,
      AttributionStatus.Rejected,
      AttributionStatus.Refunded,
    ];
    statuses.forEach((status, index) => {
      expect(status).toBe(index);
    });
  });

  it("all proposal statuses are sequential from 0", () => {
    const statuses = [
      ProposalStatus.Pending,
      ProposalStatus.Active,
      ProposalStatus.Succeeded,
      ProposalStatus.Defeated,
      ProposalStatus.Queued,
      ProposalStatus.Executed,
      ProposalStatus.Canceled,
      ProposalStatus.Expired,
    ];
    statuses.forEach((status, index) => {
      expect(status).toBe(index);
    });
  });
});
