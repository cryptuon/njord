use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod njord {
    use super::*;

    // ============== Protocol Initialization ==============

    pub fn initialize(
        ctx: Context<Initialize>,
        protocol_fee_bps: u16,
        min_challenge_bond: u64,
    ) -> Result<()> {
        instructions::initialize::initialize(ctx, protocol_fee_bps, min_challenge_bond)
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_protocol_fee_bps: Option<u16>,
        new_min_challenge_bond: Option<u64>,
        new_treasury: Option<Pubkey>,
    ) -> Result<()> {
        instructions::initialize::update_config(
            ctx,
            new_protocol_fee_bps,
            new_min_challenge_bond,
            new_treasury,
        )
    }

    // ============== Campaign Management ==============

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        params: CreateCampaignParams,
    ) -> Result<()> {
        instructions::campaign::create_campaign(ctx, params)
    }

    pub fn fund_campaign(ctx: Context<FundCampaign>, amount: u64) -> Result<()> {
        instructions::campaign::fund_campaign(ctx, amount)
    }

    pub fn pause_campaign(ctx: Context<UpdateCampaignStatus>) -> Result<()> {
        instructions::campaign::pause_campaign(ctx)
    }

    pub fn resume_campaign(ctx: Context<UpdateCampaignStatus>) -> Result<()> {
        instructions::campaign::resume_campaign(ctx)
    }

    pub fn end_campaign(ctx: Context<UpdateCampaignStatus>) -> Result<()> {
        instructions::campaign::end_campaign(ctx)
    }

    pub fn withdraw_campaign_funds(ctx: Context<WithdrawCampaignFunds>) -> Result<()> {
        instructions::campaign::withdraw_campaign_funds(ctx)
    }

    // ============== Affiliate Management ==============

    pub fn create_affiliate_profile(ctx: Context<CreateAffiliateProfile>) -> Result<()> {
        instructions::affiliate::create_affiliate_profile(ctx)
    }

    pub fn stake_njord(ctx: Context<StakeNjord>, amount: u64) -> Result<()> {
        instructions::affiliate::stake_njord(ctx, amount)
    }

    pub fn join_campaign(ctx: Context<JoinCampaign>) -> Result<()> {
        instructions::affiliate::join_campaign(ctx)
    }

    pub fn approve_affiliate(ctx: Context<ApproveAffiliate>) -> Result<()> {
        instructions::affiliate::approve_affiliate(ctx)
    }

    pub fn initiate_unstake(ctx: Context<UnstakeNjord>, amount: u64) -> Result<()> {
        instructions::affiliate::initiate_unstake(ctx, amount)
    }

    // ============== Attribution ==============

    pub fn record_attribution(
        ctx: Context<RecordAttribution>,
        params: RecordAttributionParams,
    ) -> Result<()> {
        instructions::attribution::record_attribution(ctx, params)
    }

    pub fn settle_attribution(ctx: Context<SettleAttribution>) -> Result<()> {
        instructions::attribution::settle_attribution(ctx)
    }

    // ============== Bridge Management ==============

    pub fn register_bridge(
        ctx: Context<RegisterBridge>,
        region: [u8; 4],
        metadata_uri: String,
    ) -> Result<()> {
        instructions::bridge::register_bridge(ctx, region, metadata_uri)
    }

    pub fn stake_bridge(ctx: Context<StakeBridge>, amount: u64) -> Result<()> {
        instructions::bridge::stake_bridge(ctx, amount)
    }

    pub fn initiate_unstake_bridge(ctx: Context<InitiateUnstakeBridge>, amount: u64) -> Result<()> {
        instructions::bridge::initiate_unstake_bridge(ctx, amount)
    }

    pub fn slash_bridge(ctx: Context<SlashBridge>, amount: u64, reason: String) -> Result<()> {
        instructions::bridge::slash_bridge(ctx, amount, reason)
    }

    pub fn update_bridge_metadata(
        ctx: Context<UpdateBridgeMetadata>,
        metadata_uri: Option<String>,
        region: Option<[u8; 4]>,
    ) -> Result<()> {
        instructions::bridge::update_bridge_metadata(ctx, metadata_uri, region)
    }

    // ============== Challenge System ==============

    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        challenger_type: ChallengerType,
        evidence_uri: String,
    ) -> Result<()> {
        instructions::challenge::create_challenge(ctx, challenger_type, evidence_uri)
    }

    pub fn submit_counter_evidence(
        ctx: Context<SubmitCounterEvidence>,
        counter_evidence_uri: String,
    ) -> Result<()> {
        instructions::challenge::submit_counter_evidence(ctx, counter_evidence_uri)
    }

    pub fn resolve_challenge(
        ctx: Context<ResolveChallenge>,
        outcome: ChallengeOutcome,
    ) -> Result<()> {
        instructions::challenge::resolve_challenge(ctx, outcome)
    }

    // ============== Governance ==============

    pub fn initialize_governance(
        ctx: Context<InitializeGovernance>,
        proposal_threshold: u64,
        quorum_bps: u16,
        voting_period: i64,
        timelock_delay: i64,
    ) -> Result<()> {
        instructions::governance::initialize_governance(
            ctx,
            proposal_threshold,
            quorum_bps,
            voting_period,
            timelock_delay,
        )
    }

    pub fn create_voting_escrow(
        ctx: Context<CreateVotingEscrow>,
        amount: u64,
        lock_duration: i64,
    ) -> Result<()> {
        instructions::governance::create_voting_escrow(ctx, amount, lock_duration)
    }

    pub fn extend_lock(ctx: Context<ExtendLock>, new_lock_end: i64) -> Result<()> {
        instructions::governance::extend_lock(ctx, new_lock_end)
    }

    pub fn increase_lock_amount(ctx: Context<IncreaseLockAmount>, amount: u64) -> Result<()> {
        instructions::governance::increase_lock_amount(ctx, amount)
    }

    pub fn withdraw_unlocked(ctx: Context<WithdrawUnlocked>) -> Result<()> {
        instructions::governance::withdraw_unlocked(ctx)
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description_hash: String,
        proposal_type: ProposalType,
        proposal_data: Vec<u8>,
    ) -> Result<()> {
        instructions::governance::create_proposal(
            ctx,
            title,
            description_hash,
            proposal_type,
            proposal_data,
        )
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        proposal_id: u64,
        vote_choice: VoteChoice,
    ) -> Result<()> {
        instructions::governance::cast_vote(ctx, proposal_id, vote_choice)
    }

    pub fn finalize_proposal(ctx: Context<FinalizeProposal>, proposal_id: u64) -> Result<()> {
        instructions::governance::finalize_proposal(ctx, proposal_id)
    }

    pub fn queue_proposal(ctx: Context<QueueProposal>, proposal_id: u64) -> Result<()> {
        instructions::governance::queue_proposal(ctx, proposal_id)
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>, proposal_id: u64) -> Result<()> {
        instructions::governance::execute_proposal(ctx, proposal_id)
    }

    pub fn cancel_proposal(ctx: Context<CancelProposal>, proposal_id: u64) -> Result<()> {
        instructions::governance::cancel_proposal(ctx, proposal_id)
    }
}
