import { gql } from '@urql/vue'

export const BRIDGES_QUERY = gql`
  query Bridges($tier: BridgeTier, $isActive: Boolean, $limit: Int, $offset: Int) {
    bridges(tier: $tier, isActive: $isActive, limit: $limit, offset: $offset) {
      nodes {
        id
        pubkey
        operator
        name
        tier
        stakeAmount
        totalVolume
        totalAttributions
        fraudCount
        isActive
        createdAt
        stats {
          todayVolume
          todayAttributions
          fraudRate
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

export const BRIDGE_DETAIL_QUERY = gql`
  query BridgeDetail($operator: String) {
    bridge(operator: $operator) {
      id
      pubkey
      operator
      name
      tier
      stakeAmount
      totalVolume
      totalAttributions
      fraudCount
      isActive
      createdAt
      stats {
        todayVolume
        todayAttributions
        fraudRate
        averageFraudScore
      }
      attributions(limit: 20) {
        nodes {
          id
          actionValue
          commission
          status
          fraudScore
          createdAt
        }
        totalCount
      }
    }
  }
`
