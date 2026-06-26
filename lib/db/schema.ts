import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core"
import type { KnowledgeNode } from "@/lib/types"

// ---------------------------------------------------------------------------
// Better Auth core tables (camelCase column names match Better Auth defaults)
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ---------------------------------------------------------------------------
// App tables — plain `userId` column for per-user scoping (no FK by default)
// ---------------------------------------------------------------------------

export const studyMap = pgTable(
  "study_map",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    title: text("title").notNull(),
    sourceType: text("sourceType"),
    nodes: jsonb("nodes").$type<KnowledgeNode[]>().notNull().default([]),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userCreatedIdx: index("study_map_user_created_idx").on(table.userId, table.createdAt),
  }),
)

export const nodeProgress = pgTable(
  "node_progress",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    mapId: text("mapId").notNull(),
    nodeId: text("nodeId").notNull(),
    status: text("status").notNull().default("locked"),
    bestScore: integer("bestScore").notNull().default(0),
    mastery: integer("mastery").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userMapNodeIdx: uniqueIndex("node_progress_user_map_node_idx").on(
      table.userId,
      table.mapId,
      table.nodeId,
    ),
  }),
)

export const userStats = pgTable("user_stats", {
  userId: text("userId").primaryKey(),
  streak: integer("streak").notNull().default(0),
  lastActiveDate: text("lastActiveDate"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Rate limiting tracking
export const rateLimit = pgTable(
  "rate_limit",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    action: text("action").notNull(), // "create_map"
    count: integer("count").notNull().default(0),
    windowStart: timestamp("windowStart").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userActionIdx: uniqueIndex("rate_limit_user_action_idx").on(table.userId, table.action),
  }),
)
