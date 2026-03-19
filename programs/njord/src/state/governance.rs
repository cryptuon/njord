use anchor_lang::prelude::*;

/// Governance configuration account
#[account]
pub struct GovernanceConfig {
    /// Authority that can update governance parameters (initially deployer, then DAO)
    pub authority: Pubkey,
    /// NJORD token mint for voting
    pub njord_mint: Pubkey,
    /// Minimum tokens required to create a proposal
    pub proposal_threshold: u64,
    /// Minimum quorum percentage (basis points, e.g., 400 = 4%)
    pub quorum_bps: u16,
    /// Voting period in seconds
    pub voting_period: i64,
    /// Timelock delay for execution (seconds)
    pub timelock_delay: i64,
    /// Total proposals created
    pub proposal_count: u64,
    /// Bump seed
    pub bump: u8,
}

impl GovernanceConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // njord_mint
        8 +  // proposal_threshold
        2 +  // quorum_bps
        8 +  // voting_period
        8 +  // timelock_delay
        8 +  // proposal_count
        1;   // bump
}

/// Governance proposal
#[account]
pub struct Proposal {
    /// Unique proposal ID
    pub id: u64,
    /// Proposer address
    pub proposer: Pubkey,
    /// Title (max 64 chars)
    pub title: String,
    /// Description hash (IPFS CID or similar)
    pub description_hash: String,
    /// Proposal type
    pub proposal_type: ProposalType,
    /// Proposal data (encoded instruction or parameter change)
    pub proposal_data: Vec<u8>,
    /// Current status
    pub status: ProposalStatus,
    /// For votes (token-weighted)
    pub for_votes: u64,
    /// Against votes
    pub against_votes: u64,
    /// Abstain votes
    pub abstain_votes: u64,
    /// Voting start time
    pub start_time: i64,
    /// Voting end time
    pub end_time: i64,
    /// Execution time (after timelock)
    pub execution_time: Option<i64>,
    /// Executed flag
    pub executed: bool,
    /// Canceled flag
    pub canceled: bool,
    /// Created timestamp
    pub created_at: i64,
    /// Bump seed
    pub bump: u8,
}

impl Proposal {
    pub const LEN: usize = 8 + // discriminator
        8 +   // id
        32 +  // proposer
        68 +  // title (4 + 64)
        68 +  // description_hash (4 + 64)
        1 +   // proposal_type
        132 + // proposal_data (4 + 128)
        1 +   // status
        8 +   // for_votes
        8 +   // against_votes
        8 +   // abstain_votes
        8 +   // start_time
        8 +   // end_time
        9 +   // execution_time (Option<i64>)
        1 +   // executed
        1 +   // canceled
        8 +   // created_at
        1;    // bump
}

/// Types of governance proposals
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ProposalType {
    /// Change protocol parameters
    ParameterChange,
    /// Update fee structure
    FeeUpdate,
    /// Treasury spending
    TreasurySpend,
    /// Emergency action
    Emergency,
    /// General governance
    General,
}

/// Proposal status
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ProposalStatus {
    /// Proposal is pending (voting not started)
    Pending,
    /// Voting is active
    Active,
    /// Voting succeeded, pending timelock
    Succeeded,
    /// Voting failed (didn't reach quorum or majority against)
    Defeated,
    /// Queued for execution
    Queued,
    /// Successfully executed
    Executed,
    /// Canceled by proposer or authority
    Canceled,
    /// Expired (timelock passed without execution)
    Expired,
}

/// Individual vote record
#[account]
pub struct VoteRecord {
    /// Voter address
    pub voter: Pubkey,
    /// Proposal ID
    pub proposal_id: u64,
    /// Vote choice
    pub vote: VoteChoice,
    /// Voting power used
    pub voting_power: u64,
    /// Vote timestamp
    pub voted_at: i64,
    /// Bump seed
    pub bump: u8,
}

impl VoteRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // voter
        8 +  // proposal_id
        1 +  // vote
        8 +  // voting_power
        8 +  // voted_at
        1;   // bump
}

/// Vote choices
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum VoteChoice {
    For,
    Against,
    Abstain,
}

/// Token lock for voting power
#[account]
pub struct VotingEscrow {
    /// Owner of the locked tokens
    pub owner: Pubkey,
    /// Amount of NJORD tokens locked
    pub locked_amount: u64,
    /// Lock end time (voting power decays toward unlock)
    pub lock_end: i64,
    /// Last time voting power was calculated
    pub last_update: i64,
    /// Bump seed
    pub bump: u8,
}

impl VotingEscrow {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        8 +  // locked_amount
        8 +  // lock_end
        8 +  // last_update
        1;   // bump

    /// Calculate voting power based on lock duration
    /// ve-style: voting_power = locked_amount * (time_remaining / max_lock_time)
    pub fn calculate_voting_power(&self, current_time: i64, max_lock_time: i64) -> u64 {
        if current_time >= self.lock_end {
            return 0;
        }

        let time_remaining = self.lock_end - current_time;
        let max_lock = max_lock_time.max(1);

        // Calculate voting power with decay
        let power = (self.locked_amount as u128)
            .checked_mul(time_remaining as u128)
            .unwrap_or(0)
            .checked_div(max_lock as u128)
            .unwrap_or(0);

        power.min(u64::MAX as u128) as u64
    }
}

/// Protocol parameters that can be changed via governance
#[account]
pub struct ProtocolParameters {
    /// Authority (governance contract)
    pub authority: Pubkey,
    /// Minimum stake for Bronze bridge tier
    pub bronze_min_stake: u64,
    /// Minimum stake for Silver bridge tier
    pub silver_min_stake: u64,
    /// Minimum stake for Gold bridge tier
    pub gold_min_stake: u64,
    /// Minimum stake for Platinum bridge tier
    pub platinum_min_stake: u64,
    /// Protocol fee in basis points
    pub protocol_fee_bps: u16,
    /// Minimum challenge bond floor (in USDC smallest units)
    pub min_challenge_bond: u64,
    /// Maximum fraud score before auto-rejection
    pub max_fraud_score: u8,
    /// Default hold period for attributions (seconds)
    pub default_hold_period: i64,
    /// Maximum lock time for voting escrow (seconds)
    pub max_lock_time: i64,
    /// Last updated timestamp
    pub updated_at: i64,
    /// Bump seed
    pub bump: u8,
}

impl ProtocolParameters {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 +  // bronze_min_stake
        8 +  // silver_min_stake
        8 +  // gold_min_stake
        8 +  // platinum_min_stake
        2 +  // protocol_fee_bps
        8 +  // min_challenge_bond
        1 +  // max_fraud_score
        8 +  // default_hold_period
        8 +  // max_lock_time
        8 +  // updated_at
        1;   // bump

    /// Default values
    pub fn default_values() -> ProtocolParametersDefaults {
        ProtocolParametersDefaults {
            bronze_min_stake: 1_000_000_000,      // 1,000 NJORD
            silver_min_stake: 10_000_000_000,     // 10,000 NJORD
            gold_min_stake: 50_000_000_000,       // 50,000 NJORD
            platinum_min_stake: 100_000_000_000,  // 100,000 NJORD
            protocol_fee_bps: 100,                // 1%
            min_challenge_bond: 5_000_000,        // $5 (in USDC with 6 decimals)
            max_fraud_score: 80,
            default_hold_period: 7 * 24 * 60 * 60, // 7 days
            max_lock_time: 4 * 365 * 24 * 60 * 60, // 4 years
        }
    }
}

pub struct ProtocolParametersDefaults {
    pub bronze_min_stake: u64,
    pub silver_min_stake: u64,
    pub gold_min_stake: u64,
    pub platinum_min_stake: u64,
    pub protocol_fee_bps: u16,
    pub min_challenge_bond: u64,
    pub max_fraud_score: u8,
    pub default_hold_period: i64,
    pub max_lock_time: i64,
}
