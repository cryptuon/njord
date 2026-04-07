import { gql } from '@urql/vue'

export const GLOBAL_STATS_QUERY = gql`
  query GlobalStats {
    globalStats {
      totalCampaigns
      activeCampaigns
      totalAffiliates
      totalBridges
      totalAttributions
      totalVolume
      totalCommissions
      totalChallenges
      challengeSuccessRate
    }
  }
`

export interface GlobalStatsData {
  globalStats: {
    totalCampaigns: number
    activeCampaigns: number
    totalAffiliates: number
    totalBridges: number
    totalAttributions: number
    totalVolume: string
    totalCommissions: string
    totalChallenges: number
    challengeSuccessRate: number
  }
}
