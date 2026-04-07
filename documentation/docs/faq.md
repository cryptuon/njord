# Frequently Asked Questions

---

## General

### What is Njord Protocol?
Njord is a decentralized affiliate marketing protocol built on Solana. It connects companies, affiliates, and bridge operators in a transparent ecosystem where campaigns are funded on-chain, conversions are tracked immutably, and commissions are paid in seconds. Learn more in [How It Works](how-it-works.md).

### How is Njord different from traditional affiliate networks?
Traditional networks pay in 30–90 days, take 15–30% in fees, and use opaque proprietary dashboards. Njord settles in ~3 seconds, charges only 2.5% + 1% bridge fee, and records everything on-chain for full transparency. There's no middleman controlling your data or payments.

### Do I need cryptocurrency to use Njord?
No. Bridge operators handle all crypto complexity. Companies can fund campaigns with credit cards, and affiliates can withdraw earnings to their bank account — all through bridge operators. See [Getting Started as an Affiliate](for-affiliates.md#getting-started) for both crypto and fiat paths.

### Why Solana?
Solana offers ~400ms finality, ~$0.00025 per transaction, and 65,000 TPS capacity. This makes real-time attribution tracking and micro-commission payments economically viable. The rich ecosystem (USDC, wallets, DEXs) provides everything needed for financial infrastructure.

### What types of products work best?
Njord is optimized for digital products and services — SaaS, apps, subscriptions, digital content — where instant delivery eliminates return/refund complexity.

---

## For Affiliates

### How do I start earning commissions?
Install a Solana wallet (or sign up with a bridge operator), connect to the [Njord Dashboard](https://njord.cryptuon.com), browse campaigns, join one, and share your tracking link. Full guide: [For Affiliates](for-affiliates.md).

### How fast do I get paid?
It depends on your tier. New affiliates have a 7-day hold period. As you build reputation and stake NJORD tokens, your hold period decreases: Verified (3 days), Trusted (24 hours), Elite (real-time, ~3 seconds). See the [Tier System](for-affiliates.md#the-tier-system).

### What is the tier system?
Affiliates progress through four tiers — New, Verified, Trusted, and Elite — based on staking and track record. Higher tiers mean faster payouts and access to premium campaigns. Details in [For Affiliates](for-affiliates.md#the-tier-system).

### Can I receive payments in my local currency?
Yes. Bridge operators can convert your USDC earnings to local currency and deposit to your bank account. You never need to touch crypto directly.

### What happens if I'm falsely accused of fraud?
If someone challenges your attribution and the challenge is rejected, you receive the full commission **plus** the challenger's bond as compensation. False accusations are economically penalized. See [Fraud Protection](fraud-protection.md#challenge-system).

---

## For Companies

### How much does it cost to run a campaign?
You set your own budget and commission rates. The only protocol fees are 0.1 SOL to create a campaign and 2.5% of each commission paid. Companies staking NJORD tokens receive fee discounts up to 50%. See [Fee Structure](for-companies.md#fee-structure).

### How does the escrow system protect my budget?
Your campaign budget is locked in a smart contract escrow. Funds are only released when a verified conversion occurs. If the campaign ends with remaining budget, you can withdraw it. No one — not even the protocol team — can access your escrowed funds.

### Can I use Njord without touching cryptocurrency?
Yes. Sign up with a bridge operator in your region, fund campaigns with credit card or bank transfer, and the bridge handles all on-chain operations. See [Getting Started](for-companies.md#getting-started).

### What fraud protection is built in?
Every attribution is scored for fraud risk, suspicious conversions are held for extended review, and anyone can challenge attributions by posting a bond. Proven fraud results in the affiliate being slashed and you receiving a refund. Full details: [Fraud Protection](fraud-protection.md).

### What commission models are supported?
Percentage (% of sale value), Flat (fixed amount per action), and Tiered (rates increase with volume). You also choose the target action: purchase, signup, app install, or subscription.

---

## For Bridge Operators

### How much can I earn?
Bridge operators earn from four revenue streams: attribution fees (1% of commissions), staking rewards, fiat conversion spreads (0.5–2%), and withdrawal fees. At $1M monthly volume, attribution fees alone generate ~$10,000/month. Full breakdown: [Revenue Streams](for-bridge-operators.md#revenue-streams).

### What infrastructure do I need?
A server (cloud or self-hosted), Node.js/TypeScript experience, and a payment processor account (Stripe, Razorpay, etc.). The bridge SDK provides Docker images for easy deployment. See [Setup Guide](for-bridge-operators.md#setup-guide).

### What are the staking requirements?
Minimum 10,000 NJORD for Bronze tier ($10K daily volume cap). Higher tiers require more stake but unlock higher volume limits and better routing: Silver (50K), Gold (200K), Platinum (500K NJORD). See [Bridge Tiers](for-bridge-operators.md#bridge-tiers).

### What happens if I submit a fraudulent attribution?
Bridges operate under strict liability. Each fraudulent attribution costs 5% of its value (min 10 USDC). Exceeding your tier's fraud tolerance triggers a 10% stake slash and tier downgrade. Repeated violations or collusion result in permanent ban. See [Slashing Conditions](for-bridge-operators.md#slashing-conditions).

---

## About the NJORD Token

### What is NJORD used for?
Three primary uses: (1) Bridge operators stake NJORD to participate in the network, (2) Token holders vote on protocol governance, (3) Companies stake for fee discounts. Full details: [Tokenomics](tokenomics.md).

### How is the token distributed?
35% Ecosystem & Community, 20% Team & Advisors (4-year vest), 15% Treasury, 12% Private Sale, 8% Public Sale, 5% Liquidity, 5% Strategic Partners. See [Token Distribution](tokenomics.md#token-distribution).

### Is NJORD inflationary?
Controlled inflation funds staking rewards: 5% in Year 1, declining to 1% by Year 5+. This is offset by a buyback & burn mechanism funded by 20% of protocol fees, targeting net-neutral or deflationary by Year 3. See [Inflation Schedule](tokenomics.md#inflation-schedule).

---

## Still Have Questions?

- Visit the [Dashboard](https://njord.cryptuon.com) to explore the network
- Read the full [Documentation](index.md) for detailed guides
- Email us: support@cryptuon.com
