import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// ============== Enums ==============

export enum CampaignStatus {
  Active = 0,
  Paused = 1,
  Ended = 2,
}

export enum CommissionType {
  Percentage = 0,
  Flat = 1,
  Tiered = 2,
}

export enum AttributionModel {
  LastClick = 0,
  FirstClick = 1,
}

export enum TargetAction {
  Purchase = 0,
  Signup = 1,
  AppInstall = 2,
  Subscription = 3,
}

export enum AffiliateTier {
  New = 0,
  Verified = 1,
  Trusted = 2,
  Elite = 3,
}

export enum AffiliateStatus {
  Active = 0,
  PendingApproval = 1,
  Suspended = 2,
}

export enum AttributionStatus {
  Pending = 0,
  Challenged = 1,
  Settled = 2,
  Rejected = 3,
  Refunded = 4,
}

export enum BridgeStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2,
  Unbonding = 3,
}

export enum BridgeTier {
  Bronze = 0,
  Silver = 1,
  Gold = 2,
  Platinum = 3,
}

export enum ChallengeStatus {
  Pending = 0,
  EvidenceSubmitted = 1,
  Resolved = 2,
  Expired = 3,
}

export enum ChallengeOutcome {
  Pending = 0,
  FraudConfirmed = 1,
  ChallengeRejected = 2,
  Inconclusive = 3,
}

export enum ChallengerType {
  Company = 0,
  Bridge = 1,
  Affiliate = 2,
  Protocol = 3,
}

// ============== Account Types ==============

export interface ProtocolConfig {
  authority: PublicKey;
  treasury: PublicKey;
  protocolFeeBps: number;
  minChallengeBond: BN;
  njordMint: PublicKey;
  totalCampaigns: BN;
  totalAttributions: BN;
  totalVolume: BN;
  bump: number;
}

export interface Campaign {
  company: PublicKey;
  paymentMint: PublicKey;
  escrow: PublicKey;
  budget: BN;
  spent: BN;
  commissionType: CommissionType;
  commissionRateBps: number;
  attributionModel: AttributionModel;
  targetAction: TargetAction;
  minAffiliateTier: AffiliateTier;
  customHoldPeriod: BN;
  status: CampaignStatus;
  startTime: BN;
  endTime: BN;
  maxAffiliates: number;
  affiliateCount: number;
  totalAttributions: BN;
  autoApprove: boolean;
  metadataUri: string;
  campaignId: BN;
  createdAt: BN;
  bump: number;
}

export interface AffiliateProfile {
  wallet: PublicKey;
  tier: AffiliateTier;
  stakeAccount: PublicKey;
  stakedAmount: BN;
  totalCampaigns: number;
  totalAttributions: BN;
  totalEarnings: BN;
  disputeRateBps: number;
  disputesLost: number;
  createdAt: BN;
  lastActiveAt: BN;
  isSuspended: boolean;
  suspensionEndsAt: BN;
  bump: number;
}

export interface AffiliateRegistration {
  affiliate: PublicKey;
  campaign: PublicKey;
  status: AffiliateStatus;
  attributionsCount: BN;
  earnings: BN;
  pendingEarnings: BN;
  joinedAt: BN;
  bump: number;
}

export interface Attribution {
  campaign: PublicKey;
  affiliateRegistration: PublicKey;
  bridge: PublicKey;
  actionValue: BN;
  commissionAmount: BN;
  protocolFee: BN;
  bridgeFee: BN;
  netCommission: BN;
  customerHash: Uint8Array;
  status: AttributionStatus;
  fraudScore: number;
  createdAt: BN;
  settlesAt: BN;
  settledAt: BN;
  nonce: Uint8Array;
  attributionId: BN;
  bump: number;
}

export interface Bridge {
  operator: PublicKey;
  stakeAccount: PublicKey;
  stakedAmount: BN;
  tier: BridgeTier;
  status: BridgeStatus;
  region: Uint8Array;
  totalAttributions: BN;
  totalVolume: BN;
  dailyVolume: BN;
  dailyVolumeResetAt: BN;
  fraudRateBps: number;
  fraudCount: number;
  reputationScore: number;
  totalFeesEarned: BN;
  slashingCount: number;
  lastSlashedAt: BN;
  unbondingAmount: BN;
  unbondingEndsAt: BN;
  registeredAt: BN;
  lastActiveAt: BN;
  metadataUri: string;
  bump: number;
}

export interface Challenge {
  attribution: PublicKey;
  challenger: PublicKey;
  challengerType: ChallengerType;
  bondAmount: BN;
  status: ChallengeStatus;
  outcome: ChallengeOutcome;
  evidenceUri: string;
  counterEvidenceUri: string;
  createdAt: BN;
  evidenceDeadline: BN;
  resolutionDeadline: BN;
  resolvedAt: BN;
  resolver: PublicKey;
  bump: number;
}

// ============== Instruction Params ==============

export interface CreateCampaignParams {
  commissionType: CommissionType;
  commissionRateBps: number;
  attributionModel: AttributionModel;
  targetAction: TargetAction;
  minAffiliateTier: AffiliateTier;
  customHoldPeriod: BN;
  startTime: BN;
  endTime: BN;
  maxAffiliates: number;
  autoApprove: boolean;
  metadataUri: string;
}

export interface RecordAttributionParams {
  actionValue: BN;
  customerHash: Uint8Array;
  nonce: Uint8Array;
  fraudScore: number;
}

// ============== PDA Seeds ==============

export const SEEDS = {
  PROTOCOL_CONFIG: Buffer.from("protocol_config"),
  CAMPAIGN: Buffer.from("campaign"),
  ESCROW: Buffer.from("escrow"),
  AFFILIATE_PROFILE: Buffer.from("affiliate_profile"),
  AFFILIATE_STAKE: Buffer.from("affiliate_stake"),
  AFFILIATE_STAKE_VAULT: Buffer.from("affiliate_stake_vault"),
  AFFILIATE_REGISTRATION: Buffer.from("affiliate_registration"),
  ATTRIBUTION: Buffer.from("attribution"),
  CUSTOMER_ATTRIBUTION: Buffer.from("customer_attribution"),
  BRIDGE: Buffer.from("bridge"),
  BRIDGE_STAKE: Buffer.from("bridge_stake"),
  BRIDGE_STAKE_VAULT: Buffer.from("bridge_stake_vault"),
  CHALLENGE: Buffer.from("challenge"),
  CHALLENGE_ESCROW: Buffer.from("challenge_escrow"),
} as const;

// ============== Constants ==============

export const NJORD_DECIMALS = 9;
export const USDC_DECIMALS = 6;
export const BASIS_POINTS = 10000;

export const HOLD_PERIODS = {
  [AffiliateTier.New]: 7 * 24 * 60 * 60,      // 7 days
  [AffiliateTier.Verified]: 3 * 24 * 60 * 60, // 3 days
  [AffiliateTier.Trusted]: 24 * 60 * 60,      // 24 hours
  [AffiliateTier.Elite]: 0,                    // Real-time
} as const;

export const MIN_STAKES = {
  [AffiliateTier.New]: 0,
  [AffiliateTier.Verified]: 100,    // 100 NJORD
  [AffiliateTier.Trusted]: 1_000,   // 1,000 NJORD
  [AffiliateTier.Elite]: 10_000,    // 10,000 NJORD
} as const;

export const BRIDGE_MIN_STAKES = {
  [BridgeTier.Bronze]: 10_000,      // 10,000 NJORD
  [BridgeTier.Silver]: 50_000,      // 50,000 NJORD
  [BridgeTier.Gold]: 200_000,       // 200,000 NJORD
  [BridgeTier.Platinum]: 500_000,   // 500,000 NJORD
} as const;

// ============== Governance Enums ==============

export enum ProposalType {
  ParameterChange = 0,
  FeeUpdate = 1,
  TreasurySpend = 2,
  Emergency = 3,
  General = 4,
}

export enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Succeeded = 2,
  Defeated = 3,
  Queued = 4,
  Executed = 5,
  Canceled = 6,
  Expired = 7,
}

export enum VoteChoice {
  For = 0,
  Against = 1,
  Abstain = 2,
}

// ============== Governance Account Types ==============

export interface GovernanceConfig {
  authority: PublicKey;
  njordMint: PublicKey;
  proposalThreshold: BN;
  quorumBps: number;
  votingPeriod: BN;
  timelockDelay: BN;
  proposalCount: BN;
  bump: number;
}

export interface Proposal {
  id: BN;
  proposer: PublicKey;
  title: string;
  descriptionHash: string;
  proposalType: ProposalType;
  proposalData: Uint8Array;
  status: ProposalStatus;
  forVotes: BN;
  againstVotes: BN;
  abstainVotes: BN;
  startTime: BN;
  endTime: BN;
  executionTime: BN | null;
  executed: boolean;
  canceled: boolean;
  createdAt: BN;
  bump: number;
}

export interface VoteRecord {
  voter: PublicKey;
  proposalId: BN;
  vote: VoteChoice;
  votingPower: BN;
  votedAt: BN;
  bump: number;
}

export interface VotingEscrow {
  owner: PublicKey;
  lockedAmount: BN;
  lockEnd: BN;
  lastUpdate: BN;
  bump: number;
}

export interface ProtocolParameters {
  authority: PublicKey;
  bronzeMinStake: BN;
  silverMinStake: BN;
  goldMinStake: BN;
  platinumMinStake: BN;
  protocolFeeBps: number;
  minChallengeBond: BN;
  maxFraudScore: number;
  defaultHoldPeriod: BN;
  maxLockTime: BN;
  updatedAt: BN;
  bump: number;
}

// ============== Governance Instruction Params ==============

export interface CreateVotingEscrowParams {
  amount: BN;
  lockDuration: BN;
}

export interface CreateProposalParams {
  title: string;
  descriptionHash: string;
  proposalType: ProposalType;
  proposalData: Uint8Array;
}

export interface CastVoteParams {
  proposalId: BN;
  vote: VoteChoice;
}

// ============== Governance PDA Seeds ==============

export const GOVERNANCE_SEEDS = {
  GOVERNANCE_CONFIG: Buffer.from("governance"),
  PROTOCOL_PARAMS: Buffer.from("protocol_params"),
  VOTING_ESCROW: Buffer.from("voting_escrow"),
  ESCROW_VAULT: Buffer.from("escrow_vault"),
  ESCROW_VAULT_AUTH: Buffer.from("escrow_vault_auth"),
  PROPOSAL: Buffer.from("proposal"),
  VOTE_RECORD: Buffer.from("vote"),
} as const;

// ============== Governance Constants ==============

export const GOVERNANCE_CONSTANTS = {
  MIN_LOCK_DURATION: 7 * 24 * 60 * 60,       // 1 week
  MAX_LOCK_DURATION: 4 * 365 * 24 * 60 * 60, // 4 years
  DEFAULT_VOTING_PERIOD: 3 * 24 * 60 * 60,   // 3 days
  DEFAULT_TIMELOCK_DELAY: 24 * 60 * 60,      // 24 hours
  DEFAULT_QUORUM_BPS: 400,                    // 4%
} as const;
