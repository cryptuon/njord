export { useCampaigns } from "./useCampaigns";
export type { CreateCampaignParams, UseCampaignsResult } from "./useCampaigns";

export { useAffiliate } from "./useAffiliate";
export type {
  RegisterAffiliateParams,
  UseAffiliateResult,
  CampaignRegistration,
} from "./useAffiliate";

export { useAttributions } from "./useAttributions";
export type {
  UseAttributionsResult,
  FetchAttributionsParams,
} from "./useAttributions";

export {
  useAffiliateLink,
  useConversionTracking,
} from "./useAffiliateLink";
export type {
  AffiliateLinkParams,
  UseAffiliateLinkResult,
  StoredAffiliateRef,
  UseConversionTrackingResult,
  TrackConversionParams,
} from "./useAffiliateLink";
