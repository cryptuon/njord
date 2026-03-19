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
} from "../types";

describe("Enums", () => {
  describe("AffiliateTier", () => {
    it("has correct values", () => {
      expect(AffiliateTier.New).toBe(0);
      expect(AffiliateTier.Verified).toBe(1);
      expect(AffiliateTier.Trusted).toBe(2);
      expect(AffiliateTier.Elite).toBe(3);
    });
  });

  describe("BridgeTier", () => {
    it("has correct values", () => {
      expect(BridgeTier.Bronze).toBe(0);
      expect(BridgeTier.Silver).toBe(1);
      expect(BridgeTier.Gold).toBe(2);
      expect(BridgeTier.Platinum).toBe(3);
    });
  });

  describe("CommissionType", () => {
    it("has correct values", () => {
      expect(CommissionType.Percentage).toBe(0);
      expect(CommissionType.Flat).toBe(1);
      expect(CommissionType.Tiered).toBe(2);
    });
  });

  describe("AttributionStatus", () => {
    it("has correct values", () => {
      expect(AttributionStatus.Pending).toBe(0);
      expect(AttributionStatus.Challenged).toBe(1);
      expect(AttributionStatus.Settled).toBe(2);
      expect(AttributionStatus.Rejected).toBe(3);
      expect(AttributionStatus.Refunded).toBe(4);
    });
  });

  describe("ChallengeStatus", () => {
    it("has correct values", () => {
      expect(ChallengeStatus.Pending).toBe(0);
      expect(ChallengeStatus.EvidenceSubmitted).toBe(1);
      expect(ChallengeStatus.Resolved).toBe(2);
      expect(ChallengeStatus.Expired).toBe(3);
    });
  });

  describe("ChallengeOutcome", () => {
    it("has correct values", () => {
      expect(ChallengeOutcome.Pending).toBe(0);
      expect(ChallengeOutcome.FraudConfirmed).toBe(1);
      expect(ChallengeOutcome.ChallengeRejected).toBe(2);
      expect(ChallengeOutcome.Inconclusive).toBe(3);
    });
  });

  describe("ChallengerType", () => {
    it("has correct values", () => {
      expect(ChallengerType.Company).toBe(0);
      expect(ChallengerType.Bridge).toBe(1);
      expect(ChallengerType.Affiliate).toBe(2);
      expect(ChallengerType.Protocol).toBe(3);
    });
  });

  describe("ProposalType", () => {
    it("has correct values", () => {
      expect(ProposalType.ParameterChange).toBe(0);
      expect(ProposalType.FeeUpdate).toBe(1);
      expect(ProposalType.TreasurySpend).toBe(2);
      expect(ProposalType.Emergency).toBe(3);
      expect(ProposalType.General).toBe(4);
    });
  });

  describe("ProposalStatus", () => {
    it("has correct values", () => {
      expect(ProposalStatus.Pending).toBe(0);
      expect(ProposalStatus.Active).toBe(1);
      expect(ProposalStatus.Succeeded).toBe(2);
      expect(ProposalStatus.Defeated).toBe(3);
      expect(ProposalStatus.Queued).toBe(4);
      expect(ProposalStatus.Executed).toBe(5);
      expect(ProposalStatus.Canceled).toBe(6);
      expect(ProposalStatus.Expired).toBe(7);
    });
  });

  describe("VoteChoice", () => {
    it("has correct values", () => {
      expect(VoteChoice.For).toBe(0);
      expect(VoteChoice.Against).toBe(1);
      expect(VoteChoice.Abstain).toBe(2);
    });
  });
});

describe("Seeds", () => {
  describe("SEEDS", () => {
    it("has all required seeds", () => {
      expect(SEEDS.PROTOCOL_CONFIG).toBeDefined();
      expect(SEEDS.CAMPAIGN).toBeDefined();
      expect(SEEDS.ESCROW).toBeDefined();
      expect(SEEDS.AFFILIATE_PROFILE).toBeDefined();
      expect(SEEDS.AFFILIATE_STAKE).toBeDefined();
      expect(SEEDS.AFFILIATE_REGISTRATION).toBeDefined();
      expect(SEEDS.ATTRIBUTION).toBeDefined();
      expect(SEEDS.BRIDGE).toBeDefined();
      expect(SEEDS.CHALLENGE).toBeDefined();
    });

    it("seeds are Buffer instances", () => {
      expect(Buffer.isBuffer(SEEDS.PROTOCOL_CONFIG)).toBe(true);
      expect(Buffer.isBuffer(SEEDS.CAMPAIGN)).toBe(true);
    });
  });

  describe("GOVERNANCE_SEEDS", () => {
    it("has all required seeds", () => {
      expect(GOVERNANCE_SEEDS.GOVERNANCE_CONFIG).toBeDefined();
      expect(GOVERNANCE_SEEDS.PROTOCOL_PARAMS).toBeDefined();
      expect(GOVERNANCE_SEEDS.VOTING_ESCROW).toBeDefined();
      expect(GOVERNANCE_SEEDS.PROPOSAL).toBeDefined();
      expect(GOVERNANCE_SEEDS.VOTE_RECORD).toBeDefined();
    });
  });
});

describe("Constants", () => {
  describe("Token decimals", () => {
    it("has correct NJORD decimals", () => {
      expect(NJORD_DECIMALS).toBe(9);
    });

    it("has correct USDC decimals", () => {
      expect(USDC_DECIMALS).toBe(6);
    });
  });

  describe("BASIS_POINTS", () => {
    it("is 10000", () => {
      expect(BASIS_POINTS).toBe(10000);
    });
  });

  describe("HOLD_PERIODS", () => {
    it("has correct hold periods for each tier", () => {
      expect(HOLD_PERIODS[AffiliateTier.New]).toBe(7 * 24 * 60 * 60); // 7 days
      expect(HOLD_PERIODS[AffiliateTier.Verified]).toBe(3 * 24 * 60 * 60); // 3 days
      expect(HOLD_PERIODS[AffiliateTier.Trusted]).toBe(24 * 60 * 60); // 24 hours
      expect(HOLD_PERIODS[AffiliateTier.Elite]).toBe(0); // Real-time
    });

    it("decreases as tier increases", () => {
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

  describe("MIN_STAKES", () => {
    it("has correct minimum stakes for each affiliate tier", () => {
      expect(MIN_STAKES[AffiliateTier.New]).toBe(0);
      expect(MIN_STAKES[AffiliateTier.Verified]).toBe(100);
      expect(MIN_STAKES[AffiliateTier.Trusted]).toBe(1000);
      expect(MIN_STAKES[AffiliateTier.Elite]).toBe(10000);
    });

    it("increases as tier increases", () => {
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
    it("has correct minimum stakes for each bridge tier", () => {
      expect(BRIDGE_MIN_STAKES[BridgeTier.Bronze]).toBe(10000);
      expect(BRIDGE_MIN_STAKES[BridgeTier.Silver]).toBe(50000);
      expect(BRIDGE_MIN_STAKES[BridgeTier.Gold]).toBe(200000);
      expect(BRIDGE_MIN_STAKES[BridgeTier.Platinum]).toBe(500000);
    });

    it("increases as tier increases", () => {
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
  });

  describe("GOVERNANCE_CONSTANTS", () => {
    it("has valid lock durations", () => {
      expect(GOVERNANCE_CONSTANTS.MIN_LOCK_DURATION).toBe(7 * 24 * 60 * 60); // 1 week
      expect(GOVERNANCE_CONSTANTS.MAX_LOCK_DURATION).toBe(4 * 365 * 24 * 60 * 60); // 4 years
      expect(GOVERNANCE_CONSTANTS.MIN_LOCK_DURATION).toBeLessThan(
        GOVERNANCE_CONSTANTS.MAX_LOCK_DURATION
      );
    });

    it("has valid voting period", () => {
      expect(GOVERNANCE_CONSTANTS.DEFAULT_VOTING_PERIOD).toBe(3 * 24 * 60 * 60); // 3 days
    });

    it("has valid timelock delay", () => {
      expect(GOVERNANCE_CONSTANTS.DEFAULT_TIMELOCK_DELAY).toBe(24 * 60 * 60); // 1 day
    });

    it("has valid quorum", () => {
      expect(GOVERNANCE_CONSTANTS.DEFAULT_QUORUM_BPS).toBe(400); // 4%
      expect(GOVERNANCE_CONSTANTS.DEFAULT_QUORUM_BPS).toBeLessThanOrEqual(10000);
    });
  });
});
