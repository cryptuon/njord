import {
  Connection,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import {
  Campaign,
  AffiliateProfile,
  Bridge,
  ProtocolConfig,
  SEEDS,
} from "./types";

// Program ID - deployed to devnet
export const NJORD_PROGRAM_ID = new PublicKey(
  "Hm5WfS2KL4UPaUqVJ3vadCuPMCftw2oybqvpDr7fn9Hv"
);

export interface NjordClientConfig {
  connection: Connection;
  wallet?: Wallet;
  programId?: PublicKey;
}

export class NjordClient {
  public connection: Connection;
  public programId: PublicKey;
  public wallet?: Wallet;
  private _provider?: AnchorProvider;

  constructor(config: NjordClientConfig) {
    this.connection = config.connection;
    this.programId = config.programId ?? NJORD_PROGRAM_ID;
    this.wallet = config.wallet;

    if (this.wallet) {
      this._provider = new AnchorProvider(
        this.connection,
        this.wallet,
        AnchorProvider.defaultOptions()
      );
    }
  }

  /**
   * Get the Anchor provider instance (only available if wallet was provided)
   */
  get provider(): AnchorProvider | undefined {
    return this._provider;
  }

  // ============== PDA Derivation ==============

  getProtocolConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.PROTOCOL_CONFIG],
      this.programId
    );
  }

  getCampaignPDA(campaignId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.CAMPAIGN, campaignId.toArrayLike(Buffer, "le", 8)],
      this.programId
    );
  }

  getEscrowPDA(campaign: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.ESCROW, campaign.toBuffer()],
      this.programId
    );
  }

  getAffiliateProfilePDA(wallet: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.AFFILIATE_PROFILE, wallet.toBuffer()],
      this.programId
    );
  }

  getAffiliateStakePDA(profile: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.AFFILIATE_STAKE, profile.toBuffer()],
      this.programId
    );
  }

  getAffiliateRegistrationPDA(
    campaign: PublicKey,
    profile: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.AFFILIATE_REGISTRATION, campaign.toBuffer(), profile.toBuffer()],
      this.programId
    );
  }

  getAttributionPDA(campaign: PublicKey, nonce: Uint8Array): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.ATTRIBUTION, campaign.toBuffer(), Buffer.from(nonce)],
      this.programId
    );
  }

  getCustomerAttributionPDA(
    campaign: PublicKey,
    customerHash: Uint8Array
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.CUSTOMER_ATTRIBUTION, campaign.toBuffer(), Buffer.from(customerHash)],
      this.programId
    );
  }

  getBridgePDA(operator: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.BRIDGE, operator.toBuffer()],
      this.programId
    );
  }

  getBridgeStakePDA(bridge: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.BRIDGE_STAKE, bridge.toBuffer()],
      this.programId
    );
  }

  getChallengePDA(attribution: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [SEEDS.CHALLENGE, attribution.toBuffer()],
      this.programId
    );
  }

  // ============== Account Fetching ==============

  async getProtocolConfig(): Promise<ProtocolConfig | null> {
    const [pda] = this.getProtocolConfigPDA();
    try {
      const accountInfo = await this.connection.getAccountInfo(pda);
      if (!accountInfo) return null;
      // Deserialize account data - would use Anchor IDL in production
      return null; // Placeholder
    } catch {
      return null;
    }
  }

  async getCampaign(campaignId: BN): Promise<Campaign | null> {
    const [pda] = this.getCampaignPDA(campaignId);
    try {
      const accountInfo = await this.connection.getAccountInfo(pda);
      if (!accountInfo) return null;
      return null; // Placeholder - deserialize with IDL
    } catch {
      return null;
    }
  }

  async getAffiliateProfile(wallet: PublicKey): Promise<AffiliateProfile | null> {
    const [pda] = this.getAffiliateProfilePDA(wallet);
    try {
      const accountInfo = await this.connection.getAccountInfo(pda);
      if (!accountInfo) return null;
      return null; // Placeholder
    } catch {
      return null;
    }
  }

  async getBridge(operator: PublicKey): Promise<Bridge | null> {
    const [pda] = this.getBridgePDA(operator);
    try {
      const accountInfo = await this.connection.getAccountInfo(pda);
      if (!accountInfo) return null;
      return null; // Placeholder
    } catch {
      return null;
    }
  }

  // ============== Utility Functions ==============

  generateNonce(): Uint8Array {
    return Keypair.generate().publicKey.toBytes().slice(0, 16);
  }

  hashCustomer(identifier: string): Uint8Array {
    // Simple hash - in production use proper cryptographic hash
    const encoder = new TextEncoder();
    const data = encoder.encode(identifier);
    const hash = new Uint8Array(32);
    for (let i = 0; i < data.length; i++) {
      const idx = i % 32;
      const currentValue = hash[idx] ?? 0;
      const dataValue = data[i] ?? 0;
      hash[idx] = currentValue ^ dataValue;
    }
    return hash;
  }

  calculateCommission(value: BN, rateBps: number): BN {
    return value.mul(new BN(rateBps)).div(new BN(10000));
  }

  // ============== Static Helpers ==============

  static fromConnection(connection: Connection): NjordClient {
    return new NjordClient({ connection });
  }

  static fromUrl(rpcUrl: string): NjordClient {
    return new NjordClient({
      connection: new Connection(rpcUrl, "confirmed"),
    });
  }
}

export default NjordClient;
