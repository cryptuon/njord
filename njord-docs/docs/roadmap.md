# Roadmap

This document outlines the phased development plan for the Njord Protocol, from initial development through mainnet launch and beyond.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NJORD DEVELOPMENT ROADMAP                         │
└─────────────────────────────────────────────────────────────────────────────┘

Phase 1          Phase 2          Phase 3          Phase 4          Phase 5
Foundation       Bridge SDK       Launch Prep      Mainnet          Scale
    │                │                │                │                │
    ▼                ▼                ▼                ▼                ▼
┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
│ Core   │      │ Bridge │      │ Audit  │      │ Public │      │ Growth │
│Contracts│─────▶│  SDK   │─────▶│& Beta  │─────▶│ Launch │─────▶│Features│
│        │      │        │      │        │      │        │      │        │
└────────┘      └────────┘      └────────┘      └────────┘      └────────┘
```

---

## Phase 1: Foundation

**Focus:** Core protocol development on Solana

### Deliverables

#### 1.1 Core Smart Contracts

| Component | Description | Status |
|-----------|-------------|--------|
| Campaign Registry | Create, fund, manage campaigns | Planned |
| Affiliate Registry | Registration, tracking | Planned |
| Attribution Engine | Event recording, validation | Planned |
| Escrow Manager | Fund custody, distribution | Planned |

**Technical Milestones:**
- [ ] Initialize Anchor project structure
- [ ] Implement Campaign account and instructions
- [ ] Implement Affiliate registration
- [ ] Build Attribution recording logic
- [ ] Create Escrow PDA management
- [ ] Write comprehensive test suite
- [ ] Deploy to Solana Devnet

#### 1.2 Bridge Registry Program

| Component | Description | Status |
|-----------|-------------|--------|
| Operator Registration | Onboarding bridges | Planned |
| Staking Vault | NJORD staking | Planned |
| Reputation System | Score calculation | Planned |
| Slashing Handler | Penalty enforcement | Planned |

**Technical Milestones:**
- [ ] Design staking mechanics
- [ ] Implement registration flow
- [ ] Build reputation scoring algorithm
- [ ] Create slashing conditions
- [ ] Test economic attack vectors

#### 1.3 Token Program

| Component | Description | Status |
|-----------|-------------|--------|
| NJORD SPL Token | Token creation | Planned |
| Staking Rewards | Distribution logic | Planned |
| Governance Hooks | Voting integration | Planned |

**Technical Milestones:**
- [ ] Deploy SPL token
- [ ] Implement staking reward distribution
- [ ] Build governance voting mechanism

#### 1.4 SDK (TypeScript)

**Features:**
- [ ] Campaign management functions
- [ ] Affiliate operations
- [ ] Attribution submission
- [ ] Account fetching and parsing
- [ ] Event subscription

**Deliverable:** `@njord/sdk` npm package

---

## Phase 2: Bridge Infrastructure

**Focus:** Enable bridge operators to run infrastructure

### Deliverables

#### 2.1 Bridge Operator SDK

**Components:**
- [ ] Payment gateway abstraction layer
- [ ] Attribution handler module
- [ ] Solana transaction builder
- [ ] Queue management (Redis)
- [ ] Database schemas (PostgreSQL)
- [ ] Health check endpoints
- [ ] Monitoring integration

**Deliverable:** `@njord/bridge-sdk` npm package

#### 2.2 Reference Bridge Implementation

**Features:**
- [ ] Stripe integration (US/EU)
- [ ] Razorpay integration (India)
- [ ] Basic dashboard UI
- [ ] API documentation
- [ ] Docker deployment scripts
- [ ] Kubernetes manifests

**Deliverable:** Open-source reference bridge

#### 2.3 Bridge Operator Documentation

**Contents:**
- [ ] Setup guide
- [ ] Payment provider integration guides
- [ ] Compliance requirements by region
- [ ] Monitoring and alerting setup
- [ ] Troubleshooting guide

#### 2.4 CLI Tools

**Commands:**
```bash
njord bridge init        # Initialize bridge config
njord bridge stake       # Stake NJORD tokens
njord bridge unstake     # Begin unbonding
njord bridge status      # Check bridge health
njord bridge logs        # View recent activity
```

---

## Phase 3: Launch Preparation

**Focus:** Security, testing, and beta program

### Deliverables

#### 3.1 Security Audit

**Scope:**
- [ ] Smart contract audit (external firm)
- [ ] Bridge SDK security review
- [ ] Penetration testing
- [ ] Economic model review
- [ ] Remediation of findings

**Target:** Two independent audits

#### 3.2 Beta Program

**Participants:**
- 3-5 bridge operators (selected partners)
- 10-20 companies (early adopters)
- 50-100 affiliates (invite-only)

**Activities:**
- [ ] Testnet deployment
- [ ] Real transaction testing (test tokens)
- [ ] UI/UX feedback collection
- [ ] Performance benchmarking
- [ ] Bug bounty program launch

#### 3.3 Frontend Applications

**Company Dashboard:**
- [ ] Campaign creation wizard
- [ ] Analytics dashboard
- [ ] Budget management
- [ ] Affiliate approval workflow
- [ ] Wallet connection (Phantom, Solflare)

**Affiliate Portal:**
- [ ] Campaign browser
- [ ] Link generator
- [ ] Earnings tracker
- [ ] Withdrawal interface
- [ ] Performance analytics

**Public Website:**
- [ ] Landing page
- [ ] Documentation site
- [ ] Bridge directory
- [ ] Campaign explorer

#### 3.4 Indexer & API

**Features:**
- [ ] Real-time event indexing
- [ ] GraphQL API
- [ ] REST API endpoints
- [ ] Webhook notifications
- [ ] Rate limiting

---

## Phase 4: Mainnet Launch

**Focus:** Public launch and initial growth

### Deliverables

#### 4.1 Token Launch

**Activities:**
- [ ] Token Generation Event (TGE)
- [ ] DEX liquidity provision (Raydium, Orca)
- [ ] Initial staking activation
- [ ] Governance activation

#### 4.2 Mainnet Deployment

**Checklist:**
- [ ] Final contract deployment
- [ ] Program verification
- [ ] Multi-sig setup for upgrades
- [ ] Monitoring and alerting live
- [ ] Incident response plan

#### 4.3 Bridge Operator Onboarding

**Target:** 5-10 active bridge operators at launch

**Regions:**
- [ ] US/EU (Stripe-based)
- [ ] India (Razorpay)
- [ ] Southeast Asia (GrabPay/GCash)
- [ ] Latin America (MercadoPago)

#### 4.4 Marketing & Community

**Activities:**
- [ ] Launch announcement
- [ ] Press coverage
- [ ] Influencer partnerships
- [ ] Community Discord/Telegram
- [ ] Documentation and tutorials

---

## Phase 5: Growth & Expansion

**Focus:** Feature expansion and ecosystem growth

### Deliverables

#### 5.1 Advanced Attribution

**Features:**
- [ ] Multi-touch attribution models
- [ ] Custom attribution rules
- [ ] Machine learning fraud detection
- [ ] Cross-campaign attribution

#### 5.2 Platform Integrations

**E-commerce:**
- [ ] Shopify app
- [ ] WooCommerce plugin
- [ ] Magento extension
- [ ] BigCommerce integration

**Other Platforms:**
- [ ] Mobile SDK (iOS/Android)
- [ ] WordPress plugin
- [ ] Zapier integration

#### 5.3 Analytics Suite

**Features:**
- [ ] Advanced reporting
- [ ] Cohort analysis
- [ ] Conversion funnels
- [ ] A/B testing tools
- [ ] Export capabilities

#### 5.4 Additional Payment Methods

**Bridge Enhancements:**
- [ ] Crypto-to-crypto (Jupiter integration)
- [ ] Apple Pay / Google Pay
- [ ] BNPL providers
- [ ] Local payment methods (per region)

#### 5.5 Governance Evolution

**Features:**
- [ ] On-chain governance UI
- [ ] Delegation system
- [ ] Treasury management
- [ ] Grant program automation

---

## Technical Milestones Summary

| Milestone | Phase | Key Deliverables |
|-----------|-------|------------------|
| M1 | 1 | Core contracts on Devnet |
| M2 | 1 | SDK published |
| M3 | 2 | Bridge SDK published |
| M4 | 2 | Reference bridge running |
| M5 | 3 | Security audit complete |
| M6 | 3 | Beta program concluded |
| M7 | 3 | Frontend apps deployed |
| M8 | 4 | Token live |
| M9 | 4 | Mainnet deployed |
| M10 | 4 | 5+ bridges operational |
| M11 | 5 | Platform integrations live |
| M12 | 5 | 1M+ attributions processed |

---

## Success Metrics

### Phase 1-2 (Development)
- All tests passing
- 90%+ code coverage
- Documentation complete

### Phase 3 (Beta)
- < 5 critical bugs found
- 95%+ uptime on testnet
- Positive beta feedback (NPS > 40)

### Phase 4 (Launch)
- 5+ bridge operators live
- 100+ campaigns created
- $100K+ monthly attribution volume

### Phase 5 (Growth)
- 20+ bridge operators
- 1,000+ active campaigns
- $10M+ monthly attribution volume
- 50,000+ active affiliates

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Smart contract vulnerability | Multiple audits, bug bounty |
| Bridge operator failure | Minimum staking, slashing, redundancy |
| Low adoption | Partnership program, marketing |
| Regulatory challenges | Compliance-first bridge design |
| Solana congestion | Priority fees, transaction optimization |
| Token price volatility | Real utility, buyback mechanism |

---

## Open Questions for Community Input

1. **Attribution Models:** What additional models are needed beyond last-click/first-click?

2. **Bridge Requirements:** What's the right minimum stake for bridge operators?

3. **Fee Structure:** Are the current fee levels (2% protocol, 1% bridge) competitive?

4. **Platform Priority:** Which e-commerce platforms should we integrate first?

5. **Governance:** Should major decisions require supermajority (66%) or simple majority (51%)?

---

## Contributing

The Njord Protocol is open-source. Contributions are welcome:

- **GitHub:** github.com/njord-protocol
- **Discord:** discord.gg/njord
- **Governance Forum:** forum.njord.io

### How to Contribute

1. Review open issues and roadmap items
2. Discuss proposed changes in Discord
3. Submit pull requests with tests
4. Participate in code reviews
5. Help with documentation

### Grants Program

Coming in Phase 4:
- Builder grants for integrations
- Research grants for economics/security
- Community grants for content/education
