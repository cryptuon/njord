import { gql } from '@urql/vue'

export const CAMPAIGNS_QUERY = gql`
  query Campaigns($company: String, $isActive: Boolean, $limit: Int, $offset: Int) {
    campaigns(company: $company, isActive: $isActive, limit: $limit, offset: $offset) {
      nodes {
        id
        pubkey
        company
        name
        commissionType
        commissionValue
        budget
        spent
        isActive
        isPaused
        holdPeriod
        minAffiliateTier
        metadata
        createdAt
        stats {
          totalAttributions
          totalVolume
          totalCommissions
          uniqueAffiliates
          fraudRejections
          averageFraudScore
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const CAMPAIGN_DETAIL_QUERY = gql`
  query CampaignDetail($id: ID, $pubkey: String) {
    campaign(id: $id, pubkey: $pubkey) {
      id
      pubkey
      company
      name
      commissionType
      commissionValue
      budget
      spent
      isActive
      isPaused
      startTime
      endTime
      holdPeriod
      minAffiliateTier
      metadata
      createdAt
      updatedAt
      stats {
        totalAttributions
        totalVolume
        totalCommissions
        uniqueAffiliates
        fraudRejections
        averageFraudScore
      }
      affiliates(limit: 10) {
        nodes {
          id
          wallet
          tier
          totalEarnings
          totalAttributions
        }
        totalCount
      }
      attributions(limit: 20) {
        nodes {
          id
          actionValue
          commission
          status
          fraudScore
          signature
          createdAt
        }
        totalCount
      }
    }
  }
`

export interface CampaignNode {
  id: string
  pubkey: string
  company: string
  name: string
  commissionType: string
  commissionValue: string
  budget: string
  spent: string
  isActive: boolean
  isPaused: boolean
  holdPeriod: number
  minAffiliateTier: string
  metadata: Record<string, unknown> | null
  createdAt: string
  stats: {
    totalAttributions: number
    totalVolume: string
    totalCommissions: string
    uniqueAffiliates: number
    fraudRejections: number
    averageFraudScore: number
  }
}
