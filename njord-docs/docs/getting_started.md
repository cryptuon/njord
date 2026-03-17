# Getting Started

This guide walks you through getting started with the Njord Protocol based on your role: Company, Affiliate, Bridge Operator, or Developer.

## Prerequisites by Role

| Role | Wallet Required | Crypto Required | Technical Skills |
|------|-----------------|-----------------|------------------|
| Company (Crypto) | Solana wallet | USDC/SOL | Basic |
| Company (Fiat) | None | None | Basic |
| Affiliate (Crypto) | Solana wallet | SOL for fees | Basic |
| Affiliate (Fiat) | None | None | Basic |
| Bridge Operator | Solana wallet | NJORD stake + SOL | Advanced |
| Developer | Solana wallet | SOL for testing | Advanced |

---

## For Companies

### Option A: Crypto-Native Setup

**Prerequisites:**
- Solana wallet (Phantom, Solflare, or Backpack recommended)
- USDC or SOL for campaign funding
- Small amount of SOL for transaction fees (~0.01 SOL)

**Steps:**

1. **Install a Solana Wallet**
   ```
   Download from:
   - Phantom: phantom.app
   - Solflare: solflare.com
   - Backpack: backpack.app
   ```

2. **Fund Your Wallet**
   - Transfer SOL from an exchange (Coinbase, Binance, etc.)
   - Swap to USDC if preferred for campaign funding

3. **Connect to Njord**
   - Navigate to app.njord.io
   - Click "Connect Wallet"
   - Approve connection in your wallet

4. **Create Your First Campaign**
   - Click "New Campaign"
   - Set parameters (budget, commission rate, duration)
   - Fund escrow with USDC/SOL
   - Approve transaction in wallet

### Option B: Via Bridge (Fiat)

**Prerequisites:**
- Credit card, bank account, or supported payment method
- Email address

**Steps:**

1. **Choose a Bridge Operator**
   - Visit njord.io/bridges
   - Select a bridge operating in your region

2. **Create Account**
   - Sign up with email on bridge platform
   - Complete KYC if required by bridge

3. **Create Campaign**
   - Use bridge dashboard to configure campaign
   - Pay with fiat (card, bank transfer, etc.)
   - Bridge handles on-chain deployment

---

## For Affiliates

### Option A: Crypto-Native Setup

**Prerequisites:**
- Solana wallet
- Small amount of SOL for transaction fees (~0.001 SOL)

**Steps:**

1. **Set Up Wallet**
   - Install Phantom, Solflare, or Backpack
   - Secure your seed phrase

2. **Connect to Njord**
   - Navigate to app.njord.io
   - Connect your wallet

3. **Browse Campaigns**
   - Explore available campaigns
   - Filter by category, commission rate, etc.

4. **Join a Campaign**
   - Click "Join" on desired campaign
   - Approve transaction (minimal SOL fee)
   - Receive your unique affiliate ID

5. **Generate Links**
   - Go to your dashboard
   - Copy affiliate links for the campaign
   - Start promoting

6. **Track & Withdraw**
   - Monitor real-time earnings
   - Withdraw USDC/SOL to your wallet anytime

### Option B: Via Bridge (Fiat)

**Prerequisites:**
- Email address
- Bank account or supported withdrawal method

**Steps:**

1. **Choose a Bridge**
   - Select bridge operating in your region
   - Sign up and verify identity if required

2. **Browse & Join Campaigns**
   - Use bridge interface to find campaigns
   - Join with one click

3. **Promote & Earn**
   - Generate links through bridge dashboard
   - Track performance in real-time

4. **Withdraw to Bank**
   - Request fiat withdrawal
   - Bridge converts USDC to local currency
   - Receive funds via bank/payment method

---

## For Bridge Operators

### Prerequisites

- **Technical:**
  - Server infrastructure (cloud or self-hosted)
  - Experience with Node.js/TypeScript or Rust
  - Understanding of payment gateway integration

- **Financial:**
  - NJORD tokens for staking (minimum set by governance)
  - SOL for transaction fees
  - Liquidity for settlements

- **Legal:**
  - Business entity in operating jurisdiction
  - Payment processor relationships (Stripe, Razorpay, etc.)
  - Compliance with local regulations

### Setup Steps

1. **Stake NJORD Tokens**
   ```bash
   # Using Njord CLI
   njord bridge stake --amount 10000 --wallet <your-wallet>
   ```

2. **Clone Bridge SDK**
   ```bash
   git clone https://github.com/njord-protocol/bridge-sdk
   cd bridge-sdk
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with:
   # - Solana RPC endpoint
   # - Payment gateway API keys
   # - Database connection
   # - Your bridge wallet keypair
   ```

4. **Integrate Payment Gateway**
   ```typescript
   // Example: Stripe integration
   import { NjordBridge } from '@njord/bridge-sdk';

   const bridge = new NjordBridge({
     paymentProvider: 'stripe',
     stripeSecretKey: process.env.STRIPE_SECRET,
     solanaRpc: process.env.SOLANA_RPC,
     bridgeKeypair: loadKeypair('./bridge-wallet.json')
   });

   await bridge.start();
   ```

5. **Run Bridge Service**
   ```bash
   npm run start:production
   ```

6. **Register with Protocol**
   - Submit bridge metadata (name, region, supported methods)
   - Pass health checks
   - Appear in bridge directory

### Monitoring

```bash
# Check bridge status
njord bridge status --address <your-bridge>

# View processed transactions
njord bridge transactions --limit 100

# Check staking rewards
njord bridge rewards --address <your-bridge>
```

---

## For Developers

### Prerequisites

- Node.js 18+ or Rust toolchain
- Solana CLI tools
- Anchor framework (for Solana development)

### Local Development Setup

1. **Install Solana Tools**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   solana --version
   ```

2. **Install Anchor**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor anchor-cli
   anchor --version
   ```

3. **Clone Njord Protocol**
   ```bash
   git clone https://github.com/njord-protocol/njord
   cd njord
   ```

4. **Start Local Validator**
   ```bash
   solana-test-validator
   ```

5. **Deploy Locally**
   ```bash
   anchor build
   anchor deploy
   ```

6. **Run Tests**
   ```bash
   anchor test
   ```

### SDK Installation

**JavaScript/TypeScript:**
```bash
npm install @njord/sdk
```

**Usage:**
```typescript
import { NjordClient } from '@njord/sdk';

const client = new NjordClient({
  rpc: 'https://api.mainnet-beta.solana.com',
  wallet: yourWallet
});

// Create campaign
const campaign = await client.createCampaign({
  budget: 1000_000_000, // 1000 USDC (6 decimals)
  commissionRate: 1000, // 10% (basis points)
  targetAction: 'purchase'
});

// Record attribution
await client.recordAttribution({
  campaignId: campaign.id,
  affiliateId: 'affiliate-123',
  actionValue: 150_000_000 // $150
});
```

---

## Network Information

### Mainnet

| Resource | Value |
|----------|-------|
| RPC | `https://api.mainnet-beta.solana.com` |
| Program ID | `NjordXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| NJORD Token | `NJORDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| Explorer | `https://solscan.io` |

### Devnet (Testing)

| Resource | Value |
|----------|-------|
| RPC | `https://api.devnet.solana.com` |
| Program ID | `NjordDevXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| Faucet | `https://faucet.solana.com` |

---

## Support

- **Documentation:** docs.njord.io
- **Discord:** discord.gg/njord
- **GitHub:** github.com/njord-protocol
- **Email:** support@njord.io
