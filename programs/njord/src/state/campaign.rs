use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum CampaignStatus {
    #[default]
    Active,
    Paused,
    Ended,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum CommissionType {
    #[default]
    Percentage,
    Flat,
    Tiered,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum AttributionModel {
    #[default]
    LastClick,
    FirstClick,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum TargetAction {
    #[default]
    Purchase,
    Signup,
    AppInstall,
    Subscription,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default, PartialOrd, Ord)]
pub enum AffiliateTier {
    #[default]
    New,
    Verified,
    Trusted,
    Elite,
}

impl AffiliateTier {
    /// Default hold period in seconds for each tier
    pub fn default_hold_period(&self) -> i64 {
        match self {
            AffiliateTier::New => 7 * 24 * 60 * 60,      // 7 days
            AffiliateTier::Verified => 3 * 24 * 60 * 60, // 3 days
            AffiliateTier::Trusted => 24 * 60 * 60,      // 24 hours
            AffiliateTier::Elite => 0,                    // Real-time
        }
    }

    /// Minimum stake in NJORD (in smallest unit, 9 decimals)
    pub fn min_stake(&self) -> u64 {
        match self {
            AffiliateTier::New => 0,
            AffiliateTier::Verified => 100 * 1_000_000_000,    // 100 NJORD
            AffiliateTier::Trusted => 1_000 * 1_000_000_000,   // 1,000 NJORD
            AffiliateTier::Elite => 10_000 * 1_000_000_000,    // 10,000 NJORD
        }
    }
}

/// Campaign account
#[account]
pub struct Campaign {
    /// Campaign creator (company)
    pub company: Pubkey,
    /// Payment token mint (e.g., USDC)
    pub payment_mint: Pubkey,
    /// Escrow token account holding campaign funds
    pub escrow: Pubkey,
    /// Total budget deposited
    pub budget: u64,
    /// Amount spent on commissions
    pub spent: u64,
    /// Commission type
    pub commission_type: CommissionType,
    /// Commission rate in basis points (10000 = 100%)
    pub commission_rate_bps: u16,
    /// Attribution model
    pub attribution_model: AttributionModel,
    /// Target action type
    pub target_action: TargetAction,
    /// Minimum affiliate tier required
    pub min_affiliate_tier: AffiliateTier,
    /// Custom hold period in seconds (0 = use tier default)
    pub custom_hold_period: i64,
    /// Campaign status
    pub status: CampaignStatus,
    /// Start timestamp
    pub start_time: i64,
    /// End timestamp (0 = no end)
    pub end_time: i64,
    /// Maximum number of affiliates (0 = unlimited)
    pub max_affiliates: u32,
    /// Current number of affiliates
    pub affiliate_count: u32,
    /// Total attributions for this campaign
    pub total_attributions: u64,
    /// Auto-approve affiliate signups
    pub auto_approve: bool,
    /// Metadata URI (IPFS/Arweave)
    pub metadata_uri: String,
    /// Campaign ID (sequential)
    pub campaign_id: u64,
    /// Created timestamp
    pub created_at: i64,
    /// Bump seed
    pub bump: u8,
}

impl Campaign {
    pub const MAX_METADATA_URI_LEN: usize = 200;

    pub const LEN: usize = 8 +  // discriminator
        32 + // company
        32 + // payment_mint
        32 + // escrow
        8 +  // budget
        8 +  // spent
        1 +  // commission_type
        2 +  // commission_rate_bps
        1 +  // attribution_model
        1 +  // target_action
        1 +  // min_affiliate_tier
        8 +  // custom_hold_period
        1 +  // status
        8 +  // start_time
        8 +  // end_time
        4 +  // max_affiliates
        4 +  // affiliate_count
        8 +  // total_attributions
        1 +  // auto_approve
        4 + Self::MAX_METADATA_URI_LEN + // metadata_uri
        8 +  // campaign_id
        8 +  // created_at
        1;   // bump

    /// Get effective hold period based on affiliate tier
    pub fn get_hold_period(&self, affiliate_tier: &AffiliateTier) -> i64 {
        if self.custom_hold_period > 0 {
            self.custom_hold_period
        } else {
            affiliate_tier.default_hold_period()
        }
    }

    /// Check if campaign is active and within time bounds
    pub fn is_active(&self, current_time: i64) -> bool {
        self.status == CampaignStatus::Active
            && current_time >= self.start_time
            && (self.end_time == 0 || current_time < self.end_time)
    }

    /// Calculate commission for a given value
    pub fn calculate_commission(&self, value: u64) -> Option<u64> {
        match self.commission_type {
            CommissionType::Percentage => {
                value
                    .checked_mul(self.commission_rate_bps as u64)?
                    .checked_div(10_000)
            }
            CommissionType::Flat => Some(self.commission_rate_bps as u64),
            CommissionType::Tiered => {
                // For now, treat tiered same as percentage
                // Future: implement tier thresholds
                value
                    .checked_mul(self.commission_rate_bps as u64)?
                    .checked_div(10_000)
            }
        }
    }
}
