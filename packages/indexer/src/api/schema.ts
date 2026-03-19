import gql from "graphql-tag";

export const typeDefs = gql`
  type Query {
    # Campaign queries
    campaign(id: ID, pubkey: String): Campaign
    campaigns(
      company: String
      isActive: Boolean
      limit: Int
      offset: Int
    ): CampaignConnection!

    # Affiliate queries
    affiliate(id: ID, pubkey: String, wallet: String): Affiliate
    affiliates(
      tier: AffiliateTier
      limit: Int
      offset: Int
    ): AffiliateConnection!

    # Attribution queries
    attribution(id: ID, pubkey: String): Attribution
    attributions(
      campaignId: ID
      affiliateId: ID
      bridgeId: ID
      status: AttributionStatus
      startDate: String
      endDate: String
      limit: Int
      offset: Int
    ): AttributionConnection!

    # Bridge queries
    bridge(id: ID, pubkey: String, operator: String): Bridge
    bridges(
      tier: BridgeTier
      isActive: Boolean
      limit: Int
      offset: Int
    ): BridgeConnection!

    # Challenge queries
    challenge(id: ID, pubkey: String): Challenge
    challenges(
      attributionId: ID
      challenger: String
      status: ChallengeStatus
      limit: Int
      offset: Int
    ): ChallengeConnection!

    # Analytics queries
    dailyStats(
      campaignId: ID
      bridgeId: ID
      startDate: String!
      endDate: String!
    ): [DailyStat!]!

    # Global stats
    globalStats: GlobalStats!
  }

  type Campaign {
    id: ID!
    pubkey: String!
    company: String!
    mint: String!
    name: String!
    commissionType: CommissionType!
    commissionValue: String!
    maxCommission: String
    budget: String!
    spent: String!
    isActive: Boolean!
    isPaused: Boolean!
    startTime: String
    endTime: String
    holdPeriod: Int!
    minAffiliateTier: AffiliateTier!
    metadata: JSON
    createdAt: String!
    updatedAt: String!

    # Relations
    affiliates(limit: Int, offset: Int): AffiliateConnection!
    attributions(limit: Int, offset: Int): AttributionConnection!
    stats: CampaignStats!
  }

  type CampaignStats {
    totalAttributions: Int!
    totalVolume: String!
    totalCommissions: String!
    uniqueAffiliates: Int!
    fraudRejections: Int!
    averageFraudScore: Float!
  }

  type CampaignConnection {
    nodes: [Campaign!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type Affiliate {
    id: ID!
    pubkey: String!
    wallet: String!
    tier: AffiliateTier!
    totalEarnings: String!
    totalAttributions: Int!
    fraudScore: Int!
    isActive: Boolean!
    metadata: JSON
    createdAt: String!
    updatedAt: String!

    # Relations
    registrations(limit: Int, offset: Int): [AffiliateRegistration!]!
    attributions(limit: Int, offset: Int): AttributionConnection!
  }

  type AffiliateRegistration {
    id: ID!
    pubkey: String!
    campaign: Campaign!
    status: RegistrationStatus!
    customCommission: String
    totalEarned: String!
    createdAt: String!
  }

  type AffiliateConnection {
    nodes: [Affiliate!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type Attribution {
    id: ID!
    pubkey: String!
    campaign: Campaign!
    affiliate: Affiliate!
    bridge: Bridge
    customerHash: String!
    actionValue: String!
    commission: String!
    status: AttributionStatus!
    fraudScore: Int!
    releaseTime: String
    signature: String!
    metadata: JSON
    createdAt: String!
    updatedAt: String!

    # Relations
    challenges: [Challenge!]!
  }

  type AttributionConnection {
    nodes: [Attribution!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type Bridge {
    id: ID!
    pubkey: String!
    operator: String!
    name: String!
    tier: BridgeTier!
    stakeAmount: String!
    totalVolume: String!
    totalAttributions: Int!
    fraudCount: Int!
    isActive: Boolean!
    apiEndpoint: String
    metadata: JSON
    createdAt: String!
    updatedAt: String!

    # Relations
    attributions(limit: Int, offset: Int): AttributionConnection!
    stats: BridgeStats!
  }

  type BridgeStats {
    todayVolume: String!
    todayAttributions: Int!
    fraudRate: Float!
    averageFraudScore: Float!
  }

  type BridgeConnection {
    nodes: [Bridge!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type Challenge {
    id: ID!
    pubkey: String!
    attribution: Attribution!
    challenger: String!
    challengerType: ChallengerType!
    bondAmount: String!
    evidenceHash: String!
    status: ChallengeStatus!
    outcome: ChallengeOutcome
    resolvedBy: String
    resolvedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type ChallengeConnection {
    nodes: [Challenge!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type DailyStat {
    id: ID!
    date: String!
    campaign: Campaign
    bridge: Bridge
    totalAttributions: Int!
    totalVolume: String!
    totalCommissions: String!
    uniqueAffiliates: Int!
    fraudRejections: Int!
  }

  type GlobalStats {
    totalCampaigns: Int!
    activeCampaigns: Int!
    totalAffiliates: Int!
    totalBridges: Int!
    totalAttributions: Int!
    totalVolume: String!
    totalCommissions: String!
    totalChallenges: Int!
    challengeSuccessRate: Float!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  enum CommissionType {
    PERCENTAGE
    FIXED
    TIERED
  }

  enum AffiliateTier {
    NEW
    VERIFIED
    TRUSTED
    ELITE
  }

  enum BridgeTier {
    BRONZE
    SILVER
    GOLD
    PLATINUM
  }

  enum AttributionStatus {
    PENDING
    HELD
    RELEASED
    CHALLENGED
    SLASHED
  }

  enum RegistrationStatus {
    PENDING
    APPROVED
    REJECTED
    SUSPENDED
  }

  enum ChallengerType {
    COMPANY
    BRIDGE
    AFFILIATE
  }

  enum ChallengeStatus {
    PENDING
    RESOLVED_VALID
    RESOLVED_INVALID
  }

  enum ChallengeOutcome {
    UPHELD
    REJECTED
  }

  scalar JSON
`;
