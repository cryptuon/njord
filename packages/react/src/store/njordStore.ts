import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";

// Types for stored data
export interface CampaignData {
  pubkey: string;
  company: string;
  name: string;
  mint: string;
  commissionType: string;
  commissionValue: number;
  budget: number;
  spent: number;
  isActive: boolean;
  isPaused: boolean;
  holdPeriod: number;
  minAffiliateTier: string;
}

export interface AffiliateData {
  pubkey: string;
  wallet: string;
  tier: string;
  totalEarnings: number;
  totalAttributions: number;
  fraudScore: number;
  isActive: boolean;
}

export interface AttributionData {
  pubkey: string;
  campaignId: string;
  affiliateId: string;
  bridgeId?: string;
  actionValue: number;
  commission: number;
  status: string;
  fraudScore: number;
  releaseTime?: Date;
  createdAt: Date;
}

export interface NjordState {
  // Campaigns
  campaigns: Map<string, CampaignData>;
  campaignsLoading: boolean;
  campaignsError: string | null;

  // Affiliates
  affiliates: Map<string, AffiliateData>;
  affiliatesLoading: boolean;
  affiliatesError: string | null;

  // Current user's affiliate profile
  myAffiliate: AffiliateData | null;
  myAffiliateLoading: boolean;

  // Attributions
  attributions: Map<string, AttributionData>;
  attributionsLoading: boolean;
  attributionsError: string | null;

  // Actions
  setCampaigns: (campaigns: CampaignData[]) => void;
  setCampaignsLoading: (loading: boolean) => void;
  setCampaignsError: (error: string | null) => void;
  addCampaign: (campaign: CampaignData) => void;
  updateCampaign: (pubkey: string, updates: Partial<CampaignData>) => void;

  setAffiliates: (affiliates: AffiliateData[]) => void;
  setAffiliatesLoading: (loading: boolean) => void;
  setAffiliatesError: (error: string | null) => void;
  addAffiliate: (affiliate: AffiliateData) => void;

  setMyAffiliate: (affiliate: AffiliateData | null) => void;
  setMyAffiliateLoading: (loading: boolean) => void;

  setAttributions: (attributions: AttributionData[]) => void;
  setAttributionsLoading: (loading: boolean) => void;
  setAttributionsError: (error: string | null) => void;
  addAttribution: (attribution: AttributionData) => void;

  reset: () => void;
}

const initialState = {
  campaigns: new Map<string, CampaignData>(),
  campaignsLoading: false,
  campaignsError: null,

  affiliates: new Map<string, AffiliateData>(),
  affiliatesLoading: false,
  affiliatesError: null,

  myAffiliate: null,
  myAffiliateLoading: false,

  attributions: new Map<string, AttributionData>(),
  attributionsLoading: false,
  attributionsError: null,
};

export const useNjordStore = create<NjordState>((set, get) => ({
  ...initialState,

  // Campaign actions
  setCampaigns: (campaigns) =>
    set({
      campaigns: new Map(campaigns.map((c) => [c.pubkey, c])),
      campaignsLoading: false,
      campaignsError: null,
    }),

  setCampaignsLoading: (loading) => set({ campaignsLoading: loading }),

  setCampaignsError: (error) =>
    set({ campaignsError: error, campaignsLoading: false }),

  addCampaign: (campaign) =>
    set((state) => {
      const campaigns = new Map(state.campaigns);
      campaigns.set(campaign.pubkey, campaign);
      return { campaigns };
    }),

  updateCampaign: (pubkey, updates) =>
    set((state) => {
      const campaigns = new Map(state.campaigns);
      const existing = campaigns.get(pubkey);
      if (existing) {
        campaigns.set(pubkey, { ...existing, ...updates });
      }
      return { campaigns };
    }),

  // Affiliate actions
  setAffiliates: (affiliates) =>
    set({
      affiliates: new Map(affiliates.map((a) => [a.pubkey, a])),
      affiliatesLoading: false,
      affiliatesError: null,
    }),

  setAffiliatesLoading: (loading) => set({ affiliatesLoading: loading }),

  setAffiliatesError: (error) =>
    set({ affiliatesError: error, affiliatesLoading: false }),

  addAffiliate: (affiliate) =>
    set((state) => {
      const affiliates = new Map(state.affiliates);
      affiliates.set(affiliate.pubkey, affiliate);
      return { affiliates };
    }),

  setMyAffiliate: (affiliate) => set({ myAffiliate: affiliate }),

  setMyAffiliateLoading: (loading) => set({ myAffiliateLoading: loading }),

  // Attribution actions
  setAttributions: (attributions) =>
    set({
      attributions: new Map(attributions.map((a) => [a.pubkey, a])),
      attributionsLoading: false,
      attributionsError: null,
    }),

  setAttributionsLoading: (loading) => set({ attributionsLoading: loading }),

  setAttributionsError: (error) =>
    set({ attributionsError: error, attributionsLoading: false }),

  addAttribution: (attribution) =>
    set((state) => {
      const attributions = new Map(state.attributions);
      attributions.set(attribution.pubkey, attribution);
      return { attributions };
    }),

  reset: () => set(initialState),
}));
