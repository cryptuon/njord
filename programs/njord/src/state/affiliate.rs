use anchor_lang::prelude::*;
use super::AffiliateTier;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum AffiliateStatus {
    #[default]
    Active,
    PendingApproval,
    Suspended,
}

/// Global affiliate profile (one per wallet)
#[account]
pub struct AffiliateProfile {
    /// Affiliate wallet
    pub wallet: Pubkey,
    /// Current tier
    pub tier: AffiliateTier,
    /// NJORD stake account
    pub stake_account: Pubkey,
    /// Amount staked
    pub staked_amount: u64,
    /// Total campaigns joined
    pub total_campaigns: u32,
    /// Total attributions across all campaigns
    pub total_attributions: u64,
    /// Total earnings (in USDC smallest unit)
    pub total_earnings: u64,
    /// Dispute rate in basis points
    pub dispute_rate_bps: u16,
    /// Number of successful challenges against this affiliate
    pub disputes_lost: u32,
    /// Account creation timestamp
    pub created_at: i64,
    /// Last activity timestamp
    pub last_active_at: i64,
    /// Is suspended
    pub is_suspended: bool,
    /// Suspension end timestamp (0 = permanent)
    pub suspension_ends_at: i64,
    /// Bump seed
    pub bump: u8,
}

impl AffiliateProfile {
    pub const LEN: usize = 8 +  // discriminator
        32 + // wallet
        1 +  // tier
        32 + // stake_account
        8 +  // staked_amount
        4 +  // total_campaigns
        8 +  // total_attributions
        8 +  // total_earnings
        2 +  // dispute_rate_bps
        4 +  // disputes_lost
        8 +  // created_at
        8 +  // last_active_at
        1 +  // is_suspended
        8 +  // suspension_ends_at
        1;   // bump

    /// Calculate tier based on stake and history
    pub fn calculate_tier(&self, current_time: i64) -> AffiliateTier {
        let account_age_days = (current_time - self.created_at) / (24 * 60 * 60);

        // Check Elite requirements
        if self.staked_amount >= AffiliateTier::Elite.min_stake()
            && account_age_days >= 180
            && self.total_attributions >= 1000
            && self.dispute_rate_bps <= 50 // 0.5%
        {
            return AffiliateTier::Elite;
        }

        // Check Trusted requirements
        if self.staked_amount >= AffiliateTier::Trusted.min_stake()
            && account_age_days >= 90
            && self.total_attributions >= 100
            && self.dispute_rate_bps <= 100 // 1%
        {
            return AffiliateTier::Trusted;
        }

        // Check Verified requirements
        if self.staked_amount >= AffiliateTier::Verified.min_stake()
            && account_age_days >= 30
            && self.total_attributions >= 10
        {
            return AffiliateTier::Verified;
        }

        AffiliateTier::New
    }

    /// Check if affiliate can join a campaign with given tier requirement
    pub fn can_join_campaign(&self, required_tier: &AffiliateTier) -> bool {
        !self.is_suspended && self.tier >= *required_tier
    }
}

/// Affiliate registration for a specific campaign
#[account]
pub struct AffiliateRegistration {
    /// Reference to affiliate profile
    pub affiliate: Pubkey,
    /// Reference to campaign
    pub campaign: Pubkey,
    /// Registration status
    pub status: AffiliateStatus,
    /// Total attributions for this campaign
    pub attributions_count: u64,
    /// Total earnings from this campaign
    pub earnings: u64,
    /// Pending earnings (in hold period)
    pub pending_earnings: u64,
    /// Joined timestamp
    pub joined_at: i64,
    /// Bump seed
    pub bump: u8,
}

impl AffiliateRegistration {
    pub const LEN: usize = 8 +  // discriminator
        32 + // affiliate
        32 + // campaign
        1 +  // status
        8 +  // attributions_count
        8 +  // earnings
        8 +  // pending_earnings
        8 +  // joined_at
        1;   // bump
}

/// Affiliate NJORD stake account
#[account]
pub struct AffiliateStake {
    /// Affiliate profile
    pub affiliate_profile: Pubkey,
    /// NJORD token account
    pub token_account: Pubkey,
    /// Amount staked
    pub amount: u64,
    /// Unbonding amount
    pub unbonding_amount: u64,
    /// Unbonding end timestamp
    pub unbonding_ends_at: i64,
    /// Bump seed
    pub bump: u8,
}

impl AffiliateStake {
    pub const LEN: usize = 8 +  // discriminator
        32 + // affiliate_profile
        32 + // token_account
        8 +  // amount
        8 +  // unbonding_amount
        8 +  // unbonding_ends_at
        1;   // bump

    /// Unbonding period: 7 days
    pub const UNBONDING_PERIOD: i64 = 7 * 24 * 60 * 60;
}
