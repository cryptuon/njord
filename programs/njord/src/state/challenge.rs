use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum ChallengeStatus {
    #[default]
    Pending,
    EvidenceSubmitted,
    Resolved,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum ChallengeOutcome {
    #[default]
    Pending,
    FraudConfirmed,
    ChallengeRejected,
    Inconclusive,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum ChallengerType {
    #[default]
    Company,
    Bridge,
    Affiliate,
    Protocol,
}

impl ChallengerType {
    /// Minimum bond percentage in basis points
    pub fn min_bond_percentage_bps(&self) -> u16 {
        match self {
            ChallengerType::Company => 500,    // 5%
            ChallengerType::Bridge => 1000,    // 10%
            ChallengerType::Affiliate => 1500, // 15%
            ChallengerType::Protocol => 0,     // No bond required
        }
    }

    /// Minimum bond floor in USDC (smallest unit)
    pub fn min_bond_floor(&self) -> u64 {
        match self {
            ChallengerType::Company => 5 * 1_000_000,    // 5 USDC
            ChallengerType::Bridge => 10 * 1_000_000,    // 10 USDC
            ChallengerType::Affiliate => 15 * 1_000_000, // 15 USDC
            ChallengerType::Protocol => 0,
        }
    }
}

/// Challenge account
#[account]
pub struct Challenge {
    /// Attribution being challenged
    pub attribution: Pubkey,
    /// Challenger wallet
    pub challenger: Pubkey,
    /// Challenger type
    pub challenger_type: ChallengerType,
    /// Bond amount deposited
    pub bond_amount: u64,
    /// Challenge status
    pub status: ChallengeStatus,
    /// Outcome (set when resolved)
    pub outcome: ChallengeOutcome,
    /// Evidence URI (IPFS/Arweave)
    pub evidence_uri: String,
    /// Counter-evidence URI
    pub counter_evidence_uri: String,
    /// Created timestamp
    pub created_at: i64,
    /// Evidence deadline
    pub evidence_deadline: i64,
    /// Resolution deadline
    pub resolution_deadline: i64,
    /// Resolved timestamp
    pub resolved_at: i64,
    /// Resolver (if DAO/oracle resolved)
    pub resolver: Pubkey,
    /// Bump seed
    pub bump: u8,
}

impl Challenge {
    pub const MAX_EVIDENCE_URI_LEN: usize = 200;
    pub const EVIDENCE_PERIOD: i64 = 48 * 60 * 60;    // 48 hours
    pub const RESOLUTION_PERIOD: i64 = 72 * 60 * 60;  // 72 hours

    pub const LEN: usize = 8 +  // discriminator
        32 + // attribution
        32 + // challenger
        1 +  // challenger_type
        8 +  // bond_amount
        1 +  // status
        1 +  // outcome
        4 + Self::MAX_EVIDENCE_URI_LEN + // evidence_uri
        4 + Self::MAX_EVIDENCE_URI_LEN + // counter_evidence_uri
        8 +  // created_at
        8 +  // evidence_deadline
        8 +  // resolution_deadline
        8 +  // resolved_at
        32 + // resolver
        1;   // bump

    /// Calculate minimum bond for a commission amount
    pub fn calculate_min_bond(challenger_type: &ChallengerType, commission_amount: u64) -> u64 {
        let percentage_bond = commission_amount
            .checked_mul(challenger_type.min_bond_percentage_bps() as u64)
            .unwrap_or(0)
            / 10_000;

        std::cmp::max(percentage_bond, challenger_type.min_bond_floor())
    }

    /// Check if evidence can still be submitted
    pub fn can_submit_evidence(&self, current_time: i64) -> bool {
        self.status == ChallengeStatus::Pending && current_time < self.evidence_deadline
    }

    /// Check if challenge can be resolved
    pub fn can_resolve(&self, current_time: i64) -> bool {
        (self.status == ChallengeStatus::Pending || self.status == ChallengeStatus::EvidenceSubmitted)
            && current_time >= self.evidence_deadline
            && current_time < self.resolution_deadline
    }

    /// Check if challenge has expired
    pub fn is_expired(&self, current_time: i64) -> bool {
        self.status != ChallengeStatus::Resolved && current_time >= self.resolution_deadline
    }
}

/// Tracks global challenge statistics for fraud detection
#[account]
pub struct ChallengeStats {
    /// Total challenges created
    pub total_challenges: u64,
    /// Challenges confirmed as fraud
    pub fraud_confirmed: u64,
    /// Challenges rejected
    pub challenges_rejected: u64,
    /// Inconclusive outcomes
    pub inconclusive: u64,
    /// Total bonds collected
    pub total_bonds_collected: u64,
    /// Total bonds refunded
    pub total_bonds_refunded: u64,
    /// Total commissions recovered
    pub total_commissions_recovered: u64,
    /// Bump seed
    pub bump: u8,
}

impl ChallengeStats {
    pub const LEN: usize = 8 +  // discriminator
        8 +  // total_challenges
        8 +  // fraud_confirmed
        8 +  // challenges_rejected
        8 +  // inconclusive
        8 +  // total_bonds_collected
        8 +  // total_bonds_refunded
        8 +  // total_commissions_recovered
        1;   // bump
}
