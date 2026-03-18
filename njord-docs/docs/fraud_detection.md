# Fraud Detection & Prevention

This document outlines Njord's incentivized fraud detection system, designed to make fraud economically irrational while rewarding honest participants.

## Design Principles

1. **Skin in the Game**: All participants stake value, creating accountability
2. **Profitable Detection**: Catching fraud is rewarded, not just a duty
3. **Decentralized Validation**: Multiple parties can challenge, not just the network
4. **Economic Deterrence**: Fraud costs more than potential gains
5. **Speed vs Security Tradeoff**: Higher trust = faster settlement

---

## Participant Stakes

### Affiliate Tiers

Affiliates build trust through staking and track record:

| Tier | Stake Required | History | Default Hold | Campaign Access |
|------|----------------|---------|--------------|-----------------|
| **New** | 0 | <30 days | 7 days | Open campaigns only |
| **Verified** | 100 NJORD | 30+ days, >10 conversions | 3 days | Standard campaigns |
| **Trusted** | 1,000 NJORD | 90+ days, >100 conversions, <1% dispute rate | 24 hours | Premium campaigns |
| **Elite** | 10,000 NJORD | 180+ days, >1000 conversions, <0.5% dispute rate | Real-time | All campaigns |

**Notes:**
- Stake amounts are governance-adjustable based on token price
- Companies can customize hold periods per campaign (override defaults)
- Companies can set minimum tier requirements for their campaigns

**Stake Slashing Schedule:**

| Offense | First | Second | Third |
|---------|-------|--------|-------|
| Unverified fraud (challenged & lost) | 10% | 25% | 100% + ban |
| Verified fraud (proven malicious) | 50% | 100% + ban | - |
| Self-referral | 25% | 50% | 100% + ban |
| Bot/fake traffic | 30% | 60% | 100% + ban |

### Bridge Operator Stakes

Bridges must maintain higher stakes and standards:

| Tier | Stake | Max Daily Volume | Fraud Tolerance |
|------|-------|------------------|-----------------|
| Bronze | 10,000 NJORD | $10,000 | <2% dispute rate |
| Silver | 50,000 NJORD | $100,000 | <1% dispute rate |
| Gold | 200,000 NJORD | $1,000,000 | <0.5% dispute rate |
| Platinum | 500,000 NJORD | Unlimited | <0.25% dispute rate |

**Strict Liability Model:** Bridges are slashed for any fraud they submit, regardless of intent. This creates strong incentive to invest in detection infrastructure. Bridges that process fraudulent attributions face:

| Fraud Submitted | Penalty |
|-----------------|---------|
| Per fraudulent attribution | 5% of attribution value (min 10 USDC) |
| Exceeds fraud tolerance | 10% stake slash + tier downgrade |
| Repeated violations | 50% slash + 30-day suspension |
| Proven collusion | 100% slash + permanent ban |

---

## Attribution Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ATTRIBUTION STATE MACHINE                              │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │    SUBMITTED     │
                    │                  │
                    │ Bridge submits   │
                    │ attribution      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   AUTO-CHECK     │
                    │                  │
                    │ Velocity, dupe,  │
                    │ pattern checks   │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌────────────┐ ┌────────────┐ ┌────────────┐
      │  REJECTED  │ │  PENDING   │ │  FLAGGED   │
      │            │ │            │ │            │
      │ Auto-fail  │ │ Normal     │ │ Suspicious │
      │ No payout  │ │ challenge  │ │ Extended   │
      └────────────┘ │ period     │ │ review     │
                     └─────┬──────┘ └─────┬──────┘
                           │              │
                           │              ▼
                           │      ┌────────────┐
                           │      │ CHALLENGED │
                           │      │            │
                           │      │ Under      │
                           │      │ dispute    │
                           │      └─────┬──────┘
                           │            │
                           │    ┌───────┴───────┐
                           │    │               │
                           │    ▼               ▼
                           │ ┌────────┐   ┌──────────┐
                           │ │FRAUD   │   │VALIDATED │
                           │ │CONFIRMED│   │          │
                           │ │        │   │ Challenge│
                           │ │Slashed │   │ rejected │
                           │ └────────┘   └────┬─────┘
                           │                   │
                           └─────────┬─────────┘
                                     │
                                     ▼
                            ┌────────────────┐
                            │    SETTLED     │
                            │                │
                            │ Commission     │
                            │ paid out       │
                            └────────────────┘
```

---

## Challenge System

### Who Can Challenge?

| Challenger | Can Challenge | Bond Required | Evidence Types |
|------------|---------------|---------------|----------------|
| **Company** | Their own campaign attributions | 5% of commission (min 5 USDC) | Transaction data, customer info |
| **Bridge** | Any attribution they processed | 10% of commission (min 10 USDC) | Pattern data, IP analysis |
| **Other Affiliate** | Same campaign attributions | 15% of commission (min 15 USDC) | Public blockchain analysis |
| **Protocol (auto)** | Any attribution | No bond | Automated detection |

**Bond Floor:** Minimum bond prevents spam challenges on micro-commissions. Floor amounts are governance-adjustable.

### Challenge Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CHALLENGE FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Initiate Challenge
─────────────────────────
Challenger calls: challenge_attribution(attribution_id, evidence_hash, bond)

• Bond locked in escrow
• Attribution status → CHALLENGED
• Settlement paused


Step 2: Evidence Submission (48 hours)
──────────────────────────────────────
Challenger uploads evidence to IPFS/Arweave
• evidence_uri submitted on-chain
• Affiliate notified, can submit counter-evidence


Step 3: Resolution (72 hours)
─────────────────────────────
Option A: Automated Resolution
  • Clear-cut cases (duplicate, self-referral)
  • Smart contract logic decides

Option B: DAO Vote
  • Complex cases
  • Staked NJORD holders vote
  • Quadratic voting to prevent plutocracy

Option C: Oracle Resolution
  • Off-chain investigation
  • Trusted resolver network
  • Multi-sig confirmation


Step 4: Outcome
───────────────
┌─────────────────┬───────────────────────────────────────────────────────┐
│ Fraud Confirmed │ • Affiliate: loses commission + stake slash           │
│                 │ • Challenger: gets bond back + 50% of commission      │
│                 │ • Company: gets 50% refunded to campaign escrow       │
├─────────────────┼───────────────────────────────────────────────────────┤
│ Challenge       │ • Affiliate: gets commission + challenger's bond      │
│ Rejected        │ • Challenger: loses bond                              │
│                 │ • Company: no change                                  │
├─────────────────┼───────────────────────────────────────────────────────┤
│ Inconclusive    │ • Affiliate: gets 50% commission                      │
│                 │ • Challenger: gets bond back (no reward)              │
│                 │ • Company: gets 50% refunded                          │
└─────────────────┴───────────────────────────────────────────────────────┘
```

---

## Automated Detection

### On-Chain Checks

Executed automatically before attribution is accepted:

```rust
pub fn validate_attribution(ctx: Context<RecordAttribution>, data: AttributionData) -> Result<ValidationResult> {
    let mut flags: Vec<FraudFlag> = vec![];

    // Check 1: Duplicate detection
    if is_duplicate_customer(&ctx, &data.customer_hash, data.campaign_id) {
        return Err(FraudError::DuplicateCustomer);
    }

    // Check 2: Self-referral
    if is_self_referral(&ctx, &data.affiliate_id, &data.customer_hash) {
        return Err(FraudError::SelfReferral);
    }

    // Check 3: Velocity (requires off-chain oracle)
    if data.velocity_score > VELOCITY_THRESHOLD {
        flags.push(FraudFlag::HighVelocity);
    }

    // Check 4: Conversion rate anomaly
    let affiliate = get_affiliate(&ctx, &data.affiliate_id)?;
    if affiliate.conversion_rate > SUSPICIOUS_CONVERSION_RATE {
        flags.push(FraudFlag::AnomalousConversion);
    }

    // Check 5: Bridge reputation
    let bridge = get_bridge(&ctx, &data.bridge_id)?;
    if bridge.reputation_score < MIN_BRIDGE_REPUTATION {
        flags.push(FraudFlag::LowReputationBridge);
    }

    Ok(ValidationResult {
        approved: flags.is_empty(),
        flags,
        recommended_hold_period: calculate_hold_period(&flags, &affiliate),
    })
}
```

### Off-Chain Analysis (Bridge Responsibility)

Bridges run detection before submitting:

| Check | Implementation | Action |
|-------|----------------|--------|
| IP Geolocation | MaxMind/IPInfo | Flag if mismatch |
| Device Fingerprint | FingerprintJS | Track unique devices |
| Bot Detection | Cloudflare/Datadome | Reject if bot score high |
| Email Validity | Mailcheck API | Reject disposable emails |
| Phone Verification | Twilio Lookup | Verify phone country |
| Behavioral Analysis | Custom ML model | Score based on user behavior |

### Fraud Scoring Model

Each attribution receives a fraud score:

```
fraud_score =
    w1 * velocity_score +
    w2 * pattern_match_score +
    w3 * affiliate_history_score +
    w4 * bridge_reputation_score +
    w5 * behavioral_score

where:
    0 ≤ fraud_score ≤ 100

    fraud_score < 20  → Auto-approve (fast settlement)
    fraud_score 20-50 → Standard hold period
    fraud_score 50-80 → Extended hold + manual review
    fraud_score > 80  → Auto-reject or require additional verification
```

---

## Incentive Economics

### For Honest Affiliates

| Behavior | Reward |
|----------|--------|
| 0 disputes in 30 days | Tier upgrade eligibility |
| 100+ successful conversions | Reduced hold period |
| High-value consistent performance | Premium campaign access |
| Reporting other fraudsters | Bounty (10% of recovered) |

### For Bridge Operators

| Behavior | Reward |
|----------|--------|
| <0.5% fraud rate (monthly) | 10% bonus on fees |
| Catching fraud before submission | Reputation boost |
| Operating detection infrastructure | Staking reward multiplier |
| Reporting systemic patterns | Protocol bounty |

### For Companies

| Behavior | Benefit |
|----------|---------|
| Quick challenge response | Faster refunds |
| Providing transaction data | Better fraud detection |
| False challenge penalty | Bond forfeit |

### Bounty Pool

Protocol maintains a fraud bounty pool:

```
┌─────────────────────────────────────────────────────────────────┐
│                     BOUNTY POOL MECHANICS                       │
└─────────────────────────────────────────────────────────────────┘

Sources:
├── 5% of slashed affiliate stakes
├── 5% of slashed bridge stakes
├── 10% of forfeited challenge bonds
└── Treasury allocation (governance decided)

Uses:
├── Challenger rewards (50% of commission)
├── Bridge detection bonuses
├── Whistleblower rewards
└── Security researcher bounties
```

---

## Common Fraud Scenarios & Responses

### Scenario 1: Cookie Stuffing

**Attack:** Affiliate places hidden iframes to drop cookies on users who never intended to click.

**Detection:**
- Low click-to-conversion time (< 1 second)
- High volume, low engagement pattern
- IP/session mismatch

**Response:**
- Auto-flag by bridge
- Challenge by company (they see low intent signals)
- Slash affiliate stake

### Scenario 2: Fake Signups / Leads

**Attack:** Affiliate creates fake accounts to earn per-signup commissions.

**Detection:**
- Email domain analysis (disposable emails)
- Phone verification failure
- No subsequent engagement (for digital products: no login, no usage)

**Response:**
- Require verified email/phone for signup campaigns
- Pay on activation/usage, not just signup
- Pattern detection across affiliates

### Scenario 3: Bot Traffic

**Attack:** Affiliate uses bots to generate fake clicks or signups.

**Detection:**
- Device fingerprint anomalies
- Behavioral analysis (inhuman patterns)
- IP clustering / data center detection

**Response:**
- Bridge rejects submission
- If submitted: both affiliate and bridge slashed
- Reputation destroyed

### Scenario 4: Collusion (Affiliate + Bridge)

**Attack:** Bridge operator and affiliate collude to submit fake attributions.

**Detection:**
- Cross-bridge comparison (same affiliate, different bridge behavior)
- Unusual volume spike
- Company doesn't recognize transactions

**Response:**
- Company challenges with transaction records
- Both affiliate and bridge slashed (strict liability)
- Bridge permanently banned

---

## Dispute Resolution DAO

For complex cases requiring human judgment:

### Resolver Selection

```
Eligibility:
├── Stake ≥ 5,000 NJORD
├── Account age ≥ 90 days
├── No slashing history
└── Pass resolver quiz

Selection:
├── Random selection from eligible pool
├── 5 resolvers per dispute
├── Weighted by stake (capped to prevent plutocracy)
└── Must not have relationship with parties
```

### Voting Mechanism

| Vote Weight | Stake Range |
|-------------|-------------|
| 1 | 5,000 - 10,000 NJORD |
| 2 | 10,000 - 50,000 NJORD |
| 3 | 50,000 - 100,000 NJORD |
| 4 (max) | 100,000+ NJORD |

**Decision Threshold:** 3/5 agreement required

### Resolver Incentives

| Outcome | Reward |
|---------|--------|
| Voted with majority | 10 USDC + reputation boost |
| Voted against majority | No reward, no penalty |
| Abstained | Small penalty (-reputation) |
| Evidence of bribery | Slashed + banned |

---

## Metrics & Reporting

### Protocol-Level Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Overall fraud rate | <1% | >2% |
| Challenge success rate | 20-40% | >60% (too many false positives) |
| Average resolution time | <72 hours | >120 hours |
| Slashing events/month | <0.1% of affiliates | >0.5% |

### Bridge-Level Metrics

| Metric | Bronze Min | Gold Min |
|--------|------------|----------|
| Fraud rate | <2% | <0.5% |
| Rejection rate | <10% | <5% |
| Response time to challenges | <24 hours | <6 hours |
| Uptime | 95% | 99.5% |

### Affiliate-Level Metrics (Visible to Companies)

| Metric | Shown |
|--------|-------|
| Tier | Yes |
| Dispute rate | Yes |
| Historical conversion rate | Yes |
| Average order value | Yes |
| Tenure | Yes |
| Stake amount | Yes |

---

## Implementation Phases

### Phase 1: Basic Detection
- Duplicate detection (on-chain)
- Self-referral detection (on-chain)
- Manual company challenges
- Simple hold periods

### Phase 2: Automated Scoring
- Fraud score calculation
- Dynamic hold periods
- Bridge-level detection requirements
- Challenge escrow system

### Phase 3: DAO Resolution
- Resolver selection mechanism
- Voting system
- Bounty pool
- Advanced analytics

### Phase 4: ML Enhancement
- Behavioral analysis models
- Cross-campaign pattern detection
- Predictive fraud scoring
- Real-time risk assessment
