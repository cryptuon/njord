import { useState, useCallback, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useNjordContext } from "../context";
import { useNjordStore, CampaignData } from "../store";

export interface CreateCampaignParams {
  name: string;
  mint: string | PublicKey;
  commissionType: "percentage" | "fixed" | "tiered";
  commissionValue: number;
  maxCommission?: number;
  budget: number;
  holdPeriod: number;
  minAffiliateTier?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface UseCampaignsResult {
  campaigns: CampaignData[];
  loading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  fetchCampaign: (pubkey: string) => Promise<CampaignData | null>;
  createCampaign: (params: CreateCampaignParams) => Promise<string>;
  pauseCampaign: (pubkey: string) => Promise<void>;
  resumeCampaign: (pubkey: string) => Promise<void>;
  fundCampaign: (pubkey: string, amount: number) => Promise<void>;
}

export function useCampaigns(): UseCampaignsResult {
  const { client, indexerUrl } = useNjordContext();
  const {
    campaigns,
    campaignsLoading,
    campaignsError,
    setCampaigns,
    setCampaignsLoading,
    setCampaignsError,
    addCampaign,
    updateCampaign,
  } = useNjordStore();

  const fetchCampaigns = useCallback(async () => {
    if (!indexerUrl) {
      setCampaignsError("Indexer URL not configured");
      return;
    }

    setCampaignsLoading(true);

    try {
      const response = await fetch(`${indexerUrl}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query GetCampaigns {
              campaigns(isActive: true, limit: 100) {
                nodes {
                  pubkey
                  company
                  name
                  mint
                  commissionType
                  commissionValue
                  budget
                  spent
                  isActive
                  isPaused
                  holdPeriod
                  minAffiliateTier
                }
              }
            }
          `,
        }),
      });

      const { data, errors } = await response.json();
      if (errors) {
        throw new Error(errors[0].message);
      }

      const campaignList = data.campaigns.nodes.map((c: any) => ({
        ...c,
        commissionValue: Number(c.commissionValue),
        budget: Number(c.budget),
        spent: Number(c.spent),
      }));

      setCampaigns(campaignList);
    } catch (err) {
      setCampaignsError(err instanceof Error ? err.message : "Failed to fetch campaigns");
    }
  }, [indexerUrl, setCampaigns, setCampaignsLoading, setCampaignsError]);

  const fetchCampaign = useCallback(
    async (pubkey: string): Promise<CampaignData | null> => {
      if (!indexerUrl) return null;

      try {
        const response = await fetch(`${indexerUrl}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetCampaign($pubkey: String!) {
                campaign(pubkey: $pubkey) {
                  pubkey
                  company
                  name
                  mint
                  commissionType
                  commissionValue
                  budget
                  spent
                  isActive
                  isPaused
                  holdPeriod
                  minAffiliateTier
                }
              }
            `,
            variables: { pubkey },
          }),
        });

        const { data, errors } = await response.json();
        if (errors) throw new Error(errors[0].message);
        if (!data.campaign) return null;

        const campaign: CampaignData = {
          ...data.campaign,
          commissionValue: Number(data.campaign.commissionValue),
          budget: Number(data.campaign.budget),
          spent: Number(data.campaign.spent),
        };

        addCampaign(campaign);
        return campaign;
      } catch (err) {
        console.error("Failed to fetch campaign:", err);
        return null;
      }
    },
    [indexerUrl, addCampaign]
  );

  const createCampaign = useCallback(
    async (params: CreateCampaignParams): Promise<string> => {
      if (!client) throw new Error("Client not initialized");

      const mint =
        typeof params.mint === "string"
          ? new PublicKey(params.mint)
          : params.mint;

      const result = await client.createCampaign({
        name: params.name,
        mint,
        commissionType: params.commissionType,
        commissionValue: params.commissionValue,
        maxCommission: params.maxCommission,
        budget: params.budget,
        holdPeriod: params.holdPeriod,
        minAffiliateTier: params.minAffiliateTier ?? "new",
        startTime: params.startTime,
        endTime: params.endTime,
      });

      // Add to local state
      addCampaign({
        pubkey: result.campaignPda.toBase58(),
        company: client.wallet!.publicKey!.toBase58(),
        name: params.name,
        mint: mint.toBase58(),
        commissionType: params.commissionType,
        commissionValue: params.commissionValue,
        budget: params.budget,
        spent: 0,
        isActive: true,
        isPaused: false,
        holdPeriod: params.holdPeriod,
        minAffiliateTier: params.minAffiliateTier ?? "new",
      });

      return result.campaignPda.toBase58();
    },
    [client, addCampaign]
  );

  const pauseCampaign = useCallback(
    async (pubkey: string): Promise<void> => {
      if (!client) throw new Error("Client not initialized");

      await client.pauseCampaign({ campaign: new PublicKey(pubkey) });
      updateCampaign(pubkey, { isPaused: true });
    },
    [client, updateCampaign]
  );

  const resumeCampaign = useCallback(
    async (pubkey: string): Promise<void> => {
      if (!client) throw new Error("Client not initialized");

      await client.resumeCampaign({ campaign: new PublicKey(pubkey) });
      updateCampaign(pubkey, { isPaused: false });
    },
    [client, updateCampaign]
  );

  const fundCampaign = useCallback(
    async (pubkey: string, amount: number): Promise<void> => {
      if (!client) throw new Error("Client not initialized");

      await client.fundCampaign({
        campaign: new PublicKey(pubkey),
        amount,
      });

      const existing = campaigns.get(pubkey);
      if (existing) {
        updateCampaign(pubkey, { budget: existing.budget + amount });
      }
    },
    [client, campaigns, updateCampaign]
  );

  return {
    campaigns: Array.from(campaigns.values()),
    loading: campaignsLoading,
    error: campaignsError,
    fetchCampaigns,
    fetchCampaign,
    createCampaign,
    pauseCampaign,
    resumeCampaign,
    fundCampaign,
  };
}
