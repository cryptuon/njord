import { PublicKey } from "@solana/web3.js";

// Event types emitted by the Njord program
export enum NjordEventType {
  // Campaign events
  CampaignCreated = "CampaignCreated",
  CampaignUpdated = "CampaignUpdated",
  CampaignPaused = "CampaignPaused",
  CampaignResumed = "CampaignResumed",
  CampaignEnded = "CampaignEnded",
  CampaignFunded = "CampaignFunded",

  // Affiliate events
  AffiliateRegistered = "AffiliateRegistered",
  AffiliateApproved = "AffiliateApproved",
  AffiliateRejected = "AffiliateRejected",
  AffiliateSuspended = "AffiliateSuspended",
  AffiliateStaked = "AffiliateStaked",
  AffiliateUnstaked = "AffiliateUnstaked",
  AffiliateTierChanged = "AffiliateTierChanged",

  // Attribution events
  AttributionRecorded = "AttributionRecorded",
  AttributionReleased = "AttributionReleased",
  AttributionChallenged = "AttributionChallenged",
  AttributionSlashed = "AttributionSlashed",

  // Bridge events
  BridgeRegistered = "BridgeRegistered",
  BridgeStaked = "BridgeStaked",
  BridgeUnstaked = "BridgeUnstaked",
  BridgeTierChanged = "BridgeTierChanged",
  BridgeSlashed = "BridgeSlashed",

  // Challenge events
  ChallengeCreated = "ChallengeCreated",
  ChallengeResolved = "ChallengeResolved",
}

// Base event structure
export interface NjordEvent {
  type: NjordEventType;
  slot: number;
  signature: string;
  timestamp: Date;
  accounts: string[];
  data: unknown;
}

// Specific event data types
export interface CampaignCreatedEvent extends NjordEvent {
  type: NjordEventType.CampaignCreated;
  data: {
    campaign: string;
    company: string;
    mint: string;
    name: string;
    commissionType: string;
    commissionValue: number;
    budget: number;
  };
}

export interface AffiliateRegisteredEvent extends NjordEvent {
  type: NjordEventType.AffiliateRegistered;
  data: {
    affiliate: string;
    campaign: string;
    wallet: string;
  };
}

export interface AttributionRecordedEvent extends NjordEvent {
  type: NjordEventType.AttributionRecorded;
  data: {
    attribution: string;
    campaign: string;
    affiliate: string;
    bridge: string | null;
    customerHash: string;
    actionValue: number;
    commission: number;
    fraudScore: number;
  };
}

export interface BridgeRegisteredEvent extends NjordEvent {
  type: NjordEventType.BridgeRegistered;
  data: {
    bridge: string;
    operator: string;
    name: string;
    stakeAmount: number;
  };
}

export interface ChallengeCreatedEvent extends NjordEvent {
  type: NjordEventType.ChallengeCreated;
  data: {
    challenge: string;
    attribution: string;
    challenger: string;
    challengerType: string;
    bondAmount: number;
  };
}

export interface ChallengeResolvedEvent extends NjordEvent {
  type: NjordEventType.ChallengeResolved;
  data: {
    challenge: string;
    outcome: string;
    resolvedBy: string;
  };
}

// Event handler callback type
export type EventHandler = (event: NjordEvent) => Promise<void>;

// Listener configuration
export interface ListenerConfig {
  solanaRpc: string;
  programId: string | PublicKey;
  startSlot?: number;
  commitment?: "processed" | "confirmed" | "finalized";
}
