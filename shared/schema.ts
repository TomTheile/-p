import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with Roblox account linking
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).unique(),
  password: varchar("password", { length: 255 }),
  robloxUserId: varchar("roblox_user_id", { length: 50 }).unique(),
  robloxUsername: varchar("roblox_username", { length: 100 }),
  robloxCookie: varchar("roblox_cookie", { length: 1000 }),
  isVerified: boolean("is_verified").default(false),
  isPremium: boolean("is_premium").default(false),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lua Scripts storage
export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: varchar("name", { length: 200 }).notNull(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(false),
  executions: integer("executions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security logs
export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Execution logs
export const executionLogs = pgTable("execution_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  scriptId: integer("script_id").references(() => scripts.id),
  gameId: varchar("game_id", { length: 50 }),
  executionTime: integer("execution_time"),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  robloxUserId: true,
  robloxUsername: true,
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  executions: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Script = typeof scripts.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;
