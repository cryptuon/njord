import { gql } from '@urql/vue'

export const DAILY_STATS_QUERY = gql`
  query DailyStats($campaignId: ID, $bridgeId: ID, $startDate: String!, $endDate: String!) {
    dailyStats(campaignId: $campaignId, bridgeId: $bridgeId, startDate: $startDate, endDate: $endDate) {
      id
      date
      totalAttributions
      totalVolume
      totalCommissions
      uniqueAffiliates
      fraudRejections
    }
  }
`

export interface DailyStatNode {
  id: string
  date: string
  totalAttributions: number
  totalVolume: string
  totalCommissions: string
  uniqueAffiliates: number
  fraudRejections: number
}
