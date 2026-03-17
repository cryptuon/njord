# Tokenomics

This document outlines the NJORD token economics, including utility, distribution, staking mechanisms, and fee structures for all protocol participants.

## NJORD Token Overview

| Property | Value |
|----------|-------|
| Token Name | NJORD |
| Blockchain | Solana (SPL Token) |
| Total Supply | 1,000,000,000 (1 Billion) |
| Decimals | 9 |
| Type | Utility & Governance |

---

## Token Utility

The NJORD token serves multiple functions within the ecosystem:

### 1. Bridge Operator Staking

Bridge operators must stake NJORD tokens to participate in the network.

| Tier | Stake Required | Benefits |
|------|----------------|----------|
| Bronze | 10,000 NJORD | Basic bridge operation |
| Silver | 50,000 NJORD | Priority routing, reduced fees |
| Gold | 200,000 NJORD | Premium routing, governance voting |
| Platinum | 500,000 NJORD | Maximum rewards, proposal creation |

**Staking Mechanics:**
- Lock period: 7-day unbonding
- Slashing: Up to 50% for malicious behavior
- Rewards: Share of protocol fees + inflation rewards

### 2. Governance

NJORD holders can participate in protocol governance:

- **Voting:** One token = one vote
- **Proposals:** Platinum stakers can create proposals
- **Decisions:** Fee parameters, slashing rules, upgrades

### 3. Fee Discounts

Companies can stake NJORD for reduced campaign fees:

| Stake | Fee Discount |
|-------|--------------|
| 0 | 0% (standard fees) |
| 5,000 NJORD | 10% discount |
| 25,000 NJORD | 25% discount |
| 100,000 NJORD | 50% discount |

### 4. Premium Features

Future premium features unlocked by staking:
- Advanced analytics
- Priority support
- Custom attribution models
- White-label options

---

## Token Distribution

```
┌────────────────────────────────────────────────────────────────┐
│                    NJORD TOKEN DISTRIBUTION                    │
│                      (1,000,000,000 Total)                     │
└────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│ Ecosystem & Community   35%  │  350,000,000 NJORD
│ ████████████████████████████ │
│ • Bridge operator rewards    │
│ • Affiliate incentives       │
│ • Community grants           │
│ • Marketing campaigns        │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Team & Advisors         20%  │  200,000,000 NJORD
│ ████████████████             │
│ • 4-year vesting             │
│ • 1-year cliff               │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Treasury               15%   │  150,000,000 NJORD
│ ████████████                 │
│ • Protocol development       │
│ • Emergency reserves         │
│ • Strategic initiatives      │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Private Sale           12%   │  120,000,000 NJORD
│ ██████████                   │
│ • 2-year vesting             │
│ • 6-month cliff              │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Public Sale             8%   │  80,000,000 NJORD
│ ███████                      │
│ • No lock-up                 │
│ • Initial liquidity          │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Liquidity Provision     5%   │  50,000,000 NJORD
│ ████                         │
│ • DEX liquidity pools        │
│ • Market making              │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Strategic Partners      5%   │  50,000,000 NJORD
│ ████                         │
│ • Integration partners       │
│ • Bridge launch partners     │
└──────────────────────────────┘
```

---

## Vesting Schedules

| Allocation | Cliff | Vesting Period | Release |
|------------|-------|----------------|---------|
| Team & Advisors | 12 months | 48 months | Linear monthly |
| Private Sale | 6 months | 24 months | Linear monthly |
| Public Sale | None | None | Immediate |
| Strategic Partners | 3 months | 18 months | Linear monthly |
| Ecosystem | None | 60 months | As allocated |
| Treasury | None | Governance controlled | As needed |

---

## Fee Structure

### Protocol Fees

Fees collected from campaign activity:

| Fee Type | Rate | Recipient |
|----------|------|-----------|
| Campaign Creation | 0.1 SOL | Treasury |
| Attribution (Protocol) | 2% of commission | Treasury |
| Attribution (Bridge) | 1% of commission | Bridge Operator |

**Example:**
- Customer purchases $100 product
- Commission rate: 10% = $10
- Protocol fee: 2% of $10 = $0.20
- Bridge fee: 1% of $10 = $0.10
- Affiliate receives: $10 - $0.20 - $0.10 = $9.70

### Bridge Operator Revenue

Bridge operators earn from multiple sources:

```
┌─────────────────────────────────────────────────────────────┐
│               BRIDGE OPERATOR REVENUE STREAMS               │
└─────────────────────────────────────────────────────────────┘

1. Attribution Fees (1% of commissions processed)
   │
   ├── High volume = High revenue
   └── Example: $1M monthly volume = $10,000 revenue

2. Staking Rewards (from protocol inflation)
   │
   ├── Pro-rata based on stake amount
   └── Example: 5% APY on 100,000 NJORD stake

3. Fiat Conversion Spread (set by bridge)
   │
   ├── Typically 0.5-2% on fiat ↔ crypto
   └── Example: $100 converted = $0.50-$2.00

4. Withdrawal Fees (set by bridge)
   │
   ├── Per-withdrawal or percentage
   └── Example: $1 flat or 0.5%
```

### Fee Distribution

Protocol fees flow to multiple destinations:

```
Protocol Fee (2%)
       │
       ├── 50% → Treasury
       │         └── Protocol development, grants
       │
       ├── 30% → Staking Rewards Pool
       │         └── Distributed to NJORD stakers
       │
       └── 20% → Buyback & Burn
                 └── Deflationary pressure
```

---

## Staking Economics

### For Bridge Operators

**Requirements:**
- Minimum stake: 10,000 NJORD
- Recommended: 50,000+ NJORD for competitive routing

**Rewards:**
```
Annual Staking Reward = Base Rate + Performance Bonus

Base Rate = (Your Stake / Total Staked) × Annual Emission
Performance Bonus = f(uptime, volume, reputation)
```

**Example Calculation:**
- Your stake: 100,000 NJORD
- Total staked: 10,000,000 NJORD
- Annual emission: 50,000,000 NJORD (5% of supply)
- Base reward: (100,000 / 10,000,000) × 50,000,000 = 500,000 NJORD
- With 95% uptime bonus: 500,000 × 1.1 = 550,000 NJORD
- APY: 550%

*Note: APY decreases as more operators stake*

### Slashing Conditions

| Offense | Slash Amount | Recovery |
|---------|--------------|----------|
| Downtime (>1 hour) | 0.1% per hour | Immediate |
| Failed attribution | 1% per incident | 30-day cooldown |
| Fraudulent attribution | 50% | Permanent ban |
| Consensus violation | 25% | 90-day cooldown |

### Unbonding

- **Period:** 7 days
- **During unbonding:** No rewards, no slashing
- **Early unstake:** Not permitted

---

## Inflation Schedule

Controlled inflation for staking rewards:

| Year | Annual Inflation | Total Emission |
|------|------------------|----------------|
| 1 | 5% | 50,000,000 NJORD |
| 2 | 4% | 40,000,000 NJORD |
| 3 | 3% | 30,000,000 NJORD |
| 4 | 2% | 20,000,000 NJORD |
| 5+ | 1% | 10,000,000 NJORD |

**Offset by Buyback & Burn:**
- 20% of protocol fees used for buyback
- Target: Net-neutral or deflationary after Year 3

---

## Economic Incentive Alignment

### Bridge Operators

| Behavior | Incentive |
|----------|-----------|
| High uptime | More traffic routing, reputation boost |
| Fast settlement | User preference, volume increase |
| Low fees | Competitive advantage |
| Staking more | Higher reward share, premium routing |

### Companies

| Behavior | Incentive |
|----------|-----------|
| Larger campaigns | Volume discounts |
| NJORD staking | Fee discounts |
| Long-term campaigns | Loyalty benefits |

### Affiliates

| Behavior | Incentive |
|----------|-----------|
| Quality traffic | Higher conversion = higher earnings |
| No fraud | Continued participation |
| High volume | Priority support |

---

## Governance Parameters

Token holders can vote on:

| Parameter | Current Value | Governance Scope |
|-----------|---------------|------------------|
| Protocol fee | 2% | 0.5% - 5% |
| Bridge minimum stake | 10,000 NJORD | 1,000 - 100,000 |
| Slashing rates | Variable | Per-offense |
| Inflation rate | Schedule above | ±1% per year |
| Fee distribution | 50/30/20 | Rebalanceable |

**Voting Process:**
1. Proposal creation (Platinum stakers)
2. Discussion period (7 days)
3. Voting period (7 days)
4. Execution delay (2 days)
5. Implementation

---

## Token Sustainability Model

```
┌─────────────────────────────────────────────────────────────┐
│                  SUSTAINABLE TOKEN ECONOMY                  │
└─────────────────────────────────────────────────────────────┘

                      Protocol Activity
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │          Fee Collection              │
         │    (2% of commission volume)         │
         └──────────────────┬───────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
    ┌─────────┐      ┌──────────┐      ┌──────────┐
    │Treasury │      │ Staking  │      │ Buyback  │
    │  (50%)  │      │ Rewards  │      │ & Burn   │
    │         │      │  (30%)   │      │  (20%)   │
    └────┬────┘      └────┬─────┘      └────┬─────┘
         │                │                 │
         ▼                ▼                 ▼
    Development     Operator         Deflationary
    & Growth        Incentives        Pressure
         │                │                 │
         └────────────────┼─────────────────┘
                          │
                          ▼
                   Ecosystem Growth
                          │
                          ▼
                   More Activity
                   (Flywheel)
```

**Key Sustainability Factors:**
1. Real revenue from affiliate marketing (multi-billion dollar industry)
2. Bridge operators have profit motive independent of token price
3. Buyback creates natural demand tied to protocol usage
4. Staking reduces circulating supply
5. Governance creates long-term holder alignment
