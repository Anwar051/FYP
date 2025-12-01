
import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  text,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";


export const difficultyEnum = pgEnum("difficulty", ["Easy", "Medium", "Hard"]);
export const purposeEnum = pgEnum("purpose", ["exam", "job", "practice", "coding", "other"]);
export const requestStatusEnum = pgEnum("request_status", [
  "queued",
  "processing",
  "completed",
  "failed",
  "canceled",
]);


export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  clerkId: varchar("clerk_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  credits: integer("credits").notNull().default(5),
  usedCredits: integer("used_credits").notNull().default(0),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).notNull().default("free"), // 'free' | 'pro' | 'unlimited'
  subscriptionExpires: timestamp("subscription_expires", { withTimezone: true }),
});

export const studyMaterials = pgTable("studymaterials", {
  id: serial("id").primaryKey(),
  courseId: varchar("course_id", { length: 64 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  difficultyLevel: varchar("difficulty_level", { length: 16 }).notNull().default("Easy"),
  courseLayout: jsonb("course_layout").default({}),
  createdBy: varchar("created_by", { length: 64 }).notNull(),

  requestId: integer("request_id")
    .references(() => studyRequests.id, { onDelete: "cascade" })
    .unique(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  status: varchar("status", { length: 32 }).notNull().default("generating"),
});


export const studyRequests = pgTable("study_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  purpose: purposeEnum("purpose").notNull(),
  topic: text("topic").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),

  status: requestStatusEnum("status").notNull().default("queued"),

  model: varchar("model", { length: 100 }),

  prompt: text("prompt"),
  output: text("output"),
  error: text("error"),

  creditsUsed: integer("credits_used").notNull().default(1),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const creditLedger = pgTable("credit_ledger", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  requestId: integer("request_id").references(() => studyRequests.id, {
    onDelete: "set null",
  }),

  delta: integer("delta").notNull(), // + add, − spend
  reason: varchar("reason", { length: 80 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dashboardItems = pgTable("dashboard_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  materialId: integer("material_id")
    .notNull()
    .references(() => studyMaterials.id, { onDelete: "cascade" }),

  progress: integer("progress").notNull().default(0),

  requestId: integer("request_id")
    .references(() => studyRequests.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
