import { gql } from '@urql/vue'

export const AFFILIATES_QUERY = gql`
  query Affiliates($tier: AffiliateTier, $limit: Int, $offset: Int) {
    affiliates(tier: $tier, limit: $limit, offset: $offset) {
      nodes {
        id
        pubkey
        wallet
        tier
        totalEarnings
        totalAttributions
        fraudScore
        isActive
        createdAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const AFFILIATE_DETAIL_QUERY = gql`
  query AffiliateDetail($wallet: String) {
    affiliate(wallet: $wallet) {
      id
      pubkey
      wallet
      tier
      totalEarnings
      totalAttributions
      fraudScore
      isActive
      createdAt
      registrations(limit: 50) {
        id
        campaign {
          id
          name
          commissionType
          commissionValue
          isActive
        }
        status
        totalEarned
        createdAt
      }
      attributions(limit: 20) {
        nodes {
          id
          actionValue
          commission
          status
          fraudScore
          createdAt
          campaign {
            id
            name
          }
        }
        totalCount
      }
    }
  }
`
