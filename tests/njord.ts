import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Njord } from "../target/types/njord";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { expect } from "chai";

describe("njord", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Njord as Program<Njord>;
  const connection = provider.connection;

  // Test accounts
  let protocolConfig: PublicKey;
  let treasury: Keypair;
  let njordMint: PublicKey;
  let usdcMint: PublicKey;

  // Campaign accounts
  let company: Keypair;
  let campaignPda: PublicKey;
  let campaignEscrow: PublicKey;

  // Affiliate accounts
  let affiliate: Keypair;
  let affiliateProfile: PublicKey;
  let affiliateRegistration: PublicKey;

  // Bridge accounts
  let bridgeOperator: Keypair;
  let bridgePda: PublicKey;

  before(async () => {
    // Create treasury keypair
    treasury = Keypair.generate();

    // Airdrop SOL to treasury
    const airdropSig = await connection.requestAirdrop(
      treasury.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);

    // Create NJORD token mint
    njordMint = await createMint(
      connection,
      treasury,
      treasury.publicKey,
      null,
      9 // 9 decimals
    );

    // Create USDC mock mint
    usdcMint = await createMint(
      connection,
      treasury,
      treasury.publicKey,
      null,
      6 // 6 decimals
    );

    // Create test accounts
    company = Keypair.generate();
    affiliate = Keypair.generate();
    bridgeOperator = Keypair.generate();

    // Airdrop to test accounts
    await Promise.all([
      connection.requestAirdrop(company.publicKey, 5 * LAMPORTS_PER_SOL),
      connection.requestAirdrop(affiliate.publicKey, 5 * LAMPORTS_PER_SOL),
      connection.requestAirdrop(bridgeOperator.publicKey, 5 * LAMPORTS_PER_SOL),
    ]);

    // Wait for airdrops
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Derive protocol config PDA
    [protocolConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol_config")],
      program.programId
    );
  });

  describe("Protocol Initialization", () => {
    it("initializes the protocol", async () => {
      const protocolFeeBps = 200; // 2%
      const minChallengeBond = new anchor.BN(5_000_000); // 5 USDC

      await program.methods
        .initialize(protocolFeeBps, minChallengeBond)
        .accounts({
          protocolConfig,
          authority: provider.wallet.publicKey,
          treasury: treasury.publicKey,
          njordMint,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Verify protocol config
      const config = await program.account.protocolConfig.fetch(protocolConfig);
      expect(config.authority.toBase58()).to.equal(
        provider.wallet.publicKey.toBase58()
      );
      expect(config.protocolFeeBps).to.equal(protocolFeeBps);
      expect(config.minChallengeBond.toNumber()).to.equal(5_000_000);
    });

    it("updates protocol config", async () => {
      const newFeeBps = 150; // 1.5%

      await program.methods
        .updateConfig(newFeeBps, null, null)
        .accounts({
          protocolConfig,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      const config = await program.account.protocolConfig.fetch(protocolConfig);
      expect(config.protocolFeeBps).to.equal(newFeeBps);
    });
  });

  describe("Campaign Management", () => {
    let campaignId: anchor.BN;

    before(async () => {
      // Derive campaign PDA
      const campaignCount = (
        await program.account.protocolConfig.fetch(protocolConfig)
      ).totalCampaigns;
      campaignId = campaignCount;

      [campaignPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("campaign"),
          company.publicKey.toBuffer(),
          campaignId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      [campaignEscrow] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), campaignPda.toBuffer()],
        program.programId
      );
    });

    it("creates a campaign", async () => {
      const params = {
        commissionType: { percentage: {} },
        commissionRateBps: 1000, // 10%
        attributionModel: { lastClick: {} },
        targetAction: { purchase: {} },
        minAffiliateTier: { new: {} },
        customHoldPeriod: new anchor.BN(7 * 24 * 60 * 60), // 7 days
        startTime: new anchor.BN(Math.floor(Date.now() / 1000)),
        endTime: new anchor.BN(
          Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
        ), // 30 days
        maxAffiliates: 1000,
        autoApprove: true,
        metadataUri: "https://example.com/campaign.json",
      };

      // Create company's USDC account and fund it
      const companyUsdc = await createAccount(
        connection,
        company,
        usdcMint,
        company.publicKey
      );

      await mintTo(
        connection,
        treasury,
        usdcMint,
        companyUsdc,
        treasury,
        100_000_000_000 // 100,000 USDC
      );

      await program.methods
        .createCampaign(params)
        .accounts({
          campaign: campaignPda,
          escrow: campaignEscrow,
          protocolConfig,
          company: company.publicKey,
          paymentMint: usdcMint,
          companyTokenAccount: companyUsdc,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([company])
        .rpc();

      const campaign = await program.account.campaign.fetch(campaignPda);
      expect(campaign.company.toBase58()).to.equal(company.publicKey.toBase58());
      expect(campaign.commissionRateBps).to.equal(1000);
      expect(campaign.autoApprove).to.be.true;
    });

    it("funds a campaign", async () => {
      const fundAmount = new anchor.BN(10_000_000_000); // 10,000 USDC

      const companyUsdc = await createAccount(
        connection,
        company,
        usdcMint,
        company.publicKey
      );

      await mintTo(
        connection,
        treasury,
        usdcMint,
        companyUsdc,
        treasury,
        fundAmount.toNumber()
      );

      await program.methods
        .fundCampaign(fundAmount)
        .accounts({
          campaign: campaignPda,
          escrow: campaignEscrow,
          company: company.publicKey,
          companyTokenAccount: companyUsdc,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([company])
        .rpc();

      const campaign = await program.account.campaign.fetch(campaignPda);
      expect(campaign.budget.toNumber()).to.be.greaterThan(0);
    });

    it("pauses and resumes a campaign", async () => {
      // Pause
      await program.methods
        .pauseCampaign()
        .accounts({
          campaign: campaignPda,
          company: company.publicKey,
        })
        .signers([company])
        .rpc();

      let campaign = await program.account.campaign.fetch(campaignPda);
      expect(campaign.status).to.deep.equal({ paused: {} });

      // Resume
      await program.methods
        .resumeCampaign()
        .accounts({
          campaign: campaignPda,
          company: company.publicKey,
        })
        .signers([company])
        .rpc();

      campaign = await program.account.campaign.fetch(campaignPda);
      expect(campaign.status).to.deep.equal({ active: {} });
    });
  });

  describe("Affiliate Management", () => {
    before(async () => {
      // Derive affiliate profile PDA
      [affiliateProfile] = PublicKey.findProgramAddressSync(
        [Buffer.from("affiliate_profile"), affiliate.publicKey.toBuffer()],
        program.programId
      );

      // Derive affiliate registration PDA
      [affiliateRegistration] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("affiliate_registration"),
          affiliateProfile.toBuffer(),
          campaignPda.toBuffer(),
        ],
        program.programId
      );
    });

    it("creates an affiliate profile", async () => {
      await program.methods
        .createAffiliateProfile()
        .accounts({
          affiliateProfile,
          wallet: affiliate.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([affiliate])
        .rpc();

      const profile = await program.account.affiliateProfile.fetch(
        affiliateProfile
      );
      expect(profile.wallet.toBase58()).to.equal(
        affiliate.publicKey.toBase58()
      );
      expect(profile.tier).to.deep.equal({ new: {} });
    });

    it("joins a campaign", async () => {
      await program.methods
        .joinCampaign()
        .accounts({
          affiliateRegistration,
          affiliateProfile,
          campaign: campaignPda,
          wallet: affiliate.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([affiliate])
        .rpc();

      const registration = await program.account.affiliateRegistration.fetch(
        affiliateRegistration
      );
      expect(registration.campaign.toBase58()).to.equal(campaignPda.toBase58());
      // Auto-approve is enabled, so status should be active
      expect(registration.status).to.deep.equal({ active: {} });
    });
  });

  describe("Bridge Management", () => {
    before(async () => {
      // Derive bridge PDA
      [bridgePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("bridge"), bridgeOperator.publicKey.toBuffer()],
        program.programId
      );
    });

    it("registers a bridge operator", async () => {
      const region = [85, 83, 0, 0]; // "US"
      const metadataUri = "https://bridge.example.com/metadata.json";

      await program.methods
        .registerBridge(region, metadataUri)
        .accounts({
          bridge: bridgePda,
          operator: bridgeOperator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([bridgeOperator])
        .rpc();

      const bridge = await program.account.bridge.fetch(bridgePda);
      expect(bridge.operator.toBase58()).to.equal(
        bridgeOperator.publicKey.toBase58()
      );
      expect(bridge.tier).to.deep.equal({ bronze: {} });
    });
  });

  describe("Attribution", () => {
    let attributionPda: PublicKey;

    it("records an attribution", async () => {
      // Generate random customer hash and nonce
      const customerHash = Buffer.alloc(32);
      crypto.getRandomValues(customerHash);

      const nonce = Buffer.alloc(16);
      crypto.getRandomValues(nonce);

      // Derive attribution PDA
      const attributionCount = (
        await program.account.campaign.fetch(campaignPda)
      ).totalAttributions;

      [attributionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("attribution"),
          campaignPda.toBuffer(),
          attributionCount.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const params = {
        actionValue: new anchor.BN(100_000_000), // $100 purchase
        customerHash: Array.from(customerHash),
        nonce: Array.from(nonce),
        fraudScore: 10, // Low fraud score
      };

      await program.methods
        .recordAttribution(params)
        .accounts({
          attribution: attributionPda,
          campaign: campaignPda,
          affiliateRegistration,
          bridge: bridgePda,
          protocolConfig,
          bridgeOperator: bridgeOperator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([bridgeOperator])
        .rpc();

      const attribution = await program.account.attribution.fetch(
        attributionPda
      );
      expect(attribution.campaign.toBase58()).to.equal(campaignPda.toBase58());
      expect(attribution.actionValue.toNumber()).to.equal(100_000_000);
      expect(attribution.status).to.deep.equal({ pending: {} });
    });
  });

  describe("Governance", () => {
    let governanceConfig: PublicKey;
    let protocolParams: PublicKey;
    let votingEscrow: PublicKey;

    before(async () => {
      [governanceConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from("governance")],
        program.programId
      );

      [protocolParams] = PublicKey.findProgramAddressSync(
        [Buffer.from("protocol_params")],
        program.programId
      );

      [votingEscrow] = PublicKey.findProgramAddressSync(
        [Buffer.from("voting_escrow"), provider.wallet.publicKey.toBuffer()],
        program.programId
      );
    });

    it("initializes governance", async () => {
      const proposalThreshold = new anchor.BN(1000_000_000_000); // 1000 NJORD
      const quorumBps = 400; // 4%
      const votingPeriod = new anchor.BN(3 * 24 * 60 * 60); // 3 days
      const timelockDelay = new anchor.BN(24 * 60 * 60); // 1 day

      await program.methods
        .initializeGovernance(
          proposalThreshold,
          quorumBps,
          votingPeriod,
          timelockDelay
        )
        .accounts({
          governanceConfig,
          protocolParams,
          authority: provider.wallet.publicKey,
          njordMint,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const config = await program.account.governanceConfig.fetch(
        governanceConfig
      );
      expect(config.quorumBps).to.equal(400);
      expect(config.votingPeriod.toNumber()).to.equal(3 * 24 * 60 * 60);
    });
  });
});
