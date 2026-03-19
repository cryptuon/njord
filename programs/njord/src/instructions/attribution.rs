use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{
    Attribution, AttributionStatus, CustomerAttribution,
    Campaign, CampaignStatus, AffiliateProfile, AffiliateRegistration, AffiliateStatus,
    Bridge, BridgeStatus, ProtocolConfig
};
use crate::errors::NjordError;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RecordAttributionParams {
    pub action_value: u64,
    pub customer_hash: [u8; 32],
    pub nonce: [u8; 16],
    pub fraud_score: u8,
}

#[derive(Accounts)]
#[instruction(params: RecordAttributionParams)]
pub struct RecordAttribution<'info> {
    /// Bridge operator submitting the attribution
    #[account(mut)]
    pub bridge_operator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"protocol_config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        constraint = campaign.is_active(Clock::get()?.unix_timestamp) @ NjordError::CampaignNotActive
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        seeds = [b"affiliate_registration", campaign.key().as_ref(), affiliate_profile.key().as_ref()],
        bump = affiliate_registration.bump,
        constraint = affiliate_registration.status == AffiliateStatus::Active @ NjordError::AffiliateNotRegistered
    )]
    pub affiliate_registration: Account<'info, AffiliateRegistration>,

    #[account(
        mut,
        seeds = [b"affiliate_profile", affiliate_profile.wallet.as_ref()],
        bump = affiliate_profile.bump
    )]
    pub affiliate_profile: Account<'info, AffiliateProfile>,

    #[account(
        mut,
        seeds = [b"bridge", bridge_operator.key().as_ref()],
        bump = bridge.bump,
        constraint = bridge.status == BridgeStatus::Active @ NjordError::BridgeNotActive
    )]
    pub bridge: Account<'info, Bridge>,

    #[account(
        init,
        payer = bridge_operator,
        space = Attribution::LEN,
        seeds = [b"attribution", campaign.key().as_ref(), &params.nonce],
        bump
    )]
    pub attribution: Account<'info, Attribution>,

    #[account(
        init_if_needed,
        payer = bridge_operator,
        space = CustomerAttribution::LEN,
        seeds = [b"customer_attribution", campaign.key().as_ref(), &params.customer_hash],
        bump
    )]
    pub customer_attribution: Account<'info, CustomerAttribution>,

    pub system_program: Program<'info, System>,
}

pub fn record_attribution(
    ctx: Context<RecordAttribution>,
    params: RecordAttributionParams,
) -> Result<()> {
    let clock = Clock::get()?;
    let config = &mut ctx.accounts.config;
    let campaign = &mut ctx.accounts.campaign;
    let affiliate_profile = &mut ctx.accounts.affiliate_profile;
    let affiliate_registration = &mut ctx.accounts.affiliate_registration;
    let bridge = &mut ctx.accounts.bridge;
    let attribution = &mut ctx.accounts.attribution;
    let customer_attribution = &mut ctx.accounts.customer_attribution;

    // Check for self-referral
    require!(
        affiliate_profile.wallet != ctx.accounts.bridge_operator.key(),
        NjordError::SelfReferral
    );

    // Check bridge volume limits
    require!(
        bridge.can_process_volume(params.action_value, clock.unix_timestamp),
        NjordError::BridgeVolumeLimitExceeded
    );

    // Initialize customer attribution tracking if new
    if customer_attribution.campaign == Pubkey::default() {
        customer_attribution.campaign = campaign.key();
        customer_attribution.customer_hash = params.customer_hash;
        customer_attribution.first_attribution = attribution.key();
        customer_attribution.attribution_count = 0;
        customer_attribution.created_at = clock.unix_timestamp;
        customer_attribution.bump = ctx.bumps.customer_attribution;
    } else {
        // Check for duplicate (same customer, same campaign within short window)
        // For now, just increment count - more sophisticated logic can be added
    }
    customer_attribution.last_attribution = attribution.key();
    customer_attribution.attribution_count = customer_attribution.attribution_count
        .checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;

    // Calculate commission
    let commission_amount = campaign.calculate_commission(params.action_value)
        .ok_or(NjordError::ArithmeticOverflow)?;

    // Check budget
    let remaining_budget = campaign.budget.checked_sub(campaign.spent)
        .ok_or(NjordError::InsufficientBudget)?;
    require!(remaining_budget >= commission_amount, NjordError::InsufficientBudget);

    // Calculate fees
    let protocol_fee = commission_amount
        .checked_mul(config.protocol_fee_bps as u64)
        .ok_or(NjordError::ArithmeticOverflow)?
        / 10_000;

    let bridge_fee = commission_amount
        .checked_mul(bridge.tier.fee_bps() as u64)
        .ok_or(NjordError::ArithmeticOverflow)?
        / 10_000;

    let net_commission = commission_amount
        .checked_sub(protocol_fee)
        .and_then(|v| v.checked_sub(bridge_fee))
        .ok_or(NjordError::ArithmeticOverflow)?;

    // Calculate hold period
    let hold_period = campaign.get_hold_period(&affiliate_profile.tier);

    // Populate attribution
    attribution.campaign = campaign.key();
    attribution.affiliate_registration = affiliate_registration.key();
    attribution.bridge = bridge.key();
    attribution.action_value = params.action_value;
    attribution.commission_amount = commission_amount;
    attribution.protocol_fee = protocol_fee;
    attribution.bridge_fee = bridge_fee;
    attribution.net_commission = net_commission;
    attribution.customer_hash = params.customer_hash;
    attribution.status = AttributionStatus::Pending;
    attribution.fraud_score = params.fraud_score;
    attribution.created_at = clock.unix_timestamp;
    attribution.settles_at = clock.unix_timestamp + hold_period;
    attribution.settled_at = 0;
    attribution.nonce = params.nonce;
    attribution.attribution_id = campaign.total_attributions;
    attribution.bump = ctx.bumps.attribution;

    // Update campaign stats
    campaign.total_attributions = campaign.total_attributions
        .checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;
    campaign.spent = campaign.spent
        .checked_add(commission_amount)
        .ok_or(NjordError::ArithmeticOverflow)?;

    // Update affiliate stats
    affiliate_registration.attributions_count = affiliate_registration.attributions_count
        .checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;
    affiliate_registration.pending_earnings = affiliate_registration.pending_earnings
        .checked_add(net_commission)
        .ok_or(NjordError::ArithmeticOverflow)?;

    affiliate_profile.total_attributions = affiliate_profile.total_attributions
        .checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;
    affiliate_profile.last_active_at = clock.unix_timestamp;

    // Update bridge stats
    bridge.total_attributions = bridge.total_attributions
        .checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;
    bridge.total_volume = bridge.total_volume
        .checked_add(params.action_value)
        .ok_or(NjordError::ArithmeticOverflow)?;

    // Reset daily volume if needed
    if clock.unix_timestamp - bridge.daily_volume_reset_at >= 24 * 60 * 60 {
        bridge.daily_volume = 0;
        bridge.daily_volume_reset_at = clock.unix_timestamp;
    }
    bridge.daily_volume = bridge.daily_volume
        .checked_add(params.action_value)
        .ok_or(NjordError::ArithmeticOverflow)?;
    bridge.last_active_at = clock.unix_timestamp;

    // Update protocol stats
    config.total_attributions = config.total_attributions
        .checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;
    config.total_volume = config.total_volume
        .checked_add(params.action_value)
        .ok_or(NjordError::ArithmeticOverflow)?;

    msg!(
        "Attribution {} recorded: value={}, commission={}, settles_at={}",
        attribution.attribution_id,
        params.action_value,
        net_commission,
        attribution.settles_at
    );

    Ok(())
}

#[derive(Accounts)]
pub struct SettleAttribution<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        seeds = [b"protocol_config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        has_one = campaign,
        constraint = attribution.can_settle(Clock::get()?.unix_timestamp) @ NjordError::HoldPeriodNotElapsed
    )]
    pub attribution: Account<'info, Attribution>,

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
        address = campaign.escrow
    )]
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = affiliate_token_account.owner == affiliate_profile.wallet
    )]
    pub affiliate_token_account: Account<'info, TokenAccount>,

    /// CHECK: Treasury account
    #[account(
        mut,
        address = config.treasury
    )]
    pub treasury: UncheckedAccount<'info>,

    #[account(
        mut,
        address = attribution.bridge
    )]
    pub bridge: Account<'info, Bridge>,

    pub token_program: Program<'info, Token>,
}

pub fn settle_attribution(ctx: Context<SettleAttribution>) -> Result<()> {
    let clock = Clock::get()?;
    let attribution = &mut ctx.accounts.attribution;
    let affiliate_registration = &mut ctx.accounts.affiliate_registration;
    let affiliate_profile = &mut ctx.accounts.affiliate_profile;
    let bridge = &mut ctx.accounts.bridge;

    // Transfer net commission to affiliate
    let campaign_key = ctx.accounts.campaign.key();
    let seeds = &[
        b"escrow",
        campaign_key.as_ref(),
        &[ctx.bumps.escrow],
    ];
    let signer = &[&seeds[..]];

    // Transfer to affiliate
    let cpi_accounts = Transfer {
        from: ctx.accounts.escrow.to_account_info(),
        to: ctx.accounts.affiliate_token_account.to_account_info(),
        authority: ctx.accounts.campaign.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer
    );
    token::transfer(cpi_ctx, attribution.net_commission)?;

    // Update attribution status
    attribution.status = AttributionStatus::Settled;
    attribution.settled_at = clock.unix_timestamp;

    // Update affiliate registration
    affiliate_registration.pending_earnings = affiliate_registration.pending_earnings
        .checked_sub(attribution.net_commission)
        .ok_or(NjordError::ArithmeticOverflow)?;
    affiliate_registration.earnings = affiliate_registration.earnings
        .checked_add(attribution.net_commission)
        .ok_or(NjordError::ArithmeticOverflow)?;

    // Update affiliate profile
    affiliate_profile.total_earnings = affiliate_profile.total_earnings
        .checked_add(attribution.net_commission)
        .ok_or(NjordError::ArithmeticOverflow)?;

    // Update bridge fees earned
    bridge.total_fees_earned = bridge.total_fees_earned
        .checked_add(attribution.bridge_fee)
        .ok_or(NjordError::ArithmeticOverflow)?;

    msg!(
        "Attribution {} settled: {} to affiliate",
        attribution.attribution_id,
        attribution.net_commission
    );

    Ok(())
}
