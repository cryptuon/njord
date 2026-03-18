use anchor_lang::prelude::*;

#[error_code]
pub enum NjordError {
    // Campaign errors
    #[msg("Campaign is not active")]
    CampaignNotActive,
    #[msg("Campaign has ended")]
    CampaignEnded,
    #[msg("Campaign has not started yet")]
    CampaignNotStarted,
    #[msg("Insufficient campaign budget")]
    InsufficientBudget,
    #[msg("Maximum affiliates reached for this campaign")]
    MaxAffiliatesReached,
    #[msg("Invalid commission rate")]
    InvalidCommissionRate,
    #[msg("Invalid hold period")]
    InvalidHoldPeriod,

    // Affiliate errors
    #[msg("Affiliate not registered for this campaign")]
    AffiliateNotRegistered,
    #[msg("Affiliate already registered for this campaign")]
    AffiliateAlreadyRegistered,
    #[msg("Affiliate tier too low for this campaign")]
    AffiliateTierTooLow,
    #[msg("Affiliate is suspended")]
    AffiliateSuspended,
    #[msg("Insufficient affiliate stake")]
    InsufficientAffiliateStake,

    // Attribution errors
    #[msg("Duplicate attribution detected")]
    DuplicateAttribution,
    #[msg("Self-referral detected")]
    SelfReferral,
    #[msg("Attribution already settled")]
    AttributionAlreadySettled,
    #[msg("Attribution is under challenge")]
    AttributionUnderChallenge,
    #[msg("Hold period not elapsed")]
    HoldPeriodNotElapsed,
    #[msg("Invalid attribution proof")]
    InvalidAttributionProof,

    // Bridge errors
    #[msg("Bridge not registered")]
    BridgeNotRegistered,
    #[msg("Bridge is not active")]
    BridgeNotActive,
    #[msg("Insufficient bridge stake")]
    InsufficientBridgeStake,
    #[msg("Bridge stake is locked")]
    BridgeStakeLocked,
    #[msg("Bridge daily volume limit exceeded")]
    BridgeVolumeLimitExceeded,
    #[msg("Bridge fraud tolerance exceeded")]
    BridgeFraudToleranceExceeded,

    // Challenge errors
    #[msg("Challenge period has ended")]
    ChallengePeriodEnded,
    #[msg("Challenge already exists")]
    ChallengeAlreadyExists,
    #[msg("Insufficient challenge bond")]
    InsufficientChallengeBond,
    #[msg("Challenge not found")]
    ChallengeNotFound,
    #[msg("Not authorized to resolve challenge")]
    UnauthorizedChallengeResolution,

    // General errors
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Invalid timestamp")]
    InvalidTimestamp,
}
