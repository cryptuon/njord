import { useMemo, useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const AFFILIATE_STORAGE_KEY = "njord_affiliate_ref";

export interface AffiliateLinkParams {
  campaignId: string;
  affiliateId: string;
  baseUrl?: string;
}

export interface UseAffiliateLinkResult {
  // Generate affiliate link
  generateLink: (params: AffiliateLinkParams) => string;

  // Parse affiliate params from current URL
  affiliateParams: {
    campaignId: string | null;
    affiliateId: string | null;
  } | null;

  // Store affiliate reference for later attribution
  storeAffiliateRef: () => void;

  // Get stored affiliate reference
  getStoredRef: () => StoredAffiliateRef | null;

  // Clear stored reference (e.g., after successful attribution)
  clearStoredRef: () => void;
}

export interface StoredAffiliateRef {
  campaignId: string;
  affiliateId: string;
  timestamp: number;
  landingUrl: string;
}

export function useAffiliateLink(): UseAffiliateLinkResult {
  // Parse affiliate params from URL
  const affiliateParams = useMemo(() => {
    if (typeof window === "undefined") return null;

    const params = new URLSearchParams(window.location.search);
    const campaignId = params.get("njord_c") || params.get("campaign");
    const affiliateId = params.get("njord_a") || params.get("ref");

    if (!campaignId && !affiliateId) return null;

    return { campaignId, affiliateId };
  }, []);

  // Generate affiliate link
  const generateLink = useCallback(
    ({ campaignId, affiliateId, baseUrl }: AffiliateLinkParams): string => {
      const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
      const url = new URL(base);
      url.searchParams.set("njord_c", campaignId);
      url.searchParams.set("njord_a", affiliateId);
      return url.toString();
    },
    []
  );

  // Store affiliate reference in localStorage
  const storeAffiliateRef = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!affiliateParams?.campaignId || !affiliateParams?.affiliateId) return;

    const ref: StoredAffiliateRef = {
      campaignId: affiliateParams.campaignId,
      affiliateId: affiliateParams.affiliateId,
      timestamp: Date.now(),
      landingUrl: window.location.href,
    };

    try {
      localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(ref));
    } catch {
      // localStorage might not be available
    }
  }, [affiliateParams]);

  // Get stored reference
  const getStoredRef = useCallback((): StoredAffiliateRef | null => {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(AFFILIATE_STORAGE_KEY);
      if (!stored) return null;

      const ref: StoredAffiliateRef = JSON.parse(stored);

      // Check if reference is still valid (30 days expiry)
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - ref.timestamp > thirtyDays) {
        localStorage.removeItem(AFFILIATE_STORAGE_KEY);
        return null;
      }

      return ref;
    } catch {
      return null;
    }
  }, []);

  // Clear stored reference
  const clearStoredRef = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(AFFILIATE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Auto-store reference when landing with affiliate params
  useEffect(() => {
    if (affiliateParams?.campaignId && affiliateParams?.affiliateId) {
      storeAffiliateRef();
    }
  }, [affiliateParams, storeAffiliateRef]);

  return {
    generateLink,
    affiliateParams,
    storeAffiliateRef,
    getStoredRef,
    clearStoredRef,
  };
}

/**
 * Hook for tracking conversions
 */
export interface UseConversionTrackingResult {
  trackConversion: (params: TrackConversionParams) => Promise<void>;
  isTracking: boolean;
}

export interface TrackConversionParams {
  actionValue: number;
  customerId?: string;
  metadata?: Record<string, unknown>;
}

export function useConversionTracking(
  bridgeApiUrl: string
): UseConversionTrackingResult {
  const { getStoredRef, clearStoredRef } = useAffiliateLink();
  const [isTracking, setIsTracking] = React.useState(false);

  const trackConversion = useCallback(
    async (params: TrackConversionParams): Promise<void> => {
      const ref = getStoredRef();
      if (!ref) {
        console.warn("No affiliate reference found");
        return;
      }

      setIsTracking(true);

      try {
        const response = await fetch(`${bridgeApiUrl}/attributions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: ref.campaignId,
            affiliateId: ref.affiliateId,
            actionValue: params.actionValue,
            customerId: params.customerId,
            metadata: {
              ...params.metadata,
              landingUrl: ref.landingUrl,
              referredAt: new Date(ref.timestamp).toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to track conversion");
        }

        // Clear the reference after successful attribution
        clearStoredRef();
      } finally {
        setIsTracking(false);
      }
    },
    [bridgeApiUrl, getStoredRef, clearStoredRef]
  );

  return {
    trackConversion,
    isTracking,
  };
}

// Fix: Import React for useState
import React from "react";
