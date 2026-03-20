use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer, transfer};

use crate::state::governance::*;
use crate::errors::NjordError;

/// Initialize governance configuration
#[derive(Accounts)]
pub struct InitializeGovernance<'info> {
    #[account(
        init,
        payer = authority,
        space = GovernanceConfig::LEN,
        seeds = [b"governance"],
        bump
    )]
    pub governance_config: Account<'info, GovernanceConfig>,

    #[account(
        init,
        payer = authority,
        space = ProtocolParameters::LEN,
        seeds = [b"protocol_params"],
        bump
    )]
    pub protocol_params: Account<'info, ProtocolParameters>,

    /// CHECK: NJORD token mint - validated at protocol level, not enforced here
    pub njord_mint: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_governance(
    ctx: Context<InitializeGovernance>,
    proposal_threshold: u64,
    quorum_bps: u16,
    voting_period: i64,
    timelock_delay: i64,
) -> Result<()> {
    let config = &mut ctx.accounts.governance_config;
    config.authority = ctx.accounts.authority.key();
    config.njord_mint = ctx.accounts.njord_mint.key();
    config.proposal_threshold = proposal_threshold;
    config.quorum_bps = quorum_bps;
    config.voting_period = voting_period;
    config.timelock_delay = timelock_delay;
    config.proposal_count = 0;
    config.bump = ctx.bumps.governance_config;

    let params = &mut ctx.accounts.protocol_params;
    let defaults = ProtocolParameters::default_values();
    params.authority = ctx.accounts.governance_config.key();
    params.bronze_min_stake = defaults.bronze_min_stake;
    params.silver_min_stake = defaults.silver_min_stake;
    params.gold_min_stake = defaults.gold_min_stake;
    params.platinum_min_stake = defaults.platinum_min_stake;
    params.protocol_fee_bps = defaults.protocol_fee_bps;
    params.min_challenge_bond = defaults.min_challenge_bond;
    params.max_fraud_score = defaults.max_fraud_score;
    params.default_hold_period = defaults.default_hold_period;
    params.max_lock_time = defaults.max_lock_time;
    params.updated_at = Clock::get()?.unix_timestamp;
    params.bump = ctx.bumps.protocol_params;

    Ok(())
}

/// Create voting escrow (lock tokens for voting power)
#[derive(Accounts)]
pub struct CreateVotingEscrow<'info> {
    #[account(
        init,
        payer = owner,
        space = VotingEscrow::LEN,
        seeds = [b"voting_escrow", owner.key().as_ref()],
        bump
    )]
    pub voting_escrow: Account<'info, VotingEscrow>,

    pub governance_config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key(),
        constraint = owner_token_account.mint == governance_config.njord_mint
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"escrow_vault"],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn create_voting_escrow(
    ctx: Context<CreateVotingEscrow>,
    amount: u64,
    lock_duration: i64,
) -> Result<()> {
    let clock = Clock::get()?;
    let protocol_params = &ctx.accounts.governance_config;

    // Validate lock duration (min 1 week, max 4 years)
    require!(lock_duration >= 7 * 24 * 60 * 60, NjordError::LockDurationTooShort);
    require!(lock_duration <= 4 * 365 * 24 * 60 * 60, NjordError::LockDurationTooLong);

    // Transfer tokens to escrow vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.owner_token_account.to_account_info(),
        to: ctx.accounts.escrow_vault.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    // Initialize voting escrow
    let escrow = &mut ctx.accounts.voting_escrow;
    escrow.owner = ctx.accounts.owner.key();
    escrow.locked_amount = amount;
    escrow.lock_end = clock.unix_timestamp + lock_duration;
    escrow.last_update = clock.unix_timestamp;
    escrow.bump = ctx.bumps.voting_escrow;

    Ok(())
}

/// Extend lock duration
#[derive(Accounts)]
pub struct ExtendLock<'info> {
    #[account(
        mut,
        seeds = [b"voting_escrow", owner.key().as_ref()],
        bump = voting_escrow.bump,
        constraint = voting_escrow.owner == owner.key()
    )]
    pub voting_escrow: Account<'info, VotingEscrow>,

    pub owner: Signer<'info>,
}

pub fn extend_lock(ctx: Context<ExtendLock>, new_lock_end: i64) -> Result<()> {
    let clock = Clock::get()?;
    let escrow = &mut ctx.accounts.voting_escrow;

    // New lock end must be greater than current
    require!(new_lock_end > escrow.lock_end, NjordError::InvalidLockExtension);

    // Max 4 years from now
    let max_lock_end = clock.unix_timestamp + 4 * 365 * 24 * 60 * 60;
    require!(new_lock_end <= max_lock_end, NjordError::LockDurationTooLong);

    escrow.lock_end = new_lock_end;
    escrow.last_update = clock.unix_timestamp;

    Ok(())
}

/// Increase locked amount
#[derive(Accounts)]
pub struct IncreaseLockAmount<'info> {
    #[account(
        mut,
        seeds = [b"voting_escrow", owner.key().as_ref()],
        bump = voting_escrow.bump,
        constraint = voting_escrow.owner == owner.key()
    )]
    pub voting_escrow: Account<'info, VotingEscrow>,

    pub governance_config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key(),
        constraint = owner_token_account.mint == governance_config.njord_mint
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"escrow_vault"],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn increase_lock_amount(ctx: Context<IncreaseLockAmount>, amount: u64) -> Result<()> {
    let clock = Clock::get()?;
    let escrow = &mut ctx.accounts.voting_escrow;

    // Lock must still be active
    require!(escrow.lock_end > clock.unix_timestamp, NjordError::LockExpired);

    // Transfer additional tokens
    let cpi_accounts = Transfer {
        from: ctx.accounts.owner_token_account.to_account_info(),
        to: ctx.accounts.escrow_vault.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    escrow.locked_amount += amount;
    escrow.last_update = clock.unix_timestamp;

    Ok(())
}

/// Withdraw unlocked tokens
#[derive(Accounts)]
pub struct WithdrawUnlocked<'info> {
    #[account(
        mut,
        seeds = [b"voting_escrow", owner.key().as_ref()],
        bump = voting_escrow.bump,
        constraint = voting_escrow.owner == owner.key(),
        close = owner
    )]
    pub voting_escrow: Account<'info, VotingEscrow>,

    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key()
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"escrow_vault"],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    /// CHECK: PDA signer for vault
    #[account(seeds = [b"escrow_vault_auth"], bump)]
    pub escrow_vault_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn withdraw_unlocked(ctx: Context<WithdrawUnlocked>) -> Result<()> {
    let clock = Clock::get()?;
    let escrow = &ctx.accounts.voting_escrow;

    // Lock must be expired
    require!(clock.unix_timestamp >= escrow.lock_end, NjordError::LockNotExpired);

    // Transfer tokens back to owner
    let seeds = &[b"escrow_vault_auth".as_ref(), &[ctx.bumps.escrow_vault_authority]];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.escrow_vault.to_account_info(),
        to: ctx.accounts.owner_token_account.to_account_info(),
        authority: ctx.accounts.escrow_vault_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    transfer(cpi_ctx, escrow.locked_amount)?;

    Ok(())
}

/// Create proposal
#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = proposer,
        space = Proposal::LEN,
        seeds = [b"proposal", governance_config.proposal_count.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        seeds = [b"governance"],
        bump = governance_config.bump
    )]
    pub governance_config: Account<'info, GovernanceConfig>,

    #[account(
        seeds = [b"voting_escrow", proposer.key().as_ref()],
        bump = voting_escrow.bump,
        constraint = voting_escrow.owner == proposer.key()
    )]
    pub voting_escrow: Account<'info, VotingEscrow>,

    #[account(seeds = [b"protocol_params"], bump)]
    pub protocol_params: Account<'info, ProtocolParameters>,

    #[account(mut)]
    pub proposer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    title: String,
    description_hash: String,
    proposal_type: ProposalType,
    proposal_data: Vec<u8>,
) -> Result<()> {
    let clock = Clock::get()?;
    let config = &mut ctx.accounts.governance_config;
    let params = &ctx.accounts.protocol_params;
    let escrow = &ctx.accounts.voting_escrow;

    // Check voting power meets threshold
    let voting_power = escrow.calculate_voting_power(clock.unix_timestamp, params.max_lock_time);
    require!(
        voting_power >= config.proposal_threshold,
        NjordError::InsufficientVotingPower
    );

    // Validate inputs
    require!(title.len() <= 64, NjordError::TitleTooLong);
    require!(description_hash.len() <= 64, NjordError::DescriptionTooLong);
    require!(proposal_data.len() <= 128, NjordError::ProposalDataTooLarge);

    // Initialize proposal
    let proposal = &mut ctx.accounts.proposal;
    proposal.id = config.proposal_count;
    proposal.proposer = ctx.accounts.proposer.key();
    proposal.title = title;
    proposal.description_hash = description_hash;
    proposal.proposal_type = proposal_type;
    proposal.proposal_data = proposal_data;
    proposal.status = ProposalStatus::Active; // Voting starts immediately
    proposal.for_votes = 0;
    proposal.against_votes = 0;
    proposal.abstain_votes = 0;
    proposal.start_time = clock.unix_timestamp;
    proposal.end_time = clock.unix_timestamp + config.voting_period;
    proposal.execution_time = None;
    proposal.executed = false;
    proposal.canceled = false;
    proposal.created_at = clock.unix_timestamp;
    proposal.bump = ctx.bumps.proposal;

    // Increment proposal counter
    config.proposal_count += 1;

    Ok(())
}

/// Cast vote on proposal
#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CastVote<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump,
        constraint = proposal.id == proposal_id
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = voter,
        space = VoteRecord::LEN,
        seeds = [b"vote", proposal_id.to_le_bytes().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(
        seeds = [b"voting_escrow", voter.key().as_ref()],
        bump = voting_escrow.bump,
        constraint = voting_escrow.owner == voter.key()
    )]
    pub voting_escrow: Account<'info, VotingEscrow>,

    #[account(seeds = [b"protocol_params"], bump)]
    pub protocol_params: Account<'info, ProtocolParameters>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn cast_vote(
    ctx: Context<CastVote>,
    proposal_id: u64,
    vote_choice: VoteChoice,
) -> Result<()> {
    let clock = Clock::get()?;
    let proposal = &mut ctx.accounts.proposal;
    let escrow = &ctx.accounts.voting_escrow;
    let params = &ctx.accounts.protocol_params;

    // Verify voting is active
    require!(proposal.status == ProposalStatus::Active, NjordError::VotingNotActive);
    require!(clock.unix_timestamp < proposal.end_time, NjordError::VotingEnded);

    // Calculate voting power
    let voting_power = escrow.calculate_voting_power(clock.unix_timestamp, params.max_lock_time);
    require!(voting_power > 0, NjordError::NoVotingPower);

    // Record vote
    let vote_record = &mut ctx.accounts.vote_record;
    vote_record.voter = ctx.accounts.voter.key();
    vote_record.proposal_id = proposal_id;
    vote_record.vote = vote_choice;
    vote_record.voting_power = voting_power;
    vote_record.voted_at = clock.unix_timestamp;
    vote_record.bump = ctx.bumps.vote_record;

    // Update proposal vote counts
    match vote_choice {
        VoteChoice::For => proposal.for_votes += voting_power,
        VoteChoice::Against => proposal.against_votes += voting_power,
        VoteChoice::Abstain => proposal.abstain_votes += voting_power,
    }

    Ok(())
}

/// Finalize proposal after voting ends
#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct FinalizeProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump,
        constraint = proposal.id == proposal_id
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(seeds = [b"governance"], bump = governance_config.bump)]
    pub governance_config: Account<'info, GovernanceConfig>,

    /// Anyone can finalize after voting ends
    pub finalizer: Signer<'info>,
}

pub fn finalize_proposal(ctx: Context<FinalizeProposal>, _proposal_id: u64) -> Result<()> {
    let clock = Clock::get()?;
    let proposal = &mut ctx.accounts.proposal;
    let config = &ctx.accounts.governance_config;

    // Verify voting has ended
    require!(proposal.status == ProposalStatus::Active, NjordError::ProposalNotActive);
    require!(clock.unix_timestamp >= proposal.end_time, NjordError::VotingNotEnded);

    // Calculate total votes
    let total_votes = proposal.for_votes + proposal.against_votes + proposal.abstain_votes;

    // Check quorum (total votes as percentage of required quorum)
    // Note: In production, you'd compare against total token supply or circulating supply
    let quorum_met = total_votes > 0; // Simplified; real impl would check against token supply

    if !quorum_met {
        proposal.status = ProposalStatus::Defeated;
        return Ok(());
    }

    // Check if majority voted for
    if proposal.for_votes > proposal.against_votes {
        proposal.status = ProposalStatus::Succeeded;
        proposal.execution_time = Some(clock.unix_timestamp + config.timelock_delay);
    } else {
        proposal.status = ProposalStatus::Defeated;
    }

    Ok(())
}

/// Queue proposal for execution (after succeeded)
#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct QueueProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump,
        constraint = proposal.id == proposal_id
    )]
    pub proposal: Account<'info, Proposal>,

    pub queuer: Signer<'info>,
}

pub fn queue_proposal(ctx: Context<QueueProposal>, _proposal_id: u64) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;

    require!(proposal.status == ProposalStatus::Succeeded, NjordError::ProposalNotSucceeded);

    proposal.status = ProposalStatus::Queued;

    Ok(())
}

/// Execute proposal (after timelock)
#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct ExecuteProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump,
        constraint = proposal.id == proposal_id
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        seeds = [b"protocol_params"],
        bump = protocol_params.bump
    )]
    pub protocol_params: Account<'info, ProtocolParameters>,

    #[account(seeds = [b"governance"], bump = governance_config.bump)]
    pub governance_config: Account<'info, GovernanceConfig>,

    pub executor: Signer<'info>,
}

pub fn execute_proposal(ctx: Context<ExecuteProposal>, _proposal_id: u64) -> Result<()> {
    let clock = Clock::get()?;
    let proposal = &mut ctx.accounts.proposal;
    let params = &mut ctx.accounts.protocol_params;

    // Verify proposal is queued and timelock has passed
    require!(proposal.status == ProposalStatus::Queued, NjordError::ProposalNotQueued);
    require!(
        proposal.execution_time.is_some() &&
        clock.unix_timestamp >= proposal.execution_time.unwrap(),
        NjordError::TimelockNotExpired
    );

    // Execute based on proposal type
    match proposal.proposal_type {
        ProposalType::ParameterChange => {
            // Decode and apply parameter changes
            execute_parameter_change(params, &proposal.proposal_data)?;
        }
        ProposalType::FeeUpdate => {
            execute_fee_update(params, &proposal.proposal_data)?;
        }
        ProposalType::TreasurySpend => {
            // Treasury spend would require additional accounts
            // Simplified here; real impl would handle token transfers
        }
        ProposalType::Emergency => {
            // Emergency actions could bypass certain checks
        }
        ProposalType::General => {
            // General proposals might not have on-chain execution
        }
    }

    proposal.status = ProposalStatus::Executed;
    proposal.executed = true;
    params.updated_at = clock.unix_timestamp;

    Ok(())
}

/// Cancel proposal (by proposer or authority)
#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CancelProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump,
        constraint = proposal.id == proposal_id
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(seeds = [b"governance"], bump = governance_config.bump)]
    pub governance_config: Account<'info, GovernanceConfig>,

    pub canceler: Signer<'info>,
}

pub fn cancel_proposal(ctx: Context<CancelProposal>, _proposal_id: u64) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let config = &ctx.accounts.governance_config;
    let canceler = ctx.accounts.canceler.key();

    // Only proposer or authority can cancel
    require!(
        canceler == proposal.proposer || canceler == config.authority,
        NjordError::Unauthorized
    );

    // Can only cancel before execution
    require!(!proposal.executed, NjordError::ProposalAlreadyExecuted);

    proposal.status = ProposalStatus::Canceled;
    proposal.canceled = true;

    Ok(())
}

// Helper functions for proposal execution

fn execute_parameter_change(params: &mut ProtocolParameters, data: &[u8]) -> Result<()> {
    // Data format: [param_id: u8, value: u64]
    if data.len() < 9 {
        return Err(NjordError::InvalidProposalData.into());
    }

    let param_id = data[0];
    let value = u64::from_le_bytes(data[1..9].try_into().unwrap());

    match param_id {
        0 => params.bronze_min_stake = value,
        1 => params.silver_min_stake = value,
        2 => params.gold_min_stake = value,
        3 => params.platinum_min_stake = value,
        4 => params.min_challenge_bond = value,
        5 => params.max_fraud_score = value as u8,
        6 => params.default_hold_period = value as i64,
        7 => params.max_lock_time = value as i64,
        _ => return Err(NjordError::InvalidParameterId.into()),
    }

    Ok(())
}

fn execute_fee_update(params: &mut ProtocolParameters, data: &[u8]) -> Result<()> {
    // Data format: [fee_bps: u16]
    if data.len() < 2 {
        return Err(NjordError::InvalidProposalData.into());
    }

    let fee_bps = u16::from_le_bytes(data[0..2].try_into().unwrap());

    // Validate fee (max 10%)
    if fee_bps > 1000 {
        return Err(NjordError::FeeTooHigh.into());
    }

    params.protocol_fee_bps = fee_bps;

    Ok(())
}
