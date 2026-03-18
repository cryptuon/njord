use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{
    Campaign, CampaignStatus, CommissionType, AttributionModel,
    TargetAction, AffiliateTier, ProtocolConfig
};
use crate::errors::NjordError;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCampaignParams {
    pub commission_type: CommissionType,
    pub commission_rate_bps: u16,
    pub attribution_model: AttributionModel,
    pub target_action: TargetAction,
    pub min_affiliate_tier: AffiliateTier,
    pub custom_hold_period: i64,
    pub start_time: i64,
    pub end_time: i64,
    pub max_affiliates: u32,
    pub auto_approve: bool,
    pub metadata_uri: String,
}

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub company: Signer<'info>,

    #[account(
        mut,
        seeds = [b"protocol_config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(
        init,
        payer = company,
        space = Campaign::LEN,
        seeds = [b"campaign", config.total_campaigns.to_le_bytes().as_ref()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    /// Payment token mint (e.g., USDC)
    pub payment_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        init,
        payer = company,
        token::mint = payment_mint,
        token::authority = campaign,
        seeds = [b"escrow", campaign.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_campaign(
    ctx: Context<CreateCampaign>,
    params: CreateCampaignParams,
) -> Result<()> {
    require!(
        params.commission_rate_bps <= 10000,
        NjordError::InvalidCommissionRate
    );

    require!(
        params.custom_hold_period >= 0 && params.custom_hold_period <= 7 * 24 * 60 * 60,
        NjordError::InvalidHoldPeriod
    );

    let clock = Clock::get()?;
    let config = &mut ctx.accounts.config;
    let campaign = &mut ctx.accounts.campaign;

    campaign.company = ctx.accounts.company.key();
    campaign.payment_mint = ctx.accounts.payment_mint.key();
    campaign.escrow = ctx.accounts.escrow.key();
    campaign.budget = 0;
    campaign.spent = 0;
    campaign.commission_type = params.commission_type;
    campaign.commission_rate_bps = params.commission_rate_bps;
    campaign.attribution_model = params.attribution_model;
    campaign.target_action = params.target_action;
    campaign.min_affiliate_tier = params.min_affiliate_tier;
    campaign.custom_hold_period = params.custom_hold_period;
    campaign.status = CampaignStatus::Active;
    campaign.start_time = if params.start_time == 0 {
        clock.unix_timestamp
    } else {
        params.start_time
    };
    campaign.end_time = params.end_time;
    campaign.max_affiliates = params.max_affiliates;
    campaign.affiliate_count = 0;
    campaign.total_attributions = 0;
    campaign.auto_approve = params.auto_approve;
    campaign.metadata_uri = params.metadata_uri;
    campaign.campaign_id = config.total_campaigns;
    campaign.created_at = clock.unix_timestamp;
    campaign.bump = ctx.bumps.campaign;

    config.total_campaigns = config.total_campaigns.checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;

    msg!("Campaign {} created by {}", campaign.campaign_id, campaign.company);

    Ok(())
}

#[derive(Accounts)]
pub struct FundCampaign<'info> {
    #[account(mut)]
    pub company: Signer<'info>,

    #[account(
        mut,
        has_one = company,
        has_one = escrow
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        constraint = company_token_account.owner == company.key()
    )]
    pub company_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub escrow: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn fund_campaign(ctx: Context<FundCampaign>, amount: u64) -> Result<()> {
    require!(amount > 0, NjordError::InvalidAmount);

    let campaign = &mut ctx.accounts.campaign;

    // Transfer tokens to escrow
    let cpi_accounts = Transfer {
        from: ctx.accounts.company_token_account.to_account_info(),
        to: ctx.accounts.escrow.to_account_info(),
        authority: ctx.accounts.company.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    campaign.budget = campaign.budget.checked_add(amount)
        .ok_or(NjordError::ArithmeticOverflow)?;

    msg!("Campaign {} funded with {} tokens", campaign.campaign_id, amount);

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateCampaignStatus<'info> {
    #[account(mut)]
    pub company: Signer<'info>,

    #[account(
        mut,
        has_one = company
    )]
    pub campaign: Account<'info, Campaign>,
}

pub fn pause_campaign(ctx: Context<UpdateCampaignStatus>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    require!(
        campaign.status == CampaignStatus::Active,
        NjordError::CampaignNotActive
    );

    campaign.status = CampaignStatus::Paused;
    msg!("Campaign {} paused", campaign.campaign_id);

    Ok(())
}

pub fn resume_campaign(ctx: Context<UpdateCampaignStatus>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;
    require!(
        campaign.status == CampaignStatus::Paused,
        NjordError::CampaignNotActive
    );

    campaign.status = CampaignStatus::Active;
    msg!("Campaign {} resumed", campaign.campaign_id);

    Ok(())
}

pub fn end_campaign(ctx: Context<UpdateCampaignStatus>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;

    campaign.status = CampaignStatus::Ended;
    msg!("Campaign {} ended", campaign.campaign_id);

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawCampaignFunds<'info> {
    #[account(mut)]
    pub company: Signer<'info>,

    #[account(
        mut,
        has_one = company,
        has_one = escrow,
        constraint = campaign.status == CampaignStatus::Ended @ NjordError::CampaignNotActive
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = company_token_account.owner == company.key()
    )]
    pub company_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn withdraw_campaign_funds(ctx: Context<WithdrawCampaignFunds>) -> Result<()> {
    let campaign = &ctx.accounts.campaign;
    let remaining = campaign.budget.checked_sub(campaign.spent)
        .ok_or(NjordError::ArithmeticOverflow)?;

    require!(remaining > 0, NjordError::InvalidAmount);

    // Transfer remaining funds back to company
    let campaign_key = campaign.key();
    let seeds = &[
        b"escrow",
        campaign_key.as_ref(),
        &[ctx.bumps.escrow],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.escrow.to_account_info(),
        to: ctx.accounts.company_token_account.to_account_info(),
        authority: ctx.accounts.campaign.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, remaining)?;

    msg!(
        "Withdrew {} tokens from campaign {}",
        remaining,
        campaign.campaign_id
    );

    Ok(())
}
