import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { useNjordContext } from "../context";
import { useNjordStore, AttributionData } from "../store";

export interface UseAttributionsResult {
  attributions: AttributionData[];
  loading: boolean;
  error: string | null;
  fetchAttributions: (params?: FetchAttributionsParams) => Promise<void>;
  fetchAttribution: (pubkey: string) => Promise<AttributionData | null>;
}

export interface FetchAttributionsParams {
  campaignId?: string;
  affiliateId?: string;
  bridgeId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export function useAttributions(): UseAttributionsResult {
  const { indexerUrl } = useNjordContext();
  const {
    attributions,
    attributionsLoading,
    attributionsError,
    setAttributions,
    setAttributionsLoading,
    setAttributionsError,
    addAttribution,
  } = useNjordStore();

  const fetchAttributions = useCallback(
    async (params: FetchAttributionsParams = {}) => {
      if (!indexerUrl) {
        setAttributionsError("Indexer URL not configured");
        return;
      }

      setAttributionsLoading(true);

      try {
        const response = await fetch(`${indexerUrl}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetAttributions(
                $campaignId: ID
                $affiliateId: ID
                $bridgeId: ID
                $status: AttributionStatus
                $startDate: String
                $endDate: String
                $limit: Int
                $offset: Int
              ) {
                attributions(
                  campaignId: $campaignId
                  affiliateId: $affiliateId
                  bridgeId: $bridgeId
                  status: $status
                  startDate: $startDate
                  endDate: $endDate
                  limit: $limit
                  offset: $offset
                ) {
                  nodes {
                    pubkey
                    campaignId: campaign { pubkey }
                    affiliateId: affiliate { pubkey }
                    bridgeId: bridge { pubkey }
                    actionValue
                    commission
                    status
                    fraudScore
                    releaseTime
                    createdAt
                  }
                }
              }
            `,
            variables: {
              ...params,
              startDate: params.startDate?.toISOString(),
              endDate: params.endDate?.toISOString(),
              limit: params.limit ?? 100,
              offset: params.offset ?? 0,
            },
          }),
        });

        const { data, errors } = await response.json();
        if (errors) throw new Error(errors[0].message);

        const attrList: AttributionData[] = data.attributions.nodes.map(
          (a: any) => ({
            pubkey: a.pubkey,
            campaignId: a.campaignId?.pubkey,
            affiliateId: a.affiliateId?.pubkey,
            bridgeId: a.bridgeId?.pubkey,
            actionValue: Number(a.actionValue),
            commission: Number(a.commission),
            status: a.status,
            fraudScore: a.fraudScore,
            releaseTime: a.releaseTime ? new Date(a.releaseTime) : undefined,
            createdAt: new Date(a.createdAt),
          })
        );

        setAttributions(attrList);
      } catch (err) {
        setAttributionsError(
          err instanceof Error ? err.message : "Failed to fetch attributions"
        );
      }
    },
    [indexerUrl, setAttributions, setAttributionsLoading, setAttributionsError]
  );

  const fetchAttribution = useCallback(
    async (pubkey: string): Promise<AttributionData | null> => {
      if (!indexerUrl) return null;

      try {
        const response = await fetch(`${indexerUrl}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetAttribution($pubkey: String!) {
                attribution(pubkey: $pubkey) {
                  pubkey
                  campaign { pubkey }
                  affiliate { pubkey }
                  bridge { pubkey }
                  actionValue
                  commission
                  status
                  fraudScore
                  releaseTime
                  createdAt
                }
              }
            `,
            variables: { pubkey },
          }),
        });

        const { data, errors } = await response.json();
        if (errors) throw new Error(errors[0].message);
        if (!data.attribution) return null;

        const attr: AttributionData = {
          pubkey: data.attribution.pubkey,
          campaignId: data.attribution.campaign?.pubkey,
          affiliateId: data.attribution.affiliate?.pubkey,
          bridgeId: data.attribution.bridge?.pubkey,
          actionValue: Number(data.attribution.actionValue),
          commission: Number(data.attribution.commission),
          status: data.attribution.status,
          fraudScore: data.attribution.fraudScore,
          releaseTime: data.attribution.releaseTime
            ? new Date(data.attribution.releaseTime)
            : undefined,
          createdAt: new Date(data.attribution.createdAt),
        };

        addAttribution(attr);
        return attr;
      } catch (err) {
        console.error("Failed to fetch attribution:", err);
        return null;
      }
    },
    [indexerUrl, addAttribution]
  );

  return {
    attributions: Array.from(attributions.values()),
    loading: attributionsLoading,
    error: attributionsError,
    fetchAttributions,
    fetchAttribution,
  };
}
