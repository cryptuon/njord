pub mod campaign;
pub mod affiliate;
pub mod attribution;
pub mod bridge;
pub mod challenge;

pub use campaign::*;
pub use affiliate::*;
pub use attribution::*;
pub use bridge::*;
pub use challenge::*;

/// Protocol configuration account (singleton)
#[account]
#[derive(Default)]
pub struct ProtocolConfig {
    /// Protocol authority (admin)
    pub authority: Pubkey,
    /// Treasury wallet for protocol fees
    pub treasury: Pubkey,
    /// Protocol fee in basis points (e.g., 200 = 2%)
    pub protocol_fee_bps: u16,
    /// Minimum challenge bond in lamports
    pub min_challenge_bond: u64,
    /// NJORD token mint
    pub njord_mint: Pubkey,
    /// Total campaigns created
    pub total_campaigns: u64,
    /// Total attributions processed
    pub total_attributions: u64,
    /// Total volume processed (in USDC smallest unit)
    pub total_volume: u64,
    /// Bump seed
    pub bump: u8,
}

impl ProtocolConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // treasury
        2 +  // protocol_fee_bps
        8 +  // min_challenge_bond
        32 + // njord_mint
        8 +  // total_campaigns
        8 +  // total_attributions
        8 +  // total_volume
        1;   // bump
}

use anchor_lang::prelude::*;
