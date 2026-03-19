import { eq, and, gte, lte, desc, count, sql } from "drizzle-orm";
import {
  Database,
  campaigns,
  affiliates,
  affiliateRegistrations,
  attributions,
  bridges,
  challenges,
  dailyStats,
} from "../db";

export function createResolvers(db: Database) {
  return {
    Query: {
      // Campaign queries
      campaign: async (
        _: unknown,
        { id, pubkey }: { id?: string; pubkey?: string }
      ) => {
        const [result] = await db
          .select()
          .from(campaigns)
          .where(id ? eq(campaigns.id, id) : eq(campaigns.pubkey, pubkey!))
          .limit(1);
        return result;
      },

      campaigns: async (
        _: unknown,
        {
          company,
          isActive,
          limit = 20,
          offset = 0,
        }: {
          company?: string;
          isActive?: boolean;
          limit?: number;
          offset?: number;
        }
      ) => {
        const conditions = [];
        if (company) conditions.push(eq(campaigns.company, company));
        if (isActive !== undefined) conditions.push(eq(campaigns.isActive, isActive));

        const [nodes, [{ total }]] = await Promise.all([
          db
            .select()
            .from(campaigns)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(campaigns.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ total: count() })
            .from(campaigns)
            .where(conditions.length > 0 ? and(...conditions) : undefined),
        ]);

        return {
          nodes,
          totalCount: total,
          pageInfo: {
            hasNextPage: offset + nodes.length < total,
            hasPreviousPage: offset > 0,
          },
        };
      },

      // Affiliate queries
      affiliate: async (
        _: unknown,
        { id, pubkey, wallet }: { id?: string; pubkey?: string; wallet?: string }
      ) => {
        const [result] = await db
          .select()
          .from(affiliates)
          .where(
            id
              ? eq(affiliates.id, id)
              : pubkey
              ? eq(affiliates.pubkey, pubkey)
              : eq(affiliates.wallet, wallet!)
          )
          .limit(1);
        return result;
      },

      affiliates: async (
        _: unknown,
        {
          tier,
          limit = 20,
          offset = 0,
        }: { tier?: string; limit?: number; offset?: number }
      ) => {
        const conditions = [];
        if (tier) conditions.push(eq(affiliates.tier, tier.toLowerCase()));

        const [nodes, [{ total }]] = await Promise.all([
          db
            .select()
            .from(affiliates)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(affiliates.totalEarnings))
            .limit(limit)
            .offset(offset),
          db
            .select({ total: count() })
            .from(affiliates)
            .where(conditions.length > 0 ? and(...conditions) : undefined),
        ]);

        return {
          nodes,
          totalCount: total,
          pageInfo: {
            hasNextPage: offset + nodes.length < total,
            hasPreviousPage: offset > 0,
          },
        };
      },

      // Attribution queries
      attribution: async (
        _: unknown,
        { id, pubkey }: { id?: string; pubkey?: string }
      ) => {
        const [result] = await db
          .select()
          .from(attributions)
          .where(id ? eq(attributions.id, id) : eq(attributions.pubkey, pubkey!))
          .limit(1);
        return result;
      },

      attributions: async (
        _: unknown,
        {
          campaignId,
          affiliateId,
          bridgeId,
          status,
          startDate,
          endDate,
          limit = 20,
          offset = 0,
        }: {
          campaignId?: string;
          affiliateId?: string;
          bridgeId?: string;
          status?: string;
          startDate?: string;
          endDate?: string;
          limit?: number;
          offset?: number;
        }
      ) => {
        const conditions = [];
        if (campaignId) conditions.push(eq(attributions.campaignId, campaignId));
        if (affiliateId) conditions.push(eq(attributions.affiliateId, affiliateId));
        if (bridgeId) conditions.push(eq(attributions.bridgeId, bridgeId));
        if (status) conditions.push(eq(attributions.status, status.toLowerCase()));
        if (startDate)
          conditions.push(gte(attributions.createdAt, new Date(startDate)));
        if (endDate) conditions.push(lte(attributions.createdAt, new Date(endDate)));

        const [nodes, [{ total }]] = await Promise.all([
          db
            .select()
            .from(attributions)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(attributions.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ total: count() })
            .from(attributions)
            .where(conditions.length > 0 ? and(...conditions) : undefined),
        ]);

        return {
          nodes,
          totalCount: total,
          pageInfo: {
            hasNextPage: offset + nodes.length < total,
            hasPreviousPage: offset > 0,
          },
        };
      },

      // Bridge queries
      bridge: async (
        _: unknown,
        { id, pubkey, operator }: { id?: string; pubkey?: string; operator?: string }
      ) => {
        const [result] = await db
          .select()
          .from(bridges)
          .where(
            id
              ? eq(bridges.id, id)
              : pubkey
              ? eq(bridges.pubkey, pubkey)
              : eq(bridges.operator, operator!)
          )
          .limit(1);
        return result;
      },

      bridges: async (
        _: unknown,
        {
          tier,
          isActive,
          limit = 20,
          offset = 0,
        }: { tier?: string; isActive?: boolean; limit?: number; offset?: number }
      ) => {
        const conditions = [];
        if (tier) conditions.push(eq(bridges.tier, tier.toLowerCase()));
        if (isActive !== undefined) conditions.push(eq(bridges.isActive, isActive));

        const [nodes, [{ total }]] = await Promise.all([
          db
            .select()
            .from(bridges)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(bridges.totalVolume))
            .limit(limit)
            .offset(offset),
          db
            .select({ total: count() })
            .from(bridges)
            .where(conditions.length > 0 ? and(...conditions) : undefined),
        ]);

        return {
          nodes,
          totalCount: total,
          pageInfo: {
            hasNextPage: offset + nodes.length < total,
            hasPreviousPage: offset > 0,
          },
        };
      },

      // Challenge queries
      challenge: async (
        _: unknown,
        { id, pubkey }: { id?: string; pubkey?: string }
      ) => {
        const [result] = await db
          .select()
          .from(challenges)
          .where(id ? eq(challenges.id, id) : eq(challenges.pubkey, pubkey!))
          .limit(1);
        return result;
      },

      challenges: async (
        _: unknown,
        {
          attributionId,
          challenger,
          status,
          limit = 20,
          offset = 0,
        }: {
          attributionId?: string;
          challenger?: string;
          status?: string;
          limit?: number;
          offset?: number;
        }
      ) => {
        const conditions = [];
        if (attributionId)
          conditions.push(eq(challenges.attributionId, attributionId));
        if (challenger) conditions.push(eq(challenges.challenger, challenger));
        if (status) conditions.push(eq(challenges.status, status.toLowerCase()));

        const [nodes, [{ total }]] = await Promise.all([
          db
            .select()
            .from(challenges)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(challenges.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ total: count() })
            .from(challenges)
            .where(conditions.length > 0 ? and(...conditions) : undefined),
        ]);

        return {
          nodes,
          totalCount: total,
          pageInfo: {
            hasNextPage: offset + nodes.length < total,
            hasPreviousPage: offset > 0,
          },
        };
      },

      // Analytics
      dailyStats: async (
        _: unknown,
        {
          campaignId,
          bridgeId,
          startDate,
          endDate,
        }: {
          campaignId?: string;
          bridgeId?: string;
          startDate: string;
          endDate: string;
        }
      ) => {
        const conditions = [
          gte(dailyStats.date, new Date(startDate)),
          lte(dailyStats.date, new Date(endDate)),
        ];
        if (campaignId) conditions.push(eq(dailyStats.campaignId, campaignId));
        if (bridgeId) conditions.push(eq(dailyStats.bridgeId, bridgeId));

        return db
          .select()
          .from(dailyStats)
          .where(and(...conditions))
          .orderBy(dailyStats.date);
      },

      globalStats: async () => {
        const [campaignStats] = await db
          .select({
            total: count(),
            active: count(campaigns.isActive),
          })
          .from(campaigns);

        const [affiliateStats] = await db
          .select({ total: count() })
          .from(affiliates);

        const [bridgeStats] = await db.select({ total: count() }).from(bridges);

        const [attributionStats] = await db
          .select({
            total: count(),
            volume: sql<number>`COALESCE(SUM(action_value), 0)`,
            commissions: sql<number>`COALESCE(SUM(commission), 0)`,
          })
          .from(attributions);

        const [challengeStats] = await db
          .select({
            total: count(),
            resolved: sql<number>`COUNT(*) FILTER (WHERE status LIKE 'resolved%')`,
            upheld: sql<number>`COUNT(*) FILTER (WHERE outcome = 'upheld')`,
          })
          .from(challenges);

        return {
          totalCampaigns: campaignStats.total,
          activeCampaigns: campaignStats.active,
          totalAffiliates: affiliateStats.total,
          totalBridges: bridgeStats.total,
          totalAttributions: attributionStats.total,
          totalVolume: String(attributionStats.volume),
          totalCommissions: String(attributionStats.commissions),
          totalChallenges: challengeStats.total,
          challengeSuccessRate:
            challengeStats.resolved > 0
              ? challengeStats.upheld / challengeStats.resolved
              : 0,
        };
      },
    },

    // Field resolvers for relations
    Campaign: {
      affiliates: async (
        parent: { id: string },
        { limit = 20, offset = 0 }: { limit?: number; offset?: number }
      ) => {
        const regs = await db
          .select()
          .from(affiliateRegistrations)
          .where(eq(affiliateRegistrations.campaignId, parent.id))
          .limit(limit)
          .offset(offset);

        const affiliateIds = regs.map((r) => r.affiliateId);
        if (affiliateIds.length === 0) {
          return { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false } };
        }

        const nodes = await db
          .select()
          .from(affiliates)
          .where(sql`${affiliates.id} IN ${affiliateIds}`);

        return {
          nodes,
          totalCount: nodes.length,
          pageInfo: { hasNextPage: false, hasPreviousPage: offset > 0 },
        };
      },

      attributions: async (
        parent: { id: string },
        { limit = 20, offset = 0 }: { limit?: number; offset?: number }
      ) => {
        const [nodes, [{ total }]] = await Promise.all([
          db
            .select()
            .from(attributions)
            .where(eq(attributions.campaignId, parent.id))
            .orderBy(desc(attributions.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ total: count() })
            .from(attributions)
            .where(eq(attributions.campaignId, parent.id)),
        ]);

        return {
          nodes,
          totalCount: total,
          pageInfo: {
            hasNextPage: offset + nodes.length < total,
            hasPreviousPage: offset > 0,
          },
        };
      },

      stats: async (parent: { id: string }) => {
        const [stats] = await db
          .select({
            totalAttributions: count(),
            totalVolume: sql<number>`COALESCE(SUM(action_value), 0)`,
            totalCommissions: sql<number>`COALESCE(SUM(commission), 0)`,
            averageFraudScore: sql<number>`COALESCE(AVG(fraud_score), 0)`,
            fraudRejections: sql<number>`COUNT(*) FILTER (WHERE status = 'slashed')`,
          })
          .from(attributions)
          .where(eq(attributions.campaignId, parent.id));

        const [{ uniqueAffiliates }] = await db
          .select({
            uniqueAffiliates: sql<number>`COUNT(DISTINCT affiliate_id)`,
          })
          .from(attributions)
          .where(eq(attributions.campaignId, parent.id));

        return {
          ...stats,
          totalVolume: String(stats.totalVolume),
          totalCommissions: String(stats.totalCommissions),
          uniqueAffiliates,
        };
      },
    },

    Affiliate: {
      registrations: async (parent: { id: string }) => {
        return db
          .select()
          .from(affiliateRegistrations)
          .where(eq(affiliateRegistrations.affiliateId, parent.id));
      },

      attributions: async (
        parent: { id: string },
        { limit = 20, offset = 0 }: { limit?: number; offset?: number }
      ) => {
        const [nodes, [{ total }]] = await Promise.all([
          db
            .select()
            .from(attributions)
            .where(eq(attributions.affiliateId, parent.id))
            .orderBy(desc(attributions.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ total: count() })
            .from(attributions)
            .where(eq(attributions.affiliateId, parent.id)),
        ]);

        return {
          nodes,
          totalCount: total,
          pageInfo: {
            hasNextPage: offset + nodes.length < total,
            hasPreviousPage: offset > 0,
          },
        };
      },
    },

    Attribution: {
      campaign: async (parent: { campaignId: string }) => {
        const [result] = await db
          .select()
          .from(campaigns)
          .where(eq(campaigns.id, parent.campaignId))
          .limit(1);
        return result;
      },

      affiliate: async (parent: { affiliateId: string }) => {
        const [result] = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.id, parent.affiliateId))
          .limit(1);
        return result;
      },

      bridge: async (parent: { bridgeId: string | null }) => {
        if (!parent.bridgeId) return null;
        const [result] = await db
          .select()
          .from(bridges)
          .where(eq(bridges.id, parent.bridgeId))
          .limit(1);
        return result;
      },

      challenges: async (parent: { id: string }) => {
        return db
          .select()
          .from(challenges)
          .where(eq(challenges.attributionId, parent.id));
      },
    },

    Bridge: {
      attributions: async (
        parent: { id: string },
        { limit = 20, offset = 0 }: { limit?: number; offset?: number }
      ) => {
        const [nodes, [{ total }]] = await Promise.all([
          db
            .select()
            .from(attributions)
            .where(eq(attributions.bridgeId, parent.id))
            .orderBy(desc(attributions.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ total: count() })
            .from(attributions)
            .where(eq(attributions.bridgeId, parent.id)),
        ]);

        return {
          nodes,
          totalCount: total,
          pageInfo: {
            hasNextPage: offset + nodes.length < total,
            hasPreviousPage: offset > 0,
          },
        };
      },

      stats: async (parent: { id: string }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [stats] = await db
          .select({
            todayVolume: sql<number>`COALESCE(SUM(action_value) FILTER (WHERE created_at >= ${today}), 0)`,
            todayAttributions: sql<number>`COUNT(*) FILTER (WHERE created_at >= ${today})`,
            totalAttributions: count(),
            slashed: sql<number>`COUNT(*) FILTER (WHERE status = 'slashed')`,
            averageFraudScore: sql<number>`COALESCE(AVG(fraud_score), 0)`,
          })
          .from(attributions)
          .where(eq(attributions.bridgeId, parent.id));

        return {
          todayVolume: String(stats.todayVolume),
          todayAttributions: stats.todayAttributions,
          fraudRate:
            stats.totalAttributions > 0
              ? stats.slashed / stats.totalAttributions
              : 0,
          averageFraudScore: stats.averageFraudScore,
        };
      },
    },

    Challenge: {
      attribution: async (parent: { attributionId: string }) => {
        const [result] = await db
          .select()
          .from(attributions)
          .where(eq(attributions.id, parent.attributionId))
          .limit(1);
        return result;
      },
    },

    AffiliateRegistration: {
      campaign: async (parent: { campaignId: string }) => {
        const [result] = await db
          .select()
          .from(campaigns)
          .where(eq(campaigns.id, parent.campaignId))
          .limit(1);
        return result;
      },
    },
  };
}
