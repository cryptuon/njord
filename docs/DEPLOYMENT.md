# Njord Protocol - Deployment Guide

## Overview

This document covers the deployment process for the Njord Protocol smart contracts on Solana. The protocol is built using Anchor framework and supports deployment to both Devnet and Mainnet.

## Current Deployment Status

| Network | Program ID | Status |
|---------|-----------|--------|
| Devnet | `Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv` | Deployed |
| Mainnet | `Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv` | Pending |

**Devnet Explorer:** https://explorer.solana.com/address/Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv?cluster=devnet

---

## Prerequisites

### Required Tools

```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.32.1
avm use 0.32.1

# Node.js & pnpm
npm install -g pnpm
```

### Verify Installation

```bash
solana --version      # v1.18.x or later
anchor --version      # 0.32.1
rustc --version       # 1.75.0 or later
```

---

## Keypair Management

### Directory Structure

```
~/.config/solana/
├── njord-devnet-deployer.json    # Devnet deployment authority
├── njord-mainnet-deployer.json   # Mainnet deployment authority
└── id.json                        # Default Solana keypair

./target/deploy/
└── njord-keypair.json            # Program keypair (determines Program ID)
```

### Generate New Keypairs

```bash
# Devnet deployer
solana-keygen new -o ~/.config/solana/njord-devnet-deployer.json

# Mainnet deployer (store securely!)
solana-keygen new -o ~/.config/solana/njord-mainnet-deployer.json

# Program keypair (only if creating new program ID)
solana-keygen new -o ./target/deploy/njord-keypair.json
```

### Current Keypairs

| Keypair | Public Key | Purpose |
|---------|-----------|---------|
| Devnet Deployer | `AHQYqvdEzVg4uxHwuXb7ex4So6cmYtBLq4EfrvPbwPhV` | Deploy & upgrade on devnet |
| Mainnet Deployer | `CVZanxPUcAcoyWNERFQKzqN3xakBtYdWFbFcKHjEutbb` | Deploy & upgrade on mainnet |
| Program | `Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv` | Njord Program ID |

---

## Devnet Deployment

### 1. Configure Solana CLI

```bash
solana config set --url devnet
solana config set --keypair ~/.config/solana/njord-devnet-deployer.json
```

### 2. Fund the Deployer

```bash
# Request airdrop (may be rate-limited)
solana airdrop 2

# Check balance (need ~7 SOL for deployment)
solana balance
```

### 3. Build the Program

```bash
# Build with platform-tools v1.52 (supports Rust edition 2024)
anchor build -- --tools-version v1.52
```

### 4. Deploy

```bash
anchor deploy --provider.cluster devnet
```

### 5. Verify Deployment

```bash
solana program show Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv --url devnet
```

### 6. Initialize Protocol

```bash
pnpm init:devnet
```

---

## Mainnet Deployment

### Pre-Deployment Checklist

- [ ] Smart contract audit completed
- [ ] All tests passing (`pnpm test`)
- [ ] Mainnet deployer funded with ~7 SOL
- [ ] NJORD token mint created
- [ ] Treasury multi-sig configured
- [ ] GitHub secrets configured
- [ ] Team approval obtained

### Option A: Manual Deployment

```bash
# 1. Configure CLI
solana config set --url mainnet-beta
solana config set --keypair ~/.config/solana/njord-mainnet-deployer.json

# 2. Verify balance
solana balance  # Need ~7 SOL

# 3. Build
anchor build -- --tools-version v1.52

# 4. Deploy
anchor deploy --provider.cluster mainnet

# 5. Verify
solana program show Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv --url mainnet-beta
```

### Option B: GitHub Actions (Recommended)

1. **Configure GitHub Secrets:**
   - `MAINNET_DEPLOYER_KEYPAIR`: Base58-encoded deployer keypair

2. **Create Environment:**
   - Name: `mainnet-production`
   - Required reviewers: 2+ team members
   - Deployment branch: `main` only

3. **Trigger Deployment:**
   - Go to Actions → "Deploy to Mainnet"
   - Click "Run workflow"
   - Enter `DEPLOY_TO_MAINNET` as confirmation
   - Enter current commit SHA
   - Wait for approval from required reviewers

---

## Protocol Initialization

After deployment, the protocol must be initialized with configuration parameters.

### Initialize on Devnet

```bash
pnpm init:devnet
```

### Initialize on Mainnet

```bash
# Update scripts/init-protocol.ts with:
# - Actual NJORD token mint address
# - Treasury multi-sig address

pnpm init:mainnet
```

### Initialization Parameters

| Parameter | Devnet | Mainnet | Description |
|-----------|--------|---------|-------------|
| Protocol Fee | 2.5% (250 bps) | 2.5% (250 bps) | Fee on attributions |
| Min Challenge Bond | 100 USDC | 100 USDC | Minimum to challenge |
| Treasury | Deployer | Multi-sig | Fee recipient |
| NJORD Mint | Placeholder | TBD | Governance token |

---

## Program Upgrades

The program is deployed as upgradeable. The upgrade authority is the deployer keypair.

### Upgrade Process

```bash
# 1. Build new version
anchor build -- --tools-version v1.52

# 2. Deploy upgrade
anchor upgrade target/deploy/njord.so \
  --program-id Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv \
  --provider.cluster <devnet|mainnet>
```

### Transfer Upgrade Authority

For mainnet, consider transferring upgrade authority to a multi-sig:

```bash
solana program set-upgrade-authority \
  Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv \
  --new-upgrade-authority <MULTISIG_ADDRESS>
```

---

## IDL Management

The Interface Definition Language (IDL) is required for client interaction.

### Generate IDL

```bash
anchor idl build -o target/idl/njord.json
```

### Upload IDL to Chain (Optional)

```bash
anchor idl init \
  --filepath target/idl/njord.json \
  Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv \
  --provider.cluster <devnet|mainnet>
```

### IDL Location

- Build output: `target/idl/njord.json`
- SDK: `packages/sdk/src/idl/njord.json`

---

## Configuration Files

### Anchor.toml

```toml
[toolchain]
anchor_version = "0.32.1"

[programs.localnet]
njord = "Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv"

[programs.devnet]
njord = "Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv"

[programs.mainnet]
njord = "Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/njord-devnet-deployer.json"
```

### SDK Client

The program ID is configured in `packages/sdk/src/client.ts`:

```typescript
export const NJORD_PROGRAM_ID = new PublicKey(
  "Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv"
);
```

---

## Troubleshooting

### Build Errors

**"edition2024 is unstable"**
```bash
# Use platform-tools v1.52 or later
anchor build -- --tools-version v1.52
```

**"init_if_needed requires feature"**
```toml
# Add to programs/njord/Cargo.toml
[dependencies]
anchor-lang = { workspace = true, features = ["init-if-needed"] }
```

### Deployment Errors

**"Insufficient funds"**
```bash
# Check balance
solana balance

# Request airdrop (devnet only)
solana airdrop 2
```

**"Account already exists"**
- Program already deployed at this address
- Use `anchor upgrade` instead of `anchor deploy`

### Rate Limiting

Devnet faucet limits:
- 2 SOL per request
- Rate limited per IP/wallet

Alternative faucets:
- https://faucet.solana.com
- https://faucet.quicknode.com/solana/devnet

---

## Security Considerations

### Keypair Security

- **Never commit keypairs to git**
- Store mainnet keypairs in secure vault (e.g., 1Password, HashiCorp Vault)
- Use hardware wallets for mainnet operations when possible
- Rotate keypairs if compromised

### Upgrade Authority

- Devnet: Single deployer key acceptable
- Mainnet: Transfer to multi-sig after initial deployment
- Consider timelock for upgrades

### Pre-Mainnet Checklist

1. [ ] Complete smart contract audit
2. [ ] Run full test suite
3. [ ] Deploy to devnet and test all instructions
4. [ ] Verify IDL matches deployed program
5. [ ] Configure monitoring and alerts
6. [ ] Set up incident response plan
7. [ ] Document rollback procedure

---

## Monitoring

### On-Chain Verification

```bash
# Check program info
solana program show <PROGRAM_ID> --url <CLUSTER>

# Check recent transactions
solana transaction-history <PROGRAM_ID> --url <CLUSTER>
```

### Explorer Links

- **Devnet:** https://explorer.solana.com/address/Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv?cluster=devnet
- **Mainnet:** https://explorer.solana.com/address/Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv

---

## Quick Reference

### Commands

| Action | Command |
|--------|---------|
| Build | `anchor build -- --tools-version v1.52` |
| Test | `anchor test` |
| Deploy (devnet) | `anchor deploy --provider.cluster devnet` |
| Deploy (mainnet) | `anchor deploy --provider.cluster mainnet` |
| Init (devnet) | `pnpm init:devnet` |
| Init (mainnet) | `pnpm init:mainnet` |
| Generate IDL | `anchor idl build` |

### Key Addresses

| Name | Address |
|------|---------|
| Program ID | `Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv` |
| Devnet Deployer | `AHQYqvdEzVg4uxHwuXb7ex4So6cmYtBLq4EfrvPbwPhV` |
| Mainnet Deployer | `CVZanxPUcAcoyWNERFQKzqN3xakBtYdWFbFcKHjEutbb` |

---

## Version History

| Date | Version | Network | Notes |
|------|---------|---------|-------|
| 2025-01-09 | 0.1.0 | Devnet | Initial deployment |

---

## Support

For deployment issues:
1. Check this documentation
2. Review GitHub Actions logs
3. Open issue at https://github.com/njord-protocol/njord/issues
