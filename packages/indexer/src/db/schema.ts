import {
  pgTable,
  text,
  timestamp,
  bigint,
  integer,
  boolean,
  jsonb,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Campaigns table
export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pubkey: text("pubkey").notNull().unique(),
    company: text("company").notNull(),
    mint: text("mint").notNull(),
    name: text("name").notNull(),
    commissionType: text("commission_type").notNull(), // percentage, fixed, tiered
    commissionValue: bigint("commission_value", { mode: "number" }).notNull(),
    maxCommission: bigint("max_commission", { mode: "number" }),
    budget: bigint("budget", { mode: "number" }).notNull(),
    spent: bigint("spent", { mode: "number" }).notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    isPaused: boolean("is_paused").notNull().default(false),
    startTime: timestamp("start_time"),
    endTime: timestamp("end_time"),
    holdPeriod: integer("hold_period").notNull(), // seconds
    minAffiliateTier: text("min_affiliate_tier").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    companyIdx: index("campaigns_company_idx").on(table.company),
    activeIdx: index("campaigns_active_idx").on(table.isActive),
  })
);

// Affiliates table
export const affiliates = pgTable(
  "affiliates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pubkey: text("pubkey").notNull().unique(),
    wallet: text("wallet").notNull(),
    tier: text("tier").notNull(), // new, verified, trusted, elite
    totalEarnings: bigint("total_earnings", { mode: "number" }).notNull().default(0),
    totalAttributions: integer("total_attributions").notNull().default(0),
    fraudScore: integer("fraud_score").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    walletIdx: index("affiliates_wallet_idx").on(table.wallet),
    tierIdx: index("affiliates_tier_idx").on(table.tier),
  })
);

// Affiliate registrations (per campaign)
export const affiliateRegistrations = pgTable(
  "affiliate_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pubkey: text("pubkey").notNull().unique(),
    affiliateId: uuid("affiliate_id")
      .notNull()
      .references(() => affiliates.id),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    status: text("status").notNull(), // pending, approved, rejected, suspended
    customCommission: bigint("custom_commission", { mode: "number" }),
    totalEarned: bigint("total_earned", { mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    affiliateCampaignIdx: uniqueIndex("affiliate_campaign_idx").on(
      table.affiliateId,
      table.campaignId
    ),
  })
);

// Attributions table
export const attributions = pgTable(
  "attributions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pubkey: text("pubkey").notNull().unique(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    affiliateId: uuid("affiliate_id")
      .notNull()
      .references(() => affiliates.id),
    bridgeId: uuid("bridge_id").references(() => bridges.id),
    customerHash: text("customer_hash").notNull(),
    actionValue: bigint("action_value", { mode: "number" }).notNull(),
    commission: bigint("commission", { mode: "number" }).notNull(),
    status: text("status").notNull(), // pending, held, released, challenged, slashed
    fraudScore: integer("fraud_score").notNull().default(0),
    releaseTime: timestamp("release_time"),
    signature: text("signature").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    campaignIdx: index("attributions_campaign_idx").on(table.campaignId),
    affiliateIdx: index("attributions_affiliate_idx").on(table.affiliateId),
    bridgeIdx: index("attributions_bridge_idx").on(table.bridgeId),
    statusIdx: index("attributions_status_idx").on(table.status),
    createdAtIdx: index("attributions_created_at_idx").on(table.createdAt),
  })
);

// Bridges table
export const bridges = pgTable(
  "bridges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pubkey: text("pubkey").notNull().unique(),
    operator: text("operator").notNull(),
    name: text("name").notNull(),
    tier: text("tier").notNull(), // bronze, silver, gold, platinum
    stakeAmount: bigint("stake_amount", { mode: "number" }).notNull(),
    totalVolume: bigint("total_volume", { mode: "number" }).notNull().default(0),
    totalAttributions: integer("total_attributions").notNull().default(0),
    fraudCount: integer("fraud_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    apiEndpoint: text("api_endpoint"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    operatorIdx: index("bridges_operator_idx").on(table.operator),
    tierIdx: index("bridges_tier_idx").on(table.tier),
  })
);

// Challenges table
export const challenges = pgTable(
  "challenges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pubkey: text("pubkey").notNull().unique(),
    attributionId: uuid("attribution_id")
      .notNull()
      .references(() => attributions.id),
    challenger: text("challenger").notNull(),
    challengerType: text("challenger_type").notNull(), // company, bridge, affiliate
    bondAmount: bigint("bond_amount", { mode: "number" }).notNull(),
    evidenceHash: text("evidence_hash").notNull(),
    status: text("status").notNull(), // pending, resolved_valid, resolved_invalid
    outcome: text("outcome"), // upheld, rejected
    resolvedBy: text("resolved_by"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    attributionIdx: index("challenges_attribution_idx").on(table.attributionId),
    challengerIdx: index("challenges_challenger_idx").on(table.challenger),
    statusIdx: index("challenges_status_idx").on(table.status),
  })
);

// Raw events table for audit trail
export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slot: bigint("slot", { mode: "number" }).notNull(),
    signature: text("signature").notNull().unique(),
    eventType: text("event_type").notNull(),
    programId: text("program_id").notNull(),
    accounts: jsonb("accounts").notNull(),
    data: jsonb("data"),
    timestamp: timestamp("timestamp").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    slotIdx: index("events_slot_idx").on(table.slot),
    typeIdx: index("events_type_idx").on(table.eventType),
    timestampIdx: index("events_timestamp_idx").on(table.timestamp),
  })
);

// Daily stats table for analytics
export const dailyStats = pgTable(
  "daily_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: timestamp("date").notNull(),
    campaignId: uuid("campaign_id").references(() => campaigns.id),
    bridgeId: uuid("bridge_id").references(() => bridges.id),
    totalAttributions: integer("total_attributions").notNull().default(0),
    totalVolume: bigint("total_volume", { mode: "number" }).notNull().default(0),
    totalCommissions: bigint("total_commissions", { mode: "number" }).notNull().default(0),
    uniqueAffiliates: integer("unique_affiliates").notNull().default(0),
    fraudRejections: integer("fraud_rejections").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    dateIdx: index("daily_stats_date_idx").on(table.date),
    dateCampaignIdx: uniqueIndex("daily_stats_date_campaign_idx").on(
      table.date,
      table.campaignId
    ),
  })
);

// Types for inserts and selects
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

export type Affiliate = typeof affiliates.$inferSelect;
export type NewAffiliate = typeof affiliates.$inferInsert;

export type AffiliateRegistration = typeof affiliateRegistrations.$inferSelect;
export type NewAffiliateRegistration = typeof affiliateRegistrations.$inferInsert;

export type Attribution = typeof attributions.$inferSelect;
export type NewAttribution = typeof attributions.$inferInsert;

export type Bridge = typeof bridges.$inferSelect;
export type NewBridge = typeof bridges.$inferInsert;

export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type DailyStat = typeof dailyStats.$inferSelect;
export type NewDailyStat = typeof dailyStats.$inferInsert;
