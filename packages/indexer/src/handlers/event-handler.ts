import { eq, and } from "drizzle-orm";
import pino from "pino";
import {
  Database,
  campaigns,
  affiliates,
  affiliateRegistrations,
  attributions,
  bridges,
  challenges,
  events,
  NewCampaign,
  NewAffiliate,
  NewAttribution,
  NewBridge,
  NewChallenge,
  NewEvent,
} from "../db";
import { NjordEvent, NjordEventType } from "../listener";

export class EventHandler {
  private db: Database;
  private logger: pino.Logger;

  constructor(db: Database) {
    this.db = db;
    this.logger = pino({ name: "event-handler" });
  }

  /**
   * Main event handler entry point
   */
  async handle(event: NjordEvent): Promise<void> {
    this.logger.debug({ type: event.type, signature: event.signature }, "Processing event");

    // Store raw event for audit trail
    await this.storeRawEvent(event);

    // Process by event type
    switch (event.type) {
      case NjordEventType.CampaignCreated:
        await this.handleCampaignCreated(event);
        break;
      case NjordEventType.CampaignUpdated:
        await this.handleCampaignUpdated(event);
        break;
      case NjordEventType.CampaignPaused:
      case NjordEventType.CampaignResumed:
        await this.handleCampaignStatusChange(event);
        break;
      case NjordEventType.AffiliateRegistered:
        await this.handleAffiliateRegistered(event);
        break;
      case NjordEventType.AffiliateApproved:
      case NjordEventType.AffiliateRejected:
      case NjordEventType.AffiliateSuspended:
        await this.handleAffiliateStatusChange(event);
        break;
      case NjordEventType.AffiliateStaked:
      case NjordEventType.AffiliateUnstaked:
        await this.handleAffiliateStake(event);
        break;
      case NjordEventType.AttributionRecorded:
        await this.handleAttributionRecorded(event);
        break;
      case NjordEventType.AttributionReleased:
        await this.handleAttributionReleased(event);
        break;
      case NjordEventType.AttributionSlashed:
        await this.handleAttributionSlashed(event);
        break;
      case NjordEventType.BridgeRegistered:
        await this.handleBridgeRegistered(event);
        break;
      case NjordEventType.BridgeStaked:
      case NjordEventType.BridgeUnstaked:
        await this.handleBridgeStake(event);
        break;
      case NjordEventType.BridgeSlashed:
        await this.handleBridgeSlashed(event);
        break;
      case NjordEventType.ChallengeCreated:
        await this.handleChallengeCreated(event);
        break;
      case NjordEventType.ChallengeResolved:
        await this.handleChallengeResolved(event);
        break;
      default:
        this.logger.warn({ type: event.type }, "Unknown event type");
    }
  }

  /**
   * Store raw event for audit trail
   */
  private async storeRawEvent(event: NjordEvent): Promise<void> {
    const newEvent: NewEvent = {
      slot: event.slot,
      signature: event.signature,
      eventType: event.type,
      programId: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS", // NJORD_PROGRAM_ID
      accounts: event.accounts,
      data: event.data as Record<string, unknown>,
      timestamp: event.timestamp,
    };

    try {
      await this.db.insert(events).values(newEvent).onConflictDoNothing();
    } catch (err) {
      this.logger.error({ err, signature: event.signature }, "Failed to store raw event");
    }
  }

  /**
   * Handle campaign creation
   */
  private async handleCampaignCreated(event: NjordEvent): Promise<void> {
    const data = event.data as {
      campaign: string;
      company: string;
      mint: string;
      name: string;
      commissionType: string;
      commissionValue: number;
      maxCommission?: number;
      budget: number;
      holdPeriod: number;
      minAffiliateTier: string;
    };

    const newCampaign: NewCampaign = {
      pubkey: data.campaign,
      company: data.company,
      mint: data.mint,
      name: data.name,
      commissionType: data.commissionType,
      commissionValue: data.commissionValue,
      maxCommission: data.maxCommission,
      budget: data.budget,
      holdPeriod: data.holdPeriod,
      minAffiliateTier: data.minAffiliateTier,
    };

    await this.db.insert(campaigns).values(newCampaign).onConflictDoNothing();
    this.logger.info({ campaign: data.campaign }, "Campaign created");
  }

  /**
   * Handle campaign update
   */
  private async handleCampaignUpdated(event: NjordEvent): Promise<void> {
    const data = event.data as {
      campaign: string;
      [key: string]: unknown;
    };

    const { campaign, ...updates } = data;

    await this.db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.pubkey, campaign));

    this.logger.info({ campaign }, "Campaign updated");
  }

  /**
   * Handle campaign pause/resume
   */
  private async handleCampaignStatusChange(event: NjordEvent): Promise<void> {
    const data = event.data as { campaign: string };
    const isPaused = event.type === NjordEventType.CampaignPaused;

    await this.db
      .update(campaigns)
      .set({ isPaused, updatedAt: new Date() })
      .where(eq(campaigns.pubkey, data.campaign));
  }

  /**
   * Handle affiliate registration
   */
  private async handleAffiliateRegistered(event: NjordEvent): Promise<void> {
    const data = event.data as {
      affiliate: string;
      registration: string;
      campaign: string;
      wallet: string;
    };

    // Upsert affiliate profile
    const existingAffiliate = await this.db
      .select()
      .from(affiliates)
      .where(eq(affiliates.wallet, data.wallet))
      .limit(1);

    let affiliateId: string;

    if (existingAffiliate.length === 0) {
      const [newAffiliate] = await this.db
        .insert(affiliates)
        .values({
          pubkey: data.affiliate,
          wallet: data.wallet,
          tier: "new",
        })
        .returning({ id: affiliates.id });
      affiliateId = newAffiliate.id;
    } else {
      affiliateId = existingAffiliate[0].id;
    }

    // Get campaign ID
    const [campaignRecord] = await this.db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.pubkey, data.campaign))
      .limit(1);

    if (!campaignRecord) {
      this.logger.warn({ campaign: data.campaign }, "Campaign not found for registration");
      return;
    }

    // Create registration
    await this.db
      .insert(affiliateRegistrations)
      .values({
        pubkey: data.registration,
        affiliateId,
        campaignId: campaignRecord.id,
        status: "pending",
      })
      .onConflictDoNothing();

    this.logger.info({ affiliate: data.affiliate, campaign: data.campaign }, "Affiliate registered");
  }

  /**
   * Handle affiliate status changes (approved/rejected/suspended)
   */
  private async handleAffiliateStatusChange(event: NjordEvent): Promise<void> {
    const data = event.data as { registration: string };

    const statusMap: Record<NjordEventType, string> = {
      [NjordEventType.AffiliateApproved]: "approved",
      [NjordEventType.AffiliateRejected]: "rejected",
      [NjordEventType.AffiliateSuspended]: "suspended",
    } as Record<NjordEventType, string>;

    const status = statusMap[event.type];
    if (!status) return;

    await this.db
      .update(affiliateRegistrations)
      .set({ status, updatedAt: new Date() })
      .where(eq(affiliateRegistrations.pubkey, data.registration));
  }

  /**
   * Handle affiliate stake changes
   */
  private async handleAffiliateStake(event: NjordEvent): Promise<void> {
    const data = event.data as {
      affiliate: string;
      amount: number;
      newTier: string;
    };

    await this.db
      .update(affiliates)
      .set({ tier: data.newTier, updatedAt: new Date() })
      .where(eq(affiliates.pubkey, data.affiliate));
  }

  /**
   * Handle attribution recorded
   */
  private async handleAttributionRecorded(event: NjordEvent): Promise<void> {
    const data = event.data as {
      attribution: string;
      campaign: string;
      affiliate: string;
      bridge?: string;
      customerHash: string;
      actionValue: number;
      commission: number;
      fraudScore: number;
      releaseTime: number;
    };

    // Get campaign ID
    const [campaignRecord] = await this.db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.pubkey, data.campaign))
      .limit(1);

    // Get affiliate ID
    const [affiliateRecord] = await this.db
      .select({ id: affiliates.id })
      .from(affiliates)
      .where(eq(affiliates.pubkey, data.affiliate))
      .limit(1);

    // Get bridge ID if present
    let bridgeId: string | null = null;
    if (data.bridge) {
      const [bridgeRecord] = await this.db
        .select({ id: bridges.id })
        .from(bridges)
        .where(eq(bridges.pubkey, data.bridge))
        .limit(1);
      bridgeId = bridgeRecord?.id ?? null;
    }

    if (!campaignRecord || !affiliateRecord) {
      this.logger.warn({ data }, "Campaign or affiliate not found for attribution");
      return;
    }

    const newAttribution: NewAttribution = {
      pubkey: data.attribution,
      campaignId: campaignRecord.id,
      affiliateId: affiliateRecord.id,
      bridgeId,
      customerHash: data.customerHash,
      actionValue: data.actionValue,
      commission: data.commission,
      status: "held",
      fraudScore: data.fraudScore,
      releaseTime: new Date(data.releaseTime * 1000),
      signature: event.signature,
    };

    await this.db.insert(attributions).values(newAttribution).onConflictDoNothing();

    // Update campaign spent
    await this.db
      .update(campaigns)
      .set({
        spent: campaignRecord.id ? data.commission : 0, // This would need SQL increment
        updatedAt: new Date(),
      })
      .where(eq(campaigns.pubkey, data.campaign));

    // Update affiliate stats
    await this.db
      .update(affiliates)
      .set({
        totalAttributions: affiliateRecord.id ? 1 : 0, // This would need SQL increment
        updatedAt: new Date(),
      })
      .where(eq(affiliates.pubkey, data.affiliate));

    this.logger.info({ attribution: data.attribution }, "Attribution recorded");
  }

  /**
   * Handle attribution released
   */
  private async handleAttributionReleased(event: NjordEvent): Promise<void> {
    const data = event.data as { attribution: string };

    await this.db
      .update(attributions)
      .set({ status: "released", updatedAt: new Date() })
      .where(eq(attributions.pubkey, data.attribution));

    this.logger.info({ attribution: data.attribution }, "Attribution released");
  }

  /**
   * Handle attribution slashed
   */
  private async handleAttributionSlashed(event: NjordEvent): Promise<void> {
    const data = event.data as { attribution: string };

    await this.db
      .update(attributions)
      .set({ status: "slashed", updatedAt: new Date() })
      .where(eq(attributions.pubkey, data.attribution));

    this.logger.info({ attribution: data.attribution }, "Attribution slashed");
  }

  /**
   * Handle bridge registration
   */
  private async handleBridgeRegistered(event: NjordEvent): Promise<void> {
    const data = event.data as {
      bridge: string;
      operator: string;
      name: string;
      stakeAmount: number;
      tier: string;
    };

    const newBridge: NewBridge = {
      pubkey: data.bridge,
      operator: data.operator,
      name: data.name,
      tier: data.tier,
      stakeAmount: data.stakeAmount,
    };

    await this.db.insert(bridges).values(newBridge).onConflictDoNothing();
    this.logger.info({ bridge: data.bridge }, "Bridge registered");
  }

  /**
   * Handle bridge stake changes
   */
  private async handleBridgeStake(event: NjordEvent): Promise<void> {
    const data = event.data as {
      bridge: string;
      amount: number;
      newTier: string;
    };

    await this.db
      .update(bridges)
      .set({
        stakeAmount: data.amount,
        tier: data.newTier,
        updatedAt: new Date(),
      })
      .where(eq(bridges.pubkey, data.bridge));
  }

  /**
   * Handle bridge slashing
   */
  private async handleBridgeSlashed(event: NjordEvent): Promise<void> {
    const data = event.data as {
      bridge: string;
      amount: number;
    };

    // Update fraud count
    const [bridgeRecord] = await this.db
      .select()
      .from(bridges)
      .where(eq(bridges.pubkey, data.bridge))
      .limit(1);

    if (bridgeRecord) {
      await this.db
        .update(bridges)
        .set({
          fraudCount: bridgeRecord.fraudCount + 1,
          stakeAmount: Math.max(0, bridgeRecord.stakeAmount - data.amount),
          updatedAt: new Date(),
        })
        .where(eq(bridges.pubkey, data.bridge));
    }

    this.logger.info({ bridge: data.bridge, amount: data.amount }, "Bridge slashed");
  }

  /**
   * Handle challenge creation
   */
  private async handleChallengeCreated(event: NjordEvent): Promise<void> {
    const data = event.data as {
      challenge: string;
      attribution: string;
      challenger: string;
      challengerType: string;
      bondAmount: number;
      evidenceHash: string;
    };

    // Get attribution ID
    const [attributionRecord] = await this.db
      .select({ id: attributions.id })
      .from(attributions)
      .where(eq(attributions.pubkey, data.attribution))
      .limit(1);

    if (!attributionRecord) {
      this.logger.warn({ attribution: data.attribution }, "Attribution not found for challenge");
      return;
    }

    // Update attribution status
    await this.db
      .update(attributions)
      .set({ status: "challenged", updatedAt: new Date() })
      .where(eq(attributions.pubkey, data.attribution));

    const newChallenge: NewChallenge = {
      pubkey: data.challenge,
      attributionId: attributionRecord.id,
      challenger: data.challenger,
      challengerType: data.challengerType,
      bondAmount: data.bondAmount,
      evidenceHash: data.evidenceHash,
      status: "pending",
    };

    await this.db.insert(challenges).values(newChallenge).onConflictDoNothing();
    this.logger.info({ challenge: data.challenge }, "Challenge created");
  }

  /**
   * Handle challenge resolution
   */
  private async handleChallengeResolved(event: NjordEvent): Promise<void> {
    const data = event.data as {
      challenge: string;
      outcome: string;
      resolvedBy: string;
    };

    await this.db
      .update(challenges)
      .set({
        status: `resolved_${data.outcome === "upheld" ? "valid" : "invalid"}`,
        outcome: data.outcome,
        resolvedBy: data.resolvedBy,
        resolvedAt: event.timestamp,
        updatedAt: new Date(),
      })
      .where(eq(challenges.pubkey, data.challenge));

    this.logger.info({ challenge: data.challenge, outcome: data.outcome }, "Challenge resolved");
  }
}
