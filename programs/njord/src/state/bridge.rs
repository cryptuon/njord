use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default, Debug)]
pub enum BridgeStatus {
    #[default]
    Active,
    Inactive,
    Suspended,
    Unbonding,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default, PartialOrd, Ord, Debug)]
pub enum BridgeTier {
    #[default]
    Bronze,
    Silver,
    Gold,
    Platinum,
}

impl BridgeTier {
    /// Minimum stake required for each tier
    pub fn min_stake(&self) -> u64 {
        match self {
            BridgeTier::Bronze => 10_000 * 1_000_000_000,    // 10,000 NJORD
            BridgeTier::Silver => 50_000 * 1_000_000_000,    // 50,000 NJORD
            BridgeTier::Gold => 200_000 * 1_000_000_000,     // 200,000 NJORD
            BridgeTier::Platinum => 500_000 * 1_000_000_000, // 500,000 NJORD
        }
    }

    /// Daily volume limit in USDC (smallest unit)
    pub fn daily_volume_limit(&self) -> u64 {
        match self {
            BridgeTier::Bronze => 10_000 * 1_000_000,     // $10,000
            BridgeTier::Silver => 100_000 * 1_000_000,    // $100,000
            BridgeTier::Gold => 1_000_000 * 1_000_000,    // $1,000,000
            BridgeTier::Platinum => u64::MAX,              // Unlimited
        }
    }

    /// Maximum fraud tolerance in basis points
    pub fn fraud_tolerance_bps(&self) -> u16 {
        match self {
            BridgeTier::Bronze => 200,   // 2%
            BridgeTier::Silver => 100,   // 1%
            BridgeTier::Gold => 50,      // 0.5%
            BridgeTier::Platinum => 25,  // 0.25%
        }
    }

    /// Bridge fee in basis points
    pub fn fee_bps(&self) -> u16 {
        100 // 1% for all tiers
    }
}

/// Bridge operator account
#[account]
pub struct Bridge {
    /// Bridge operator wallet
    pub operator: Pubkey,
    /// NJORD stake account
    pub stake_account: Pubkey,
    /// Amount staked
    pub staked_amount: u64,
    /// Current tier
    pub tier: BridgeTier,
    /// Status
    pub status: BridgeStatus,
    /// Region code (e.g., "US", "IN", "BR")
    pub region: [u8; 4],
    /// Total attributions processed
    pub total_attributions: u64,
    /// Total volume processed (USDC smallest unit)
    pub total_volume: u64,
    /// Today's volume (resets daily)
    pub daily_volume: u64,
    /// Last volume reset timestamp
    pub daily_volume_reset_at: i64,
    /// Fraud rate in basis points
    pub fraud_rate_bps: u16,
    /// Fraud count (attributions challenged and confirmed as fraud)
    pub fraud_count: u32,
    /// Reputation score (0-10000)
    pub reputation_score: u16,
    /// Total fees earned
    pub total_fees_earned: u64,
    /// Slashing count
    pub slashing_count: u32,
    /// Last slashing timestamp
    pub last_slashed_at: i64,
    /// Unbonding amount
    pub unbonding_amount: u64,
    /// Unbonding end timestamp
    pub unbonding_ends_at: i64,
    /// Registration timestamp
    pub registered_at: i64,
    /// Last active timestamp
    pub last_active_at: i64,
    /// Metadata URI
    pub metadata_uri: String,
    /// Bump seed
    pub bump: u8,
}

impl Bridge {
    pub const MAX_METADATA_URI_LEN: usize = 200;
    pub const UNBONDING_PERIOD: i64 = 7 * 24 * 60 * 60; // 7 days

    pub const LEN: usize = 8 +  // discriminator
        32 + // operator
        32 + // stake_account
        8 +  // staked_amount
        1 +  // tier
        1 +  // status
        4 +  // region
        8 +  // total_attributions
        8 +  // total_volume
        8 +  // daily_volume
        8 +  // daily_volume_reset_at
        2 +  // fraud_rate_bps
        4 +  // fraud_count
        2 +  // reputation_score
        8 +  // total_fees_earned
        4 +  // slashing_count
        8 +  // last_slashed_at
        8 +  // unbonding_amount
        8 +  // unbonding_ends_at
        8 +  // registered_at
        8 +  // last_active_at
        4 + Self::MAX_METADATA_URI_LEN + // metadata_uri
        1;   // bump

    /// Calculate tier based on stake
    pub fn calculate_tier(&self) -> BridgeTier {
        if self.staked_amount >= BridgeTier::Platinum.min_stake() {
            BridgeTier::Platinum
        } else if self.staked_amount >= BridgeTier::Gold.min_stake() {
            BridgeTier::Gold
        } else if self.staked_amount >= BridgeTier::Silver.min_stake() {
            BridgeTier::Silver
        } else {
            BridgeTier::Bronze
        }
    }

    /// Check if bridge can process volume
    pub fn can_process_volume(&self, amount: u64, current_time: i64) -> bool {
        if self.status != BridgeStatus::Active {
            return false;
        }

        // Reset daily volume if new day
        let daily_volume = if current_time - self.daily_volume_reset_at >= 24 * 60 * 60 {
            0
        } else {
            self.daily_volume
        };

        daily_volume.checked_add(amount).map_or(false, |new_volume| {
            new_volume <= self.tier.daily_volume_limit()
        })
    }

    /// Check if fraud tolerance is exceeded
    pub fn is_fraud_tolerance_exceeded(&self) -> bool {
        self.fraud_rate_bps > self.tier.fraud_tolerance_bps()
    }

    /// Calculate slash amount for fraud
    pub fn calculate_slash_amount(&self, fraud_value: u64) -> u64 {
        // 5% of fraud value, minimum 10 USDC equivalent
        let slash = fraud_value.checked_mul(500).unwrap_or(0) / 10_000;
        std::cmp::max(slash, 10 * 1_000_000) // 10 USDC minimum
    }
}

/// Bridge stake account
#[account]
pub struct BridgeStake {
    /// Bridge account
    pub bridge: Pubkey,
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

impl BridgeStake {
    pub const LEN: usize = 8 +  // discriminator
        32 + // bridge
        32 + // token_account
        8 +  // amount
        8 +  // unbonding_amount
        8 +  // unbonding_ends_at
        1;   // bump
}
