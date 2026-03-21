# Njord Protocol

**Decentralized Affiliate Marketing on Solana**

Njord is an on-chain affiliate marketing protocol that enables trustless, real-time commission payments with built-in fraud detection and decentralized bridge operators for fiat on/off ramps.

## Deployment Status

| Network | Program ID | Status |
|---------|-----------|--------|
| Devnet | [`Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv`](https://explorer.solana.com/address/Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv?cluster=devnet) | Live |
| Mainnet | `Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv` | Pending |

## Features

- **Real-time Settlement**: Sub-second commission payments on Solana
- **Tiered Trust System**: Affiliates earn faster payouts as they build reputation
- **Decentralized Bridges**: Independent operators handle fiat conversions
- **Fraud Detection**: ML-powered scoring with economic challenge system
- **Governance**: Token-weighted voting for protocol parameters

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Companies                                │
│                    (Campaign Creators)                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Njord Smart Contract                         │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐           │
│  │Campaign │ │Affiliate │ │Attribution│ │Challenge │           │
│  │ Module  │ │  Module  │ │  Module   │ │  Module  │           │
│  └─────────┘ └──────────┘ └───────────┘ └──────────┘           │
│  ┌─────────┐ ┌──────────┐                                       │
│  │ Bridge  │ │Governance│                                       │
│  │ Module  │ │  Module  │                                       │
│  └─────────┘ └──────────┘                                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │Affiliates│   │  Bridge  │   │ Indexer  │
    │          │   │Operators │   │(GraphQL) │
    └──────────┘   └──────────┘   └──────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| `@njord/sdk` | Core TypeScript SDK for interacting with the protocol |
| `@njord/react` | React hooks and components for frontend integration |
| `@njord/bridge-sdk` | SDK for building bridge operator services |
| `@njord/indexer` | Event indexer with PostgreSQL and GraphQL API |

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+
- Rust (for Anchor development)
- Solana CLI
- Anchor CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/njord-protocol/njord.git
cd njord

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Local Development

```bash
# Start local infrastructure (Postgres, Redis, Solana validator)
docker-compose up -d

# Run tests
pnpm test

# Start development mode
pnpm dev
```

### Deploy to Devnet

```bash
# Configure Solana CLI for devnet
solana config set --url devnet
solana config set --keypair ~/.config/solana/njord-devnet-deployer.json

# Build (requires platform-tools v1.52 for Rust edition 2024)
anchor build -- --tools-version v1.52

# Deploy
anchor deploy --provider.cluster devnet

# Initialize protocol
pnpm init:devnet
```

For detailed deployment instructions, see [Deployment Guide](./docs/DEPLOYMENT.md).

## Usage

### For Companies (Campaign Creators)

```typescript
import { NjordClient } from "@njord/sdk";

const client = new NjordClient({
  connection,
  wallet,
});

// Create a campaign
const { campaignPda } = await client.createCampaign({
  name: "Summer Sale",
  mint: usdcMint,
  commissionType: "percentage",
  commissionValue: 1000, // 10%
  budget: 10000_000000, // $10,000 USDC
  holdPeriod: 7 * 24 * 60 * 60, // 7 days
});
```

### For Affiliates

```typescript
// Register as affiliate
await client.createAffiliateProfile();

// Join a campaign
await client.registerAffiliate({ campaign: campaignPda });

// Generate tracking link
const link = `https://merchant.com?njord_c=${campaignId}&njord_a=${affiliateId}`;
```

### For React Apps

```tsx
import { NjordProvider, useCampaigns, useAffiliate } from "@njord/react";

function App() {
  return (
    <NjordProvider indexerUrl="https://indexer.njord.io">
      <Dashboard />
    </NjordProvider>
  );
}

function Dashboard() {
  const { campaigns, loading } = useCampaigns();
  const { affiliate, earnings } = useAffiliate();

  return (
    <div>
      <h1>Your Earnings: ${earnings.total / 100}</h1>
      <h2>Available Campaigns: {campaigns.length}</h2>
    </div>
  );
}
```

### For Bridge Operators

```bash
# Initialize configuration
npx njord-bridge init

# Generate keypair
npx njord-bridge keygen

# Start the bridge server
npx njord-bridge serve
```

## Documentation

- [Introduction](./njord-docs/docs/introduction.md)
- [Architecture](./njord-docs/docs/architecture.md)
- [Protocol Flow](./njord-docs/docs/protocol_flow.md)
- [Tokenomics](./njord-docs/docs/tokenomics.md)
- [Fraud Detection](./njord-docs/docs/fraud_detection.md)
- [Getting Started](./njord-docs/docs/getting_started.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## Development

### Project Structure

```
njord/
├── programs/njord/          # Solana/Anchor smart contract
├── packages/
│   ├── sdk/                 # Core TypeScript SDK
│   ├── react/               # React hooks & components
│   ├── bridge-sdk/          # Bridge operator SDK
│   └── indexer/             # Event indexer
├── tools/
│   └── fraud-detection/     # Python ML fraud detection
├── njord-docs/              # Documentation
└── tests/                   # Integration tests
```

### Commands

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Build Anchor program
pnpm anchor:build

# Run Anchor tests
pnpm anchor:test

# Deploy to devnet
pnpm anchor:deploy

# Initialize protocol (devnet)
pnpm init:devnet

# Initialize protocol (mainnet)
pnpm init:mainnet
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## Security

For security concerns, please email security@njord.io or open a private security advisory.

## License

MIT License - see [LICENSE](./LICENSE) for details.
