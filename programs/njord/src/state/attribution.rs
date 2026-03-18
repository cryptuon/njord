use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum AttributionStatus {
    #[default]
    Pending,
    Challenged,
    Settled,
    Rejected,
    Refunded,
}

/// Attribution event account
#[account]
pub struct Attribution {
    /// Campaign reference
    pub campaign: Pubkey,
    /// Affiliate registration reference
    pub affiliate_registration: Pubkey,
    /// Bridge that submitted (if any)
    pub bridge: Pubkey,
    /// Action value (e.g., purchase amount in USDC smallest unit)
    pub action_value: u64,
    /// Calculated commission amount
    pub commission_amount: u64,
    /// Protocol fee amount
    pub protocol_fee: u64,
    /// Bridge fee amount
    pub bridge_fee: u64,
    /// Net commission to affiliate
    pub net_commission: u64,
    /// Customer hash (privacy-preserving identifier)
    pub customer_hash: [u8; 32],
    /// Attribution status
    pub status: AttributionStatus,
    /// Fraud score (0-100, set by bridge)
    pub fraud_score: u8,
    /// Created timestamp
    pub created_at: i64,
    /// Settlement timestamp (when hold period ends)
    pub settles_at: i64,
    /// Actual settlement timestamp
    pub settled_at: i64,
    /// Unique nonce to prevent duplicates
    pub nonce: [u8; 16],
    /// Attribution ID (sequential per campaign)
    pub attribution_id: u64,
    /// Bump seed
    pub bump: u8,
}

impl Attribution {
    pub const LEN: usize = 8 +  // discriminator
        32 + // campaign
        32 + // affiliate_registration
        32 + // bridge
        8 +  // action_value
        8 +  // commission_amount
        8 +  // protocol_fee
        8 +  // bridge_fee
        8 +  // net_commission
        32 + // customer_hash
        1 +  // status
        1 +  // fraud_score
        8 +  // created_at
        8 +  // settles_at
        8 +  // settled_at
        16 + // nonce
        8 +  // attribution_id
        1;   // bump

    /// Check if attribution can be settled
    pub fn can_settle(&self, current_time: i64) -> bool {
        self.status == AttributionStatus::Pending && current_time >= self.settles_at
    }

    /// Check if attribution can be challenged
    pub fn can_challenge(&self, current_time: i64) -> bool {
        self.status == AttributionStatus::Pending && current_time < self.settles_at
    }
}

/// Tracks customer attributions to prevent duplicates
#[account]
pub struct CustomerAttribution {
    /// Campaign reference
    pub campaign: Pubkey,
    /// Customer hash
    pub customer_hash: [u8; 32],
    /// First attribution for this customer
    pub first_attribution: Pubkey,
    /// Last attribution for this customer
    pub last_attribution: Pubkey,
    /// Total attributions count
    pub attribution_count: u32,
    /// Created timestamp
    pub created_at: i64,
    /// Bump seed
    pub bump: u8,
}

impl CustomerAttribution {
    pub const LEN: usize = 8 +  // discriminator
        32 + // campaign
        32 + // customer_hash
        32 + // first_attribution
        32 + // last_attribution
        4 +  // attribution_count
        8 +  // created_at
        1;   // bump
}
