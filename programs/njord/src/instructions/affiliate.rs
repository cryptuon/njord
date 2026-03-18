use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{
    AffiliateProfile, AffiliateRegistration, AffiliateStake, AffiliateStatus,
    Campaign, CampaignStatus, AffiliateTier, ProtocolConfig
};
use crate::errors::NjordError;

#[derive(Accounts)]
pub struct CreateAffiliateProfile<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,

    #[account(
        init,
        payer = wallet,
        space = AffiliateProfile::LEN,
        seeds = [b"affiliate_profile", wallet.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, AffiliateProfile>,

    pub system_program: Program<'info, System>,
}

pub fn create_affiliate_profile(ctx: Context<CreateAffiliateProfile>) -> Result<()> {
    let clock = Clock::get()?;
    let profile = &mut ctx.accounts.profile;

    profile.wallet = ctx.accounts.wallet.key();
    profile.tier = AffiliateTier::New;
    profile.stake_account = Pubkey::default();
    profile.staked_amount = 0;
    profile.total_campaigns = 0;
    profile.total_attributions = 0;
    profile.total_earnings = 0;
    profile.dispute_rate_bps = 0;
    profile.disputes_lost = 0;
    profile.created_at = clock.unix_timestamp;
    profile.last_active_at = clock.unix_timestamp;
    profile.is_suspended = false;
    profile.suspension_ends_at = 0;
    profile.bump = ctx.bumps.profile;

    msg!("Affiliate profile created for {}", profile.wallet);

    Ok(())
}

#[derive(Accounts)]
pub struct StakeNjord<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,

    #[account(
        mut,
        seeds = [b"affiliate_profile", wallet.key().as_ref()],
        bump = profile.bump,
        has_one = wallet
    )]
    pub profile: Account<'info, AffiliateProfile>,

    #[account(
        seeds = [b"protocol_config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(
        init_if_needed,
        payer = wallet,
        space = AffiliateStake::LEN,
        seeds = [b"affiliate_stake", profile.key().as_ref()],
        bump
    )]
    pub stake: Account<'info, AffiliateStake>,

    #[account(
        mut,
        constraint = wallet_token_account.owner == wallet.key(),
        constraint = wallet_token_account.mint == config.njord_mint
    )]
    pub wallet_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = wallet,
        token::mint = njord_mint,
        token::authority = stake,
        seeds = [b"affiliate_stake_vault", stake.key().as_ref()],
        bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    #[account(
        constraint = njord_mint.key() == config.njord_mint
    )]
    pub njord_mint: Account<'info, anchor_spl::token::Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn stake_njord(ctx: Context<StakeNjord>, amount: u64) -> Result<()> {
    require!(amount > 0, NjordError::InvalidAmount);

    let clock = Clock::get()?;
    let profile = &mut ctx.accounts.profile;
    let stake = &mut ctx.accounts.stake;

    // Initialize stake account if new
    if stake.affiliate_profile == Pubkey::default() {
        stake.affiliate_profile = profile.key();
        stake.token_account = ctx.accounts.stake_vault.key();
        stake.amount = 0;
        stake.unbonding_amount = 0;
        stake.unbonding_ends_at = 0;
        stake.bump = ctx.bumps.stake;
    }

    // Transfer NJORD to stake vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.wallet_token_account.to_account_info(),
        to: ctx.accounts.stake_vault.to_account_info(),
        authority: ctx.accounts.wallet.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    stake.amount = stake.amount.checked_add(amount)
        .ok_or(NjordError::ArithmeticOverflow)?;

    profile.staked_amount = stake.amount;
    profile.stake_account = stake.key();
    profile.tier = profile.calculate_tier(clock.unix_timestamp);

    msg!(
        "Staked {} NJORD, new tier: {:?}",
        amount,
        profile.tier
    );

    Ok(())
}

#[derive(Accounts)]
pub struct JoinCampaign<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,

    #[account(
        mut,
        seeds = [b"affiliate_profile", wallet.key().as_ref()],
        bump = profile.bump,
        has_one = wallet
    )]
    pub profile: Account<'info, AffiliateProfile>,

    #[account(
        mut,
        constraint = campaign.is_active(Clock::get()?.unix_timestamp) @ NjordError::CampaignNotActive
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = wallet,
        space = AffiliateRegistration::LEN,
        seeds = [b"affiliate_registration", campaign.key().as_ref(), profile.key().as_ref()],
        bump
    )]
    pub registration: Account<'info, AffiliateRegistration>,

    pub system_program: Program<'info, System>,
}

pub fn join_campaign(ctx: Context<JoinCampaign>) -> Result<()> {
    let clock = Clock::get()?;
    let profile = &mut ctx.accounts.profile;
    let campaign = &mut ctx.accounts.campaign;
    let registration = &mut ctx.accounts.registration;

    // Check if suspended
    require!(!profile.is_suspended, NjordError::AffiliateSuspended);

    // Check tier requirement
    require!(
        profile.tier >= campaign.min_affiliate_tier,
        NjordError::AffiliateTierTooLow
    );

    // Check max affiliates
    if campaign.max_affiliates > 0 {
        require!(
            campaign.affiliate_count < campaign.max_affiliates,
            NjordError::MaxAffiliatesReached
        );
    }

    registration.affiliate = profile.key();
    registration.campaign = campaign.key();
    registration.status = if campaign.auto_approve {
        AffiliateStatus::Active
    } else {
        AffiliateStatus::PendingApproval
    };
    registration.attributions_count = 0;
    registration.earnings = 0;
    registration.pending_earnings = 0;
    registration.joined_at = clock.unix_timestamp;
    registration.bump = ctx.bumps.registration;

    campaign.affiliate_count = campaign.affiliate_count.checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;

    profile.total_campaigns = profile.total_campaigns.checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;
    profile.last_active_at = clock.unix_timestamp;

    msg!(
        "Affiliate {} joined campaign {}",
        profile.wallet,
        campaign.campaign_id
    );

    Ok(())
}

#[derive(Accounts)]
pub struct ApproveAffiliate<'info> {
    #[account(mut)]
    pub company: Signer<'info>,

    #[account(
        has_one = company
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        seeds = [b"affiliate_registration", campaign.key().as_ref(), profile.key().as_ref()],
        bump = registration.bump,
        has_one = campaign
    )]
    pub registration: Account<'info, AffiliateRegistration>,

    pub profile: Account<'info, AffiliateProfile>,
}

pub fn approve_affiliate(ctx: Context<ApproveAffiliate>) -> Result<()> {
    let registration = &mut ctx.accounts.registration;

    require!(
        registration.status == AffiliateStatus::PendingApproval,
        NjordError::AffiliateAlreadyRegistered
    );

    registration.status = AffiliateStatus::Active;

    msg!(
        "Affiliate {} approved for campaign {}",
        ctx.accounts.profile.wallet,
        ctx.accounts.campaign.campaign_id
    );

    Ok(())
}

#[derive(Accounts)]
pub struct UnstakeNjord<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,

    #[account(
        mut,
        seeds = [b"affiliate_profile", wallet.key().as_ref()],
        bump = profile.bump,
        has_one = wallet
    )]
    pub profile: Account<'info, AffiliateProfile>,

    #[account(
        mut,
        seeds = [b"affiliate_stake", profile.key().as_ref()],
        bump = stake.bump,
        has_one = affiliate_profile @ NjordError::Unauthorized
    )]
    pub stake: Account<'info, AffiliateStake>,

    #[account(address = stake.affiliate_profile)]
    pub affiliate_profile: Account<'info, AffiliateProfile>,
}

pub fn initiate_unstake(ctx: Context<UnstakeNjord>, amount: u64) -> Result<()> {
    let clock = Clock::get()?;
    let stake = &mut ctx.accounts.stake;
    let profile = &mut ctx.accounts.profile;

    require!(amount > 0 && amount <= stake.amount, NjordError::InvalidAmount);

    stake.amount = stake.amount.checked_sub(amount)
        .ok_or(NjordError::ArithmeticOverflow)?;
    stake.unbonding_amount = stake.unbonding_amount.checked_add(amount)
        .ok_or(NjordError::ArithmeticOverflow)?;
    stake.unbonding_ends_at = clock.unix_timestamp + AffiliateStake::UNBONDING_PERIOD;

    profile.staked_amount = stake.amount;
    profile.tier = profile.calculate_tier(clock.unix_timestamp);

    msg!(
        "Initiated unstake of {} NJORD, unbonds at {}",
        amount,
        stake.unbonding_ends_at
    );

    Ok(())
}
