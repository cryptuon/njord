// Njord React SDK
// React hooks and components for Njord Protocol integration

// Context and Provider
export {
  NjordProvider,
  useNjordContext,
  useNjordClient,
} from "./context";
export type { NjordContextState, NjordProviderProps } from "./context";

// Hooks
export {
  useCampaigns,
  useAffiliate,
  useAttributions,
  useAffiliateLink,
  useConversionTracking,
} from "./hooks";
export type {
  CreateCampaignParams,
  UseCampaignsResult,
  RegisterAffiliateParams,
  UseAffiliateResult,
  CampaignRegistration,
  UseAttributionsResult,
  FetchAttributionsParams,
  AffiliateLinkParams,
  UseAffiliateLinkResult,
  StoredAffiliateRef,
  UseConversionTrackingResult,
  TrackConversionParams,
} from "./hooks";

// Store
export { useNjordStore } from "./store";
export type {
  NjordState,
  CampaignData,
  AffiliateData,
  AttributionData,
} from "./store";

// Re-export commonly used types from SDK
export {
  AffiliateTier,
  BridgeTier,
  CommissionType,
  AttributionStatus,
  ChallengeStatus,
  NJORD_PROGRAM_ID,
} from "@njord/sdk";
