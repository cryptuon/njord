# Stakeholders

The Njord Protocol involves five primary stakeholder groups, each with distinct roles, responsibilities, and incentives.

## Protocol Creators

The core team responsible for developing and maintaining the Njord Protocol.

**Responsibilities:**
- Design, develop, and deploy Solana smart contracts
- Maintain the bridge operator SDK and reference implementation
- Govern protocol upgrades and parameter changes
- Provide documentation and developer support
- Manage the NJORD token distribution and treasury

**Revenue Model:**
- Protocol fees (small percentage of campaign spend)
- Treasury management
- Ecosystem grants and partnerships

---

## Bridge Operators

Independent entities that provide the critical fiat on/off ramp infrastructure, enabling non-crypto users to participate in the ecosystem.

**Role:**
Bridge operators are the backbone of mainstream adoption. They run infrastructure that:
- Accepts fiat payments from end customers (credit cards, bank transfers, UPI, etc.)
- Converts fiat to on-chain transactions
- Submits attribution events to Solana contracts
- Facilitates affiliate withdrawals to fiat (optional)

**Requirements:**
- Stake minimum NJORD tokens (amount set by governance)
- Run bridge infrastructure using Njord SDK
- Maintain uptime and service quality SLAs
- Comply with regional payment regulations (KYC/AML where required)

**Incentives:**
- Transaction fees from processed payments
- NJORD staking rewards
- Revenue share from campaigns processed through their bridge

**Risk & Accountability:**
- Slashing for downtime or fraudulent attributions
- Reputation score affects traffic routing
- Must maintain adequate liquidity for settlements

**Example Bridge Operators:**
| Operator | Region | Payment Methods |
|----------|--------|-----------------|
| Bridge Alpha | US/EU | Stripe, Bank Transfer |
| Bridge Beta | India | Razorpay, UPI, Paytm |
| Bridge Gamma | LATAM | MercadoPago, PIX |
| Bridge Delta | SEA | GrabPay, GCash |

---

## Companies

Business entities that launch and fund affiliate marketing campaigns.

**Role:**
Companies create campaigns to incentivize affiliates to promote their products or services. They define campaign parameters and fund escrow accounts.

**Capabilities:**
- Create campaigns with custom parameters:
  - Budget (in USDC or SOL)
  - Commission structure (flat fee, percentage, tiered)
  - Attribution rules (last-click, first-click, multi-touch)
  - Target actions (purchase, signup, page view, etc.)
  - Campaign duration and caps
- Monitor real-time campaign performance
- Extend or pause campaigns
- Withdraw unused funds after campaign ends

**Onboarding Paths:**
1. **Crypto-native**: Connect Solana wallet, fund with USDC/SOL
2. **Via Bridge**: Pay fiat through bridge operator, bridge handles on-chain funding

**Responsibilities:**
- Fund campaigns adequately
- Define clear, fair commission terms
- Provide product/creative assets for affiliates
- Honor attributed conversions

---

## Affiliates

Individuals or entities that promote company products/services in exchange for commissions.

**Role:**
Affiliates are the distribution layer. They leverage their audience, content, or traffic to drive customer actions for companies.

**Capabilities:**
- Browse and filter available campaigns
- Sign up for campaigns (instant or approval-based)
- Generate unique affiliate links/codes
- Track real-time performance (clicks, conversions, earnings)
- Withdraw earned commissions

**Commission Receipt:**
1. **Crypto-native**: Direct USDC/SOL to Solana wallet
2. **Via Bridge**: Request fiat withdrawal through bridge operator

**Types of Affiliates:**
| Type | Description |
|------|-------------|
| Content Creators | YouTubers, bloggers, podcasters |
| Influencers | Social media personalities |
| Comparison Sites | Review and comparison platforms |
| Coupon/Deal Sites | Discount aggregators |
| Email Marketers | Newsletter operators |
| App Developers | In-app promotions |

**Responsibilities:**
- Promote ethically and transparently (disclose affiliate relationships)
- Follow campaign terms and brand guidelines
- No fraudulent traffic or self-referrals

---

## End Customers

Consumers who purchase or engage with products/services through affiliate links.

**Role:**
End customers are the source of value in the ecosystem. Their actions (purchases, signups, etc.) trigger attribution events and commission payouts.

**Experience:**
- **Seamless**: End customers may not know they're interacting with a Web3 protocol
- **No wallet required**: Bridge operators handle all crypto complexity
- **Standard checkout**: Pay with familiar methods (card, bank, UPI)

**What Happens Behind the Scenes:**
1. Customer clicks affiliate link (contains affiliate ID + campaign ID)
2. Customer completes action (purchase, signup, etc.)
3. Bridge operator captures event and submits to Solana
4. Smart contract attributes action to affiliate
5. Commission is released from escrow to affiliate

**Customer Benefits:**
- Same prices (commissions come from company marketing budget)
- Often access to exclusive deals/discounts via affiliates
- Transparent, fraud-resistant system

---

## Stakeholder Interaction Matrix

| From → To | Protocol | Bridge Ops | Companies | Affiliates | Customers |
|-----------|----------|------------|-----------|------------|-----------|
| **Protocol** | - | SDK, rewards | Contracts | Contracts | - |
| **Bridge Ops** | Fees, stake | - | Fiat rails | Withdrawals | Payment UI |
| **Companies** | Campaign fees | Fiat funding | - | Commissions | Products |
| **Affiliates** | - | Fiat withdrawal | Traffic | - | Promotion |
| **Customers** | - | Fiat payment | Purchase | Click links | - |
