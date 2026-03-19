use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{Bridge, BridgeStake, BridgeStatus, BridgeTier, ProtocolConfig};
use crate::errors::NjordError;

#[derive(Accounts)]
pub struct RegisterBridge<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,

    #[account(
        seeds = [b"protocol_config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(
        init,
        payer = operator,
        space = Bridge::LEN,
        seeds = [b"bridge", operator.key().as_ref()],
        bump
    )]
    pub bridge: Account<'info, Bridge>,

    pub system_program: Program<'info, System>,
}

pub fn register_bridge(
    ctx: Context<RegisterBridge>,
    region: [u8; 4],
    metadata_uri: String,
) -> Result<()> {
    let clock = Clock::get()?;
    let bridge = &mut ctx.accounts.bridge;

    bridge.operator = ctx.accounts.operator.key();
    bridge.stake_account = Pubkey::default();
    bridge.staked_amount = 0;
    bridge.tier = BridgeTier::Bronze;
    bridge.status = BridgeStatus::Inactive; // Inactive until staked
    bridge.region = region;
    bridge.total_attributions = 0;
    bridge.total_volume = 0;
    bridge.daily_volume = 0;
    bridge.daily_volume_reset_at = clock.unix_timestamp;
    bridge.fraud_rate_bps = 0;
    bridge.fraud_count = 0;
    bridge.reputation_score = 5000; // Start at 50%
    bridge.total_fees_earned = 0;
    bridge.slashing_count = 0;
    bridge.last_slashed_at = 0;
    bridge.unbonding_amount = 0;
    bridge.unbonding_ends_at = 0;
    bridge.registered_at = clock.unix_timestamp;
    bridge.last_active_at = clock.unix_timestamp;
    bridge.metadata_uri = metadata_uri;
    bridge.bump = ctx.bumps.bridge;

    msg!("Bridge registered for operator {}", bridge.operator);

    Ok(())
}

#[derive(Accounts)]
pub struct StakeBridge<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,

    #[account(
        seeds = [b"protocol_config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [b"bridge", operator.key().as_ref()],
        bump = bridge.bump,
        has_one = operator
    )]
    pub bridge: Account<'info, Bridge>,

    #[account(
        init_if_needed,
        payer = operator,
        space = BridgeStake::LEN,
        seeds = [b"bridge_stake", bridge.key().as_ref()],
        bump
    )]
    pub stake: Account<'info, BridgeStake>,

    #[account(
        mut,
        constraint = operator_token_account.owner == operator.key(),
        constraint = operator_token_account.mint == config.njord_mint
    )]
    pub operator_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = operator,
        token::mint = njord_mint,
        token::authority = stake,
        seeds = [b"bridge_stake_vault", stake.key().as_ref()],
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

pub fn stake_bridge(ctx: Context<StakeBridge>, amount: u64) -> Result<()> {
    require!(amount > 0, NjordError::InvalidAmount);

    let bridge = &mut ctx.accounts.bridge;
    let stake = &mut ctx.accounts.stake;

    // Initialize stake if new
    if stake.bridge == Pubkey::default() {
        stake.bridge = bridge.key();
        stake.token_account = ctx.accounts.stake_vault.key();
        stake.amount = 0;
        stake.unbonding_amount = 0;
        stake.unbonding_ends_at = 0;
        stake.bump = ctx.bumps.stake;
    }

    // Transfer NJORD to stake vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.operator_token_account.to_account_info(),
        to: ctx.accounts.stake_vault.to_account_info(),
        authority: ctx.accounts.operator.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    stake.amount = stake.amount.checked_add(amount)
        .ok_or(NjordError::ArithmeticOverflow)?;

    bridge.staked_amount = stake.amount;
    bridge.stake_account = stake.key();
    bridge.tier = bridge.calculate_tier();

    // Activate bridge if minimum stake met
    if bridge.staked_amount >= BridgeTier::Bronze.min_stake() {
        bridge.status = BridgeStatus::Active;
    }

    msg!(
        "Bridge staked {} NJORD, tier: {:?}, status: {:?}",
        amount,
        bridge.tier,
        bridge.status
    );

    Ok(())
}

#[derive(Accounts)]
pub struct InitiateUnstakeBridge<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"bridge", operator.key().as_ref()],
        bump = bridge.bump,
        has_one = operator
    )]
    pub bridge: Account<'info, Bridge>,

    #[account(
        mut,
        seeds = [b"bridge_stake", bridge.key().as_ref()],
        bump = stake.bump,
        has_one = bridge
    )]
    pub stake: Account<'info, BridgeStake>,
}

pub fn initiate_unstake_bridge(ctx: Context<InitiateUnstakeBridge>, amount: u64) -> Result<()> {
    let clock = Clock::get()?;
    let bridge = &mut ctx.accounts.bridge;
    let stake = &mut ctx.accounts.stake;

    require!(amount > 0 && amount <= stake.amount, NjordError::InvalidAmount);

    stake.amount = stake.amount.checked_sub(amount)
        .ok_or(NjordError::ArithmeticOverflow)?;
    stake.unbonding_amount = stake.unbonding_amount.checked_add(amount)
        .ok_or(NjordError::ArithmeticOverflow)?;
    stake.unbonding_ends_at = clock.unix_timestamp + Bridge::UNBONDING_PERIOD;

    bridge.staked_amount = stake.amount;
    bridge.unbonding_amount = stake.unbonding_amount;
    bridge.unbonding_ends_at = stake.unbonding_ends_at;
    bridge.tier = bridge.calculate_tier();

    // Deactivate if below minimum
    if bridge.staked_amount < BridgeTier::Bronze.min_stake() {
        bridge.status = BridgeStatus::Unbonding;
    }

    msg!(
        "Bridge initiated unstake of {} NJORD, unbonds at {}",
        amount,
        stake.unbonding_ends_at
    );

    Ok(())
}

#[derive(Accounts)]
pub struct SlashBridge<'info> {
    /// Protocol authority
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"protocol_config"],
        bump = config.bump,
        has_one = authority
    )]
    pub config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [b"bridge", bridge.operator.as_ref()],
        bump = bridge.bump
    )]
    pub bridge: Account<'info, Bridge>,

    #[account(
        mut,
        seeds = [b"bridge_stake", bridge.key().as_ref()],
        bump = stake.bump,
        has_one = bridge
    )]
    pub stake: Account<'info, BridgeStake>,

    #[account(
        mut,
        seeds = [b"bridge_stake_vault", stake.key().as_ref()],
        bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    /// CHECK: Treasury to receive slashed funds
    #[account(
        mut,
        address = config.treasury
    )]
    pub treasury: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn slash_bridge(ctx: Context<SlashBridge>, amount: u64, reason: String) -> Result<()> {
    let clock = Clock::get()?;
    let bridge = &mut ctx.accounts.bridge;
    let stake = &mut ctx.accounts.stake;

    let slash_amount = std::cmp::min(amount, stake.amount);
    require!(slash_amount > 0, NjordError::InvalidAmount);

    // Transfer slashed amount to treasury
    let stake_key = stake.key();
    let seeds = &[
        b"bridge_stake_vault",
        stake_key.as_ref(),
        &[ctx.bumps.stake_vault],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.stake_vault.to_account_info(),
        to: ctx.accounts.treasury.to_account_info(),
        authority: ctx.accounts.stake.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer
    );
    token::transfer(cpi_ctx, slash_amount)?;

    stake.amount = stake.amount.checked_sub(slash_amount)
        .ok_or(NjordError::ArithmeticOverflow)?;

    bridge.staked_amount = stake.amount;
    bridge.slashing_count = bridge.slashing_count.checked_add(1)
        .ok_or(NjordError::ArithmeticOverflow)?;
    bridge.last_slashed_at = clock.unix_timestamp;
    bridge.tier = bridge.calculate_tier();

    // Reduce reputation
    bridge.reputation_score = bridge.reputation_score.saturating_sub(500); // -5%

    // Suspend if stake falls below minimum
    if bridge.staked_amount < BridgeTier::Bronze.min_stake() {
        bridge.status = BridgeStatus::Suspended;
    }

    msg!(
        "Bridge slashed {} NJORD. Reason: {}. New stake: {}",
        slash_amount,
        reason,
        bridge.staked_amount
    );

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateBridgeMetadata<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"bridge", operator.key().as_ref()],
        bump = bridge.bump,
        has_one = operator
    )]
    pub bridge: Account<'info, Bridge>,
}

pub fn update_bridge_metadata(
    ctx: Context<UpdateBridgeMetadata>,
    metadata_uri: Option<String>,
    region: Option<[u8; 4]>,
) -> Result<()> {
    let bridge = &mut ctx.accounts.bridge;

    if let Some(uri) = metadata_uri {
        bridge.metadata_uri = uri;
    }

    if let Some(r) = region {
        bridge.region = r;
    }

    msg!("Bridge metadata updated");

    Ok(())
}
