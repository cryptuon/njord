# Changelog

All notable changes to the Njord Protocol will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-09

### Added

- **Devnet Deployment**: First public deployment to Solana Devnet
  - Program ID: `Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv`
  - Explorer: https://explorer.solana.com/address/Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv?cluster=devnet

- **Core Protocol Features**:
  - Protocol initialization with configurable fees
  - Campaign creation with flexible commission types
  - Affiliate profile management with tiered trust system
  - Attribution recording with fraud protection
  - Challenge system for dispute resolution
  - Bridge operator staking and management
  - DAO governance with voting escrow

- **SDK Packages**:
  - `@njord/sdk`: Core TypeScript SDK with PDA derivation and account fetching
  - `@njord/react`: React hooks and context providers
  - `@njord/bridge-sdk`: Bridge operator service SDK
  - `@njord/indexer`: PostgreSQL indexer with GraphQL API

- **Developer Tools**:
  - Deployment scripts (`init:devnet`, `init:mainnet`)
  - GitHub Actions workflows for CI/CD
  - Mainnet deployment workflow with multi-approval gates
  - Comprehensive test suite (219 tests passing)

- **Documentation**:
  - Deployment guide (`docs/DEPLOYMENT.md`)
  - Architecture documentation
  - SDK usage examples

### Infrastructure

- Anchor framework v0.32.1
- Solana platform-tools v1.52 (supports Rust edition 2024)
- TypeScript SDK with full type safety
- Monorepo structure with pnpm workspaces

### Security

- Implemented `init-if-needed` pattern with proper re-initialization protection
- Added comprehensive account validation with Anchor constraints
- Challenge bond system for fraud deterrence
- Tiered hold periods based on affiliate reputation

---

## [Unreleased]

### Planned

- Mainnet deployment (pending audit)
- NJORD token launch
- Multi-sig treasury setup
- Additional bridge operator features
- Enhanced fraud detection ML models
