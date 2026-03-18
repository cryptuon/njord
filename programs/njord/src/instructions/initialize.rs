use anchor_lang::prelude::*;
use crate::state::ProtocolConfig;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = ProtocolConfig::LEN,
        seeds = [b"protocol_config"],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,

    /// CHECK: Treasury wallet
    pub treasury: UncheckedAccount<'info>,

    /// NJORD token mint
    pub njord_mint: Account<'info, anchor_spl::token::Mint>,

    pub system_program: Program<'info, System>,
}

pub fn initialize(
    ctx: Context<Initialize>,
    protocol_fee_bps: u16,
    min_challenge_bond: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;

    config.authority = ctx.accounts.authority.key();
    config.treasury = ctx.accounts.treasury.key();
    config.protocol_fee_bps = protocol_fee_bps;
    config.min_challenge_bond = min_challenge_bond;
    config.njord_mint = ctx.accounts.njord_mint.key();
    config.total_campaigns = 0;
    config.total_attributions = 0;
    config.total_volume = 0;
    config.bump = ctx.bumps.config;

    msg!("Protocol initialized with fee: {} bps", protocol_fee_bps);

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"protocol_config"],
        bump = config.bump,
        has_one = authority
    )]
    pub config: Account<'info, ProtocolConfig>,
}

pub fn update_config(
    ctx: Context<UpdateConfig>,
    new_protocol_fee_bps: Option<u16>,
    new_min_challenge_bond: Option<u64>,
    new_treasury: Option<Pubkey>,
) -> Result<()> {
    let config = &mut ctx.accounts.config;

    if let Some(fee) = new_protocol_fee_bps {
        config.protocol_fee_bps = fee;
    }

    if let Some(bond) = new_min_challenge_bond {
        config.min_challenge_bond = bond;
    }

    if let Some(treasury) = new_treasury {
        config.treasury = treasury;
    }

    msg!("Protocol config updated");

    Ok(())
}
