import { useState, useCallback, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNjordContext } from "../context";
import { useNjordStore, AffiliateData } from "../store";

export interface RegisterAffiliateParams {
  campaign: string | PublicKey;
}

export interface UseAffiliateResult {
  // Current user's affiliate profile
  affiliate: AffiliateData | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchAffiliate: () => Promise<void>;
  registerForCampaign: (params: RegisterAffiliateParams) => Promise<string>;
  stake: (amount: number) => Promise<void>;
  unstake: (amount: number) => Promise<void>;

  // Earnings
  earnings: {
    total: number;
    pending: number;
    released: number;
  };
  fetchEarnings: () => Promise<void>;

  // Registrations
  registrations: CampaignRegistration[];
  fetchRegistrations: () => Promise<void>;
}

export interface CampaignRegistration {
  campaignPubkey: string;
  campaignName: string;
  status: string;
  totalEarned: number;
  createdAt: Date;
}

export function useAffiliate(): UseAffiliateResult {
  const { client, indexerUrl } = useNjordContext();
  const wallet = useWallet();
  const {
    myAffiliate,
    myAffiliateLoading,
    setMyAffiliate,
    setMyAffiliateLoading,
  } = useNjordStore();

  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, released: 0 });
  const [registrations, setRegistrations] = useState<CampaignRegistration[]>([]);

  const fetchAffiliate = useCallback(async () => {
    if (!indexerUrl || !wallet.publicKey) {
      setMyAffiliate(null);
      return;
    }

    setMyAffiliateLoading(true);
    setError(null);

    try {
      const response = await fetch(`${indexerUrl}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query GetAffiliate($wallet: String!) {
              affiliate(wallet: $wallet) {
                pubkey
                wallet
                tier
                totalEarnings
                totalAttributions
                fraudScore
                isActive
              }
            }
          `,
          variables: { wallet: wallet.publicKey.toBase58() },
        }),
      });

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0].message);

      if (data.affiliate) {
        setMyAffiliate({
          ...data.affiliate,
          totalEarnings: Number(data.affiliate.totalEarnings),
        });
      } else {
        setMyAffiliate(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch affiliate");
      setMyAffiliate(null);
    } finally {
      setMyAffiliateLoading(false);
    }
  }, [indexerUrl, wallet.publicKey, setMyAffiliate, setMyAffiliateLoading]);

  const registerForCampaign = useCallback(
    async (params: RegisterAffiliateParams): Promise<string> => {
      if (!client) throw new Error("Client not initialized");

      const campaign =
        typeof params.campaign === "string"
          ? new PublicKey(params.campaign)
          : params.campaign;

      const result = await client.registerAffiliate({ campaign });
      return result.registrationPda.toBase58();
    },
    [client]
  );

  const stake = useCallback(
    async (amount: number): Promise<void> => {
      if (!client) throw new Error("Client not initialized");
      await client.stakeAsAffiliate({ amount });

      // Refresh affiliate data
      await fetchAffiliate();
    },
    [client, fetchAffiliate]
  );

  const unstake = useCallback(
    async (amount: number): Promise<void> => {
      if (!client) throw new Error("Client not initialized");
      await client.unstakeAsAffiliate({ amount });

      // Refresh affiliate data
      await fetchAffiliate();
    },
    [client, fetchAffiliate]
  );

  const fetchEarnings = useCallback(async () => {
    if (!indexerUrl || !myAffiliate) return;

    try {
      const response = await fetch(`${indexerUrl}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query GetAffiliateEarnings($affiliateId: ID!) {
              attributions(affiliateId: $affiliateId, limit: 1000) {
                nodes {
                  commission
                  status
                }
              }
            }
          `,
          variables: { affiliateId: myAffiliate.pubkey },
        }),
      });

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0].message);

      let total = 0;
      let pending = 0;
      let released = 0;

      for (const attr of data.attributions.nodes) {
        const commission = Number(attr.commission);
        total += commission;

        if (attr.status === "held" || attr.status === "pending") {
          pending += commission;
        } else if (attr.status === "released") {
          released += commission;
        }
      }

      setEarnings({ total, pending, released });
    } catch (err) {
      console.error("Failed to fetch earnings:", err);
    }
  }, [indexerUrl, myAffiliate]);

  const fetchRegistrations = useCallback(async () => {
    if (!indexerUrl || !myAffiliate) return;

    try {
      const response = await fetch(`${indexerUrl}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query GetAffiliateRegistrations($affiliateId: ID!) {
              affiliate(id: $affiliateId) {
                registrations {
                  pubkey
                  status
                  totalEarned
                  createdAt
                  campaign {
                    pubkey
                    name
                  }
                }
              }
            }
          `,
          variables: { affiliateId: myAffiliate.pubkey },
        }),
      });

      const { data, errors } = await response.json();
      if (errors) throw new Error(errors[0].message);

      const regs: CampaignRegistration[] = data.affiliate.registrations.map(
        (r: any) => ({
          campaignPubkey: r.campaign.pubkey,
          campaignName: r.campaign.name,
          status: r.status,
          totalEarned: Number(r.totalEarned),
          createdAt: new Date(r.createdAt),
        })
      );

      setRegistrations(regs);
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
    }
  }, [indexerUrl, myAffiliate]);

  // Auto-fetch affiliate when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchAffiliate();
    } else {
      setMyAffiliate(null);
    }
  }, [wallet.connected, wallet.publicKey, fetchAffiliate, setMyAffiliate]);

  return {
    affiliate: myAffiliate,
    loading: myAffiliateLoading,
    error,
    fetchAffiliate,
    registerForCampaign,
    stake,
    unstake,
    earnings,
    fetchEarnings,
    registrations,
    fetchRegistrations,
  };
}
