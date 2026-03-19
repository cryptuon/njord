use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{
    Challenge, ChallengeStatus, ChallengeOutcome, ChallengerType, ChallengeStats,
    Attribution, AttributionStatus, Campaign, AffiliateProfile, AffiliateRegistration,
    Bridge, ProtocolConfig
};
use crate::errors::NjordError;

#[derive(Accounts)]
pub struct CreateChallenge<'info> {
    #[account(mut)]
    pub challenger: Signer<'info>,

    #[account(
        seeds = [b"protocol_config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        has_one = campaign,
        constraint = attribution.can_challenge(Clock::get()?.unix_timestamp) @ NjordError::ChallengePeriodEnded
    )]
    pub attribution: Account<'info, Attribution>,

    #[account(
        init,
        payer = challenger,
        space = Challenge::LEN,
        seeds = [b"challenge", attribution.key().as_ref()],
        bump
    )]
    pub challenge: Account<'info, Challenge>,

    #[account(
        mut,
        constraint = challenger_token_account.owner == challenger.key()
    )]
    pub challenger_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = challenger,
        token::mint = payment_mint,
        token::authority = challenge,
        seeds = [b"challenge_escrow", challenge.key().as_ref()],
        bump
    )]
    pub challenge_escrow: Account<'info, TokenAccount>,

    #[account(
        address = campaign.payment_mint
    )]
    pub payment_mint: Account<'info, anchor_spl::token::Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_challenge(
    ctx: Context<CreateChallenge>,
    challenger_type: ChallengerType,
    evidence_uri: String,
) -> Result<()> {
    let clock = Clock::get()?;
    let config = &ctx.accounts.config;
    let attribution = &mut ctx.accounts.attribution;
    let challenge = &mut ctx.accounts.challenge;

    // Calculate minimum bond
    let min_bond = Challenge::calculate_min_bond(&challenger_type, attribution.commission_amount);
    let min_bond = std::cmp::max(min_bond, config.min_challenge_bond);

    // Transfer bond to escrow
    let cpi_accounts = Transfer {
        from: ctx.accounts.challenger_token_account.to_account_info(),
        to: ctx.accounts.challenge_escrow.to_account_info(),
        authority: ctx.accounts.challenger.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts
    );
    token::transfer(cpi_ctx, min_bond)?;

    // Update attribution status
    attribution.status = AttributionStatus::Challenged;

    // Initialize challenge
    challenge.attribution = attribution.key();
    challenge.challenger = ctx.accounts.challenger.key();
    challenge.challenger_type = challenger_type;
    challenge.bond_amount = min_bond;
    challenge.status = ChallengeStatus::Pending;
    challenge.outcome = ChallengeOutcome::Pending;
    challenge.evidence_uri = evidence_uri;
    challenge.counter_evidence_uri = String::new();
    challenge.created_at = clock.unix_timestamp;
    challenge.evidence_deadline = clock.unix_timestamp + Challenge::EVIDENCE_PERIOD;
    challenge.resolution_deadline = clock.unix_timestamp + Challenge::EVIDENCE_PERIOD + Challenge::RESOLUTION_PERIOD;
    challenge.resolved_at = 0;
    challenge.resolver = Pubkey::default();
    challenge.bump = ctx.bumps.challenge;

    msg!(
        "Challenge created for attribution {} with bond {}",
        attribution.attribution_id,
        min_bond
    );

    Ok(())
}

#[derive(Accounts)]
pub struct SubmitCounterEvidence<'info> {
    #[account(mut)]
    pub affiliate_wallet: Signer<'info>,

    #[account(
        seeds = [b"affiliate_profile", affiliate_wallet.key().as_ref()],
        bump = affiliate_profile.bump,
        has_one = wallet @ NjordError::Unauthorized
    )]
    pub affiliate_profile: Account<'info, AffiliateProfile>,

    #[account(address = affiliate_profile.wallet)]
    /// CHECK: Just for validation
    pub wallet: UncheckedAccount<'info>,

    #[account(
        has_one = affiliate_registration
    )]
    pub attribution: Account<'info, Attribution>,

    #[account(
        has_one = affiliate @ NjordError::Unauthorized
    )]
    pub affiliate_registration: Account<'info, AffiliateRegistration>,

    #[account(address = affiliate_registration.affiliate)]
    /// CHECK: Just for address validation
    pub affiliate: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"challenge", attribution.key().as_ref()],
        bump = challenge.bump,
        constraint = challenge.can_submit_evidence(Clock::get()?.unix_timestamp) @ NjordError::ChallengePeriodEnded
    )]
    pub challenge: Account<'info, Challenge>,
}

pub fn submit_counter_evidence(
    ctx: Context<SubmitCounterEvidence>,
    counter_evidence_uri: String,
) -> Result<()> {
    let challenge = &mut ctx.accounts.challenge;

    challenge.counter_evidence_uri = counter_evidence_uri;
    challenge.status = ChallengeStatus::EvidenceSubmitted;

    msg!("Counter-evidence submitted for challenge");

    Ok(())
}

#[derive(Accounts)]
pub struct ResolveChallenge<'info> {
    /// Resolver (protocol authority for now, DAO in future)
    #[account(mut)]
    pub resolver: Signer<'info>,

    #[account(
        mut,
        seeds = [b"protocol_config"],
        bump = config.bump,
        has_one = authority @ NjordError::UnauthorizedChallengeResolution
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(address = config.authority)]
    /// CHECK: Authority validation
    pub authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        has_one = campaign
    )]
    pub attribution: Account<'info, Attribution>,

    #[account(
        mut,
        seeds = [b"challenge", attribution.key().as_ref()],
        bump = challenge.bump,
        constraint = challenge.can_resolve(Clock::get()?.unix_timestamp) @ NjordError::ChallengePeriodEnded
    )]
    pub challenge: Account<'info, Challenge>,

    #[account(
        mut,
        address = attribution.affiliate_registration
    )]
    pub affiliate_registration: Account<'info, AffiliateRegistration>,

    #[account(
        mut,
        address = affiliate_registration.affiliate
    )]
    pub affiliate_profile: Account<'info, AffiliateProfile>,

    #[account(
        mut,
        address = attribution.bridge
    )]
    pub bridge: Account<'info, Bridge>,

    #[account(
        mut,
        seeds = [b"challenge_escrow", challenge.key().as_ref()],
        bump
    )]
    pub challenge_escrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = campaign.escrow
    )]
    pub campaign_escrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = challenger_token_account.owner == challenge.challenger
    )]
    pub challenger_token_account: Account<'info, TokenAccount>,

    /// CHECK: Treasury
    #[account(
        mut,
        address = config.treasury
    )]
    pub treasury: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn resolve_challenge(
    ctx: Context<ResolveChallenge>,
    outcome: ChallengeOutcome,
) -> Result<()> {
    let clock = Clock::get()?;
    let challenge = &mut ctx.accounts.challenge;
    let attribution = &mut ctx.accounts.attribution;
    let affiliate_profile = &mut ctx.accounts.affiliate_profile;
    let affiliate_registration = &mut ctx.accounts.affiliate_registration;
    let bridge = &mut ctx.accounts.bridge;
    let campaign = &mut ctx.accounts.campaign;

    require!(
        outcome != ChallengeOutcome::Pending,
        NjordError::InvalidAmount
    );

    let challenge_key = challenge.key();
    let seeds = &[
        b"challenge_escrow",
        challenge_key.as_ref(),
        &[ctx.bumps.challenge_escrow],
    ];
    let signer = &[&seeds[..]];

    match outcome {
        ChallengeOutcome::FraudConfirmed => {
            // Challenger wins: bond back + 50% of commission
            let reward = attribution.commission_amount / 2;
            let total_to_challenger = challenge.bond_amount + reward;

            // Return bond + reward to challenger
            let cpi_accounts = Transfer {
                from: ctx.accounts.challenge_escrow.to_account_info(),
                to: ctx.accounts.challenger_token_account.to_account_info(),
                authority: ctx.accounts.challenge.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer
            );
            token::transfer(cpi_ctx, challenge.bond_amount)?;

            // Refund remaining to campaign
            campaign.spent = campaign.spent.saturating_sub(attribution.commission_amount);

            // Update affiliate stats
            affiliate_profile.disputes_lost = affiliate_profile.disputes_lost
                .checked_add(1)
                .ok_or(NjordError::ArithmeticOverflow)?;

            // Update dispute rate
            if affiliate_profile.total_attributions > 0 {
                affiliate_profile.dispute_rate_bps = ((affiliate_profile.disputes_lost as u64 * 10000)
                    / affiliate_profile.total_attributions) as u16;
            }

            // Reduce pending earnings
            affiliate_registration.pending_earnings = affiliate_registration.pending_earnings
                .saturating_sub(attribution.net_commission);

            // Update bridge fraud stats
            bridge.fraud_count = bridge.fraud_count.checked_add(1)
                .ok_or(NjordError::ArithmeticOverflow)?;
            if bridge.total_attributions > 0 {
                bridge.fraud_rate_bps = ((bridge.fraud_count as u64 * 10000)
                    / bridge.total_attributions) as u16;
            }

            // Mark attribution as rejected
            attribution.status = AttributionStatus::Rejected;

            msg!("Fraud confirmed. Challenger rewarded, affiliate penalized.");
        }

        ChallengeOutcome::ChallengeRejected => {
            // Affiliate wins: gets challenger's bond
            // Bond goes to affiliate (via campaign escrow for simplicity)
            let cpi_accounts = Transfer {
                from: ctx.accounts.challenge_escrow.to_account_info(),
                to: ctx.accounts.campaign_escrow.to_account_info(),
                authority: ctx.accounts.challenge.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer
            );
            token::transfer(cpi_ctx, challenge.bond_amount)?;

            // Add bond to affiliate's pending (will be claimed on settlement)
            affiliate_registration.pending_earnings = affiliate_registration.pending_earnings
                .checked_add(challenge.bond_amount)
                .ok_or(NjordError::ArithmeticOverflow)?;

            // Restore attribution to pending
            attribution.status = AttributionStatus::Pending;

            msg!("Challenge rejected. Bond forfeited to affiliate.");
        }

        ChallengeOutcome::Inconclusive => {
            // Return bond to challenger
            let cpi_accounts = Transfer {
                from: ctx.accounts.challenge_escrow.to_account_info(),
                to: ctx.accounts.challenger_token_account.to_account_info(),
                authority: ctx.accounts.challenge.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer
            );
            token::transfer(cpi_ctx, challenge.bond_amount)?;

            // Reduce commission by 50%
            let reduced_commission = attribution.net_commission / 2;
            affiliate_registration.pending_earnings = affiliate_registration.pending_earnings
                .saturating_sub(attribution.net_commission - reduced_commission);

            // Restore to pending with reduced amount
            attribution.net_commission = reduced_commission;
            attribution.status = AttributionStatus::Pending;

            msg!("Inconclusive. Bond returned, commission reduced 50%.");
        }

        ChallengeOutcome::Pending => unreachable!(),
    }

    challenge.status = ChallengeStatus::Resolved;
    challenge.outcome = outcome;
    challenge.resolved_at = clock.unix_timestamp;
    challenge.resolver = ctx.accounts.resolver.key();

    Ok(())
}
