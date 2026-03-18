# Introduction

## Purpose of the Documentation
This documentation provides comprehensive guidance for all participants in the Njord Protocol - a decentralized affiliate and brand marketing system built on Solana.

It serves as the definitive reference for:
- **Protocol developers** building on Njord
- **Companies** launching affiliate campaigns
- **Affiliates** earning commissions
- **Bridge operators** providing fiat on/off ramps
- **End customers** interacting with affiliate links

## Overview of the Njord Protocol

Njord is a decentralized affiliate marketing protocol built on **Solana**, designed for high-throughput, low-cost attribution and settlement. The protocol brings affiliate marketing on-chain while maintaining accessibility for non-crypto users through a network of independent bridge operators.

**Primary Focus:** Digital products and services (SaaS, apps, digital content, subscriptions) where instant delivery eliminates return/refund complexity.

### Core Principles

1. **On-chain Transparency**: All campaigns, attributions, and payouts are recorded on Solana, providing immutable proof of marketing performance.

2. **Decentralized Bridge Network**: Independent bridge operators handle fiat on/off ramps, allowing regular users to participate without touching cryptocurrency directly.

3. **Real-time Settlement**: Solana's ~400ms block times enable near-instant commission attribution and payouts.

4. **Open Participation**: Anyone can become a bridge operator by staking NJORD tokens and running the bridge infrastructure.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        NJORD PROTOCOL                           │
│                     (Solana Smart Contracts)                    │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │   Campaign    │  │  Attribution  │  │   Escrow &    │       │
│  │   Registry    │  │    Engine     │  │   Payouts     │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Bridge A    │     │   Bridge B    │     │   Bridge C    │
│   (US/EU)     │     │   (Asia)      │     │   (LATAM)     │
│   Stripe      │     │   Razorpay    │     │   MercadoPago │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
        ▼                     ▼                     ▼
   End Users             End Users             End Users
   (Fiat)                (Fiat)                (Fiat)
```

### Why Solana?

| Factor | Benefit for Affiliate Marketing |
|--------|--------------------------------|
| ~400ms finality | Real-time attribution tracking |
| ~$0.00025/tx | Economical micro-commissions |
| 65,000 TPS | Scale to millions of clicks/purchases |
| Rich ecosystem | USDC, wallet infrastructure, DEXs |

## Definitions of Key Terms

**Njord Protocol**: The on-chain smart contracts and SDK that power decentralized affiliate marketing.

**NJORD Token**: The native protocol token used for staking, governance, and bridge operator incentives.

**Company**: Any business entity launching affiliate marketing campaigns through the protocol.

**Affiliate**: An individual or entity promoting products/services and earning commissions.

**End Customer**: The consumer who purchases or engages through affiliate links.

**Bridge Operator**: An independent entity running fiat on/off ramp infrastructure, staking NJORD tokens to participate.

**Campaign**: A marketing initiative with defined budget, commission rates, and attribution rules, deployed as an on-chain program.

**Attribution**: The on-chain mechanism tracking which affiliate drove a specific customer action.

**Escrow**: Smart contract-held funds that automatically distribute to affiliates based on verified attributions.

**Settlement**: The process of converting attributed actions into affiliate payouts.

## Document Structure

| Document | Contents |
|----------|----------|
| [Stakeholders](stakeholders.md) | Roles and responsibilities of all participants |
| [Protocol Flow](protocol_flow.md) | End-to-end transaction and attribution flow |
| [Architecture](architecture.md) | Technical system design |
| [Tokenomics](tokenomics.md) | NJORD token utility and bridge economics |
| [Fraud Detection](fraud_detection.md) | Incentivized fraud prevention system |
| [Roadmap](roadmap.md) | Development phases and milestones |
| [Getting Started](getting_started.md) | Setup guides for each participant type |
