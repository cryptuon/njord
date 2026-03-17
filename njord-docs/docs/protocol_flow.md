# Understanding the Protocol Flow

This section provides a detailed walkthrough of the Njord Protocol flow, from campaign creation to commission payout, including both crypto-native and bridge-facilitated paths.

## High-Level Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           NJORD PROTOCOL FLOW                            │
└──────────────────────────────────────────────────────────────────────────┘

  COMPANY                AFFILIATE              BRIDGE               CUSTOMER
     │                      │                     │                     │
     │  1. Create Campaign  │                     │                     │
     │─────────────────────►│                     │                     │
     │      (on-chain)      │                     │                     │
     │                      │                     │                     │
     │  2. Fund Escrow      │                     │                     │
     │──────────────────────┼─────────────────────┼─────────────────────│
     │   (USDC/SOL)         │                     │                     │
     │                      │                     │                     │
     │                      │  3. Join Campaign   │                     │
     │◄─────────────────────│                     │                     │
     │                      │  (get affiliate ID) │                     │
     │                      │                     │                     │
     │                      │  4. Share Link      │                     │
     │                      │─────────────────────┼────────────────────►│
     │                      │                     │                     │
     │                      │                     │  5. Customer Acts   │
     │                      │                     │◄────────────────────│
     │                      │                     │    (purchase/signup)│
     │                      │                     │                     │
     │                      │                     │  6. Submit Event    │
     │                      │                     │─────────────────────│
     │                      │                     │    (to Solana)      │
     │                      │                     │                     │
     │                      │  7. Commission      │                     │
     │                      │◄────────────────────┼─────────────────────│
     │                      │   (auto-release)    │                     │
     │                      │                     │                     │
     └──────────────────────┴─────────────────────┴─────────────────────┘
```

## Detailed Flow Steps

### Step 1: Campaign Creation

**Actor:** Company

A company creates a new affiliate campaign by interacting with the Njord Campaign Registry contract.

**On-chain Parameters:**
```
Campaign {
  id: unique_campaign_id
  company: company_wallet_address
  budget: 10000 USDC
  commission_type: percentage | flat | tiered
  commission_rate: 10% (or specific tiers)
  attribution_model: last_click | first_click | multi_touch
  target_action: purchase | signup | pageview | custom
  start_date: timestamp
  end_date: timestamp (optional)
  max_affiliates: 100 (optional)
  auto_approve: true | false
  metadata_uri: ipfs://... (campaign details, creatives)
}
```

**Paths:**
- **Crypto-native**: Company connects Solana wallet, signs transaction
- **Via Bridge**: Company uses bridge dashboard, bridge submits on-chain

---

### Step 2: Escrow Funding

**Actor:** Company

Campaign budget is deposited into the protocol's escrow smart contract.

**On-chain Actions:**
1. Company transfers USDC/SOL to escrow PDA (Program Derived Address)
2. Escrow is linked to campaign ID
3. Funds are locked until:
   - Attributed to affiliates (success)
   - Campaign ends (refund remaining)
   - Company cancels (refund with conditions)

**Via Bridge:**
1. Company pays fiat to bridge operator
2. Bridge converts to USDC
3. Bridge deposits to escrow on company's behalf

---

### Step 3: Affiliate Signup

**Actor:** Affiliate

Affiliates browse available campaigns and register to participate.

**On-chain Actions:**
1. Affiliate calls `join_campaign(campaign_id)`
2. Contract checks:
   - Campaign is active
   - Max affiliates not reached
   - Auto-approve or pending approval
3. Affiliate receives unique `affiliate_id` for this campaign

**Result:**
```
AffiliateRegistration {
  affiliate_id: unique_id
  campaign_id: campaign_id
  affiliate_wallet: wallet_address
  status: active | pending_approval
  joined_at: timestamp
}
```

---

### Step 4: Link Generation & Promotion

**Actor:** Affiliate

Affiliate generates trackable links and promotes the company's offering.

**Link Structure:**
```
https://company.com/product?njord=CAMPAIGN_ID.AFFILIATE_ID

or via Njord redirect:

https://njord.link/CAMPAIGN_ID/AFFILIATE_ID
```

**Tracking Methods:**
| Method | Description | Use Case |
|--------|-------------|----------|
| URL Parameter | `?njord=X.Y` | Web links |
| Redirect | `njord.link/X/Y` | Short links |
| Coupon Code | `AFFILIATE10` | Checkout codes |
| SDK Embed | JavaScript snippet | In-app tracking |

---

### Step 5: Customer Action

**Actor:** End Customer

Customer clicks affiliate link and completes the target action.

**Customer Journey:**
1. Sees affiliate content (blog, video, social post)
2. Clicks affiliate link
3. Lands on company site (with tracking params)
4. Completes action (purchase, signup, etc.)

**Tracking Capture:**
- Cookie/session stores `affiliate_id + campaign_id`
- Or coupon code maps to affiliate
- Or SDK captures programmatically

---

### Step 6: Attribution Event Submission

**Actor:** Bridge Operator (or Company SDK)

The conversion event is submitted to the Solana blockchain.

**On-chain Event:**
```
AttributionEvent {
  campaign_id: campaign_id
  affiliate_id: affiliate_id
  action_type: purchase | signup | pageview
  action_value: 150.00 (order amount in USD)
  customer_hash: hash(customer_identifier) // privacy-preserving
  bridge_operator: bridge_wallet (if via bridge)
  timestamp: solana_timestamp
  proof: signature_or_hash
}
```

**Validation:**
1. Contract verifies campaign is active
2. Verifies affiliate is registered
3. Verifies escrow has sufficient funds
4. Checks for duplicate events (idempotency)

---

### Step 7: Commission Calculation & Payout

**Actor:** Smart Contract (Automatic)

Commission is calculated and released from escrow to affiliate.

**Calculation Examples:**
| Commission Type | Setup | Order Value | Commission |
|-----------------|-------|-------------|------------|
| Percentage | 10% | $150 | $15 USDC |
| Flat | $5/sale | $150 | $5 USDC |
| Tiered | 5%<$100, 10%>$100 | $150 | $15 USDC |

**Payout Flow:**
1. Contract calculates commission
2. Deducts protocol fee (e.g., 2%)
3. Deducts bridge fee (if applicable, e.g., 1%)
4. Transfers remaining to affiliate wallet
5. Emits `CommissionPaid` event

**Affiliate Receives:**
- **Crypto-native**: Direct USDC/SOL to wallet
- **Via Bridge**: Can request fiat withdrawal later

---

## Alternative Flows

### Flow A: Crypto-Native (No Bridge)

For users comfortable with Solana wallets:

```
Company (Phantom) ──► Solana Contract ◄── Affiliate (Phantom)
                           │
                           ▼
                      Direct USDC
                       Payouts
```

### Flow B: Full Bridge (Fiat End-to-End)

For mainstream users:

```
Company ──► Bridge A ──► Solana Contract ◄── Bridge B ◄── Affiliate
  (Fiat)                                                    (Fiat)
                              │
                              ▼
                         Customer
                       (via Bridge A)
```

### Flow C: Hybrid

Most common scenario:

```
Company ──► Bridge ──► Solana Contract ◄── Affiliate (Crypto)
  (Fiat)                    │
                            ▼
                        Customer
                      (via Bridge)
```

---

## Real-Time Settlement Example

**Scenario:** Customer purchases $100 product via affiliate link

| Step | Time | Action |
|------|------|--------|
| T+0ms | Customer clicks "Buy Now" | |
| T+2s | Payment processed by bridge | Stripe confirms |
| T+2.5s | Bridge submits attribution | Solana tx sent |
| T+3s | Transaction confirmed | ~400ms finality |
| T+3s | Commission released | $10 USDC to affiliate |

**Total time from purchase to commission: ~3 seconds**

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Insufficient escrow | Transaction reverts, event logged |
| Duplicate event | Idempotency check, no double-pay |
| Invalid affiliate | Transaction reverts |
| Bridge offline | Events queued, submitted when online |
| Campaign expired | New events rejected |

---

## Event Logs

All actions emit on-chain events for transparency:

```
Events:
- CampaignCreated(campaign_id, company, budget)
- CampaignFunded(campaign_id, amount)
- AffiliateJoined(campaign_id, affiliate_id)
- AttributionRecorded(campaign_id, affiliate_id, action, value)
- CommissionPaid(campaign_id, affiliate_id, amount)
- CampaignEnded(campaign_id, remaining_budget)
```

These events enable:
- Real-time dashboards
- Analytics and reporting
- Dispute resolution
- Audit trails
