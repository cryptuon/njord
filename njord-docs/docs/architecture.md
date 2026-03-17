# Architecture

This document describes the technical architecture of the Njord Protocol, including on-chain programs, off-chain components, and the bridge operator infrastructure.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NJORD ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────────────┐
                          │      FRONTEND APPS      │
                          │  ┌───────┐ ┌─────────┐  │
                          │  │Company│ │Affiliate│  │
                          │  │  App  │ │   App   │  │
                          │  └───────┘ └─────────┘  │
                          └───────────┬─────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BRIDGE LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Bridge A   │  │  Bridge B   │  │  Bridge C   │  │  Bridge N   │        │
│  │   (Stripe)  │  │ (Razorpay)  │  │   (PIX)     │  │    (...)    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │               │
│         └────────────────┴────────────────┴────────────────┘               │
│                                   │                                         │
│                          Njord Bridge SDK                                   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SOLANA BLOCKCHAIN                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        NJORD PROGRAM                                  │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────┐ │  │
│  │  │  Campaign  │ │ Affiliate  │ │Attribution │ │      Escrow        │ │  │
│  │  │  Registry  │ │  Registry  │ │   Engine   │ │     Manager        │ │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      BRIDGE REGISTRY PROGRAM                          │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────┐ │  │
│  │  │   Stake    │ │   Bridge   │ │ Reputation │ │      Slashing      │ │  │
│  │  │   Vault    │ │  Registry  │ │   Scoring  │ │      Handler       │ │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        TOKEN PROGRAM (NJORD)                          │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                        │  │
│  │  │   Mint     │ │  Staking   │ │ Governance │                        │  │
│  │  │  Control   │ │   Rewards  │ │   Voting   │                        │  │
│  │  └────────────┘ └────────────┘ └────────────┘                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## On-Chain Components

### 1. Njord Program (Core Protocol)

The main Solana program handling campaigns, affiliates, and attributions.

#### Campaign Registry

Manages campaign lifecycle and configuration.

**Account Structure:**
```rust
#[account]
pub struct Campaign {
    pub id: Pubkey,                    // Unique campaign ID
    pub company: Pubkey,               // Company wallet
    pub escrow: Pubkey,                // Escrow PDA
    pub budget: u64,                   // Total budget in lamports/tokens
    pub spent: u64,                    // Amount paid out
    pub commission_type: CommissionType,
    pub commission_rate: u16,          // Basis points (10000 = 100%)
    pub attribution_model: AttributionModel,
    pub target_action: ActionType,
    pub status: CampaignStatus,
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub max_affiliates: Option<u32>,
    pub affiliate_count: u32,
    pub metadata_uri: String,          // IPFS/Arweave URI
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum CommissionType {
    Percentage,    // % of sale value
    Flat,          // Fixed amount per action
    Tiered,        // Multiple tiers based on volume
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum AttributionModel {
    LastClick,     // Credit last affiliate
    FirstClick,    // Credit first affiliate
    MultiTouch,    // Split credit (future)
}
```

**Instructions:**
- `create_campaign` - Initialize new campaign
- `fund_campaign` - Add funds to escrow
- `pause_campaign` - Temporarily halt
- `resume_campaign` - Restart paused campaign
- `close_campaign` - End and refund remaining

#### Affiliate Registry

Tracks affiliate participation across campaigns.

**Account Structure:**
```rust
#[account]
pub struct AffiliateRegistration {
    pub affiliate: Pubkey,             // Affiliate wallet
    pub campaign: Pubkey,              // Campaign reference
    pub affiliate_id: String,          // Unique tracking ID
    pub status: AffiliateStatus,
    pub total_attributions: u64,
    pub total_earned: u64,
    pub joined_at: i64,
    pub bump: u8,
}

#[account]
pub struct AffiliateProfile {
    pub wallet: Pubkey,
    pub display_name: String,
    pub metadata_uri: Option<String>,
    pub total_campaigns: u32,
    pub total_earnings: u64,
    pub reputation_score: u32,
    pub created_at: i64,
    pub bump: u8,
}
```

**Instructions:**
- `join_campaign` - Register for a campaign
- `leave_campaign` - Withdraw from campaign
- `update_profile` - Modify affiliate metadata

#### Attribution Engine

Records and validates conversion events.

**Account Structure:**
```rust
#[account]
pub struct Attribution {
    pub id: Pubkey,
    pub campaign: Pubkey,
    pub affiliate: Pubkey,
    pub bridge: Option<Pubkey>,        // Bridge that submitted
    pub action_type: ActionType,
    pub action_value: u64,             // Value in smallest unit
    pub commission_amount: u64,
    pub customer_hash: [u8; 32],       // Privacy-preserving ID
    pub status: AttributionStatus,
    pub timestamp: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ActionType {
    Purchase,
    Signup,
    PageView,
    AppInstall,
    Custom(String),
}
```

**Instructions:**
- `record_attribution` - Submit conversion event
- `dispute_attribution` - Challenge (future)
- `resolve_dispute` - Resolution (future)

#### Escrow Manager

Handles fund custody and distribution.

**Account Structure:**
```rust
#[account]
pub struct Escrow {
    pub campaign: Pubkey,
    pub token_mint: Pubkey,            // USDC, SOL, etc.
    pub balance: u64,
    pub locked: u64,                   // Reserved for pending
    pub bump: u8,
}
```

**Instructions:**
- `deposit` - Add funds
- `withdraw` - Company withdrawal (remaining)
- `payout` - Affiliate commission (internal)

---

### 2. Bridge Registry Program

Manages bridge operator registration, staking, and reputation.

**Account Structure:**
```rust
#[account]
pub struct BridgeOperator {
    pub wallet: Pubkey,
    pub stake_account: Pubkey,
    pub staked_amount: u64,
    pub status: BridgeStatus,
    pub region: String,
    pub supported_methods: Vec<String>,
    pub metadata_uri: String,
    pub reputation_score: u32,         // 0-10000
    pub total_processed: u64,
    pub total_volume: u64,
    pub slashing_events: u32,
    pub registered_at: i64,
    pub last_active: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum BridgeStatus {
    Active,
    Inactive,
    Slashed,
    Unbonding,
}
```

**Instructions:**
- `register_bridge` - Register new operator
- `stake` - Add stake
- `unstake` - Begin unbonding
- `slash` - Penalize misbehavior
- `update_metadata` - Modify bridge info

---

### 3. Token Program (NJORD)

SPL token with additional staking and governance features.

**Features:**
- Standard SPL token operations
- Staking rewards distribution
- Governance voting weight
- Fee collection and distribution

---

## Off-Chain Components

### Bridge Operator SDK

Reference implementation for running a bridge.

```
┌─────────────────────────────────────────────────────────────────┐
│                     BRIDGE OPERATOR NODE                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Gateway                           │   │
│  │  • REST endpoints for company/affiliate dashboards       │   │
│  │  • Webhook receivers for payment providers               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌───────────────────────────┼───────────────────────────────┐ │
│  │                           ▼                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │ │
│  │  │   Payment   │  │ Attribution │  │   Solana    │       │ │
│  │  │  Processor  │  │   Handler   │  │   Client    │       │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │ │
│  │         │                │                │               │ │
│  │         ▼                ▼                ▼               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │ │
│  │  │   Stripe/   │  │    Event    │  │    RPC      │       │ │
│  │  │  Razorpay   │  │    Queue    │  │   Provider  │       │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────┼───────────────────────────────┐ │
│  │                    Database Layer                         │ │
│  │  • Transaction history   • Customer mappings              │ │
│  │  • Attribution cache     • Settlement records             │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Core Modules:**

```typescript
// Payment Processor
interface PaymentProcessor {
  processPayment(payment: PaymentRequest): Promise<PaymentResult>;
  handleWebhook(event: WebhookEvent): Promise<void>;
  refund(transactionId: string): Promise<RefundResult>;
}

// Attribution Handler
interface AttributionHandler {
  captureEvent(event: ConversionEvent): Promise<void>;
  submitToChain(attribution: Attribution): Promise<TransactionSignature>;
  verifySubmission(signature: string): Promise<boolean>;
}

// Solana Client
interface SolanaClient {
  submitAttribution(data: AttributionData): Promise<string>;
  checkCampaign(campaignId: string): Promise<Campaign>;
  getAffiliateBalance(affiliateId: string): Promise<number>;
}
```

### Indexer Service

Aggregates on-chain events for fast querying.

**Indexed Data:**
- Campaign metadata and status
- Affiliate registrations
- Attribution events
- Commission payouts
- Bridge activity

**Technology:**
- Helius/Triton for Solana indexing
- PostgreSQL for structured data
- Redis for caching

### Frontend Applications

**Company Dashboard:**
- Campaign creation wizard
- Real-time analytics
- Budget management
- Affiliate management

**Affiliate Portal:**
- Campaign discovery
- Link generation
- Earnings tracking
- Withdrawal interface

---

## Security Architecture

### On-Chain Security

| Mechanism | Purpose |
|-----------|---------|
| PDA derivation | Deterministic account addresses |
| Signer checks | Verify transaction authority |
| Ownership checks | Validate account ownership |
| Overflow protection | Safe math operations |
| Reentrancy guards | Prevent reentrancy attacks |

### Bridge Security

| Mechanism | Purpose |
|-----------|---------|
| Staking requirement | Economic security |
| Slashing | Punish misbehavior |
| Rate limiting | Prevent spam |
| Signature verification | Validate submissions |
| Monitoring | Detect anomalies |

### Data Privacy

| Data | Handling |
|------|----------|
| Customer identity | Hashed, never stored on-chain |
| Transaction details | Minimal on-chain footprint |
| Affiliate earnings | Public (by design) |
| Company budgets | Public (by design) |

---

## Scalability Considerations

### Current Design (Solana Mainnet)

- **TPS:** ~65,000 theoretical, ~3,000 practical
- **Finality:** ~400ms
- **Cost:** ~$0.00025/tx

### Future Optimizations

1. **Batch Attributions:** Submit multiple events in single tx
2. **Compression:** Use state compression for accounts
3. **Priority Fees:** Dynamic fee adjustment
4. **Sharding:** Separate campaigns across programs

---

## Integration Points

### E-commerce Platforms

```javascript
// Shopify integration example
const njord = require('@njord/shopify-plugin');

njord.configure({
  bridgeEndpoint: 'https://bridge.example.com',
  campaignId: 'campaign-xyz'
});

// Automatic attribution on checkout
njord.trackConversion(order);
```

### API Endpoints (Bridge)

```
POST /api/v1/attribution
  - Submit conversion event

GET /api/v1/campaigns
  - List available campaigns

GET /api/v1/affiliate/:id/stats
  - Affiliate performance

POST /api/v1/withdraw
  - Request fiat withdrawal
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION SETUP                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CDN       │     │   Load      │     │   Bridge    │
│  (Vercel/   │────▶│  Balancer   │────▶│   Nodes     │
│   CF)       │     │             │     │  (K8s/ECS)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼─────────┐
                    │                          │         │
                    ▼                          ▼         ▼
             ┌─────────────┐          ┌─────────────┐  ┌─────┐
             │  PostgreSQL │          │    Redis    │  │ RPC │
             │   (RDS)     │          │  (Cluster)  │  │Nodes│
             └─────────────┘          └─────────────┘  └─────┘
```

**Infrastructure Requirements per Bridge:**
- 2+ application nodes
- PostgreSQL with replication
- Redis cluster
- Dedicated RPC or Helius/Triton
- Monitoring (Datadog/Grafana)
