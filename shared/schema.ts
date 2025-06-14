import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tradingSignals = pgTable("trading_signals", {
  id: serial("id").primaryKey(),
  pair: text("pair").notNull(),
  signal: text("signal").notNull(), // 'BUY' or 'SELL'
  strategy: text("strategy").notNull(),
  confidence: real("confidence").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  duration: integer("duration").notNull(), // in minutes
  pattern: text("pattern"),
  supportResistance: text("support_resistance"),
  executed: boolean("executed").default(false),
  result: text("result"), // 'WIN', 'LOSS', 'PENDING'
  profitLoss: real("profit_loss").default(0),
});

export const tradingStrategies = pgTable("trading_strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  enabled: boolean("enabled").default(true),
  winRate: real("win_rate").default(0),
  totalTrades: integer("total_trades").default(0),
  totalWins: integer("total_wins").default(0),
});

export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  totalProfit: real("total_profit").default(0),
  totalSignals: integer("total_signals").default(0),
  winRate: real("win_rate").default(0),
  botStatus: text("bot_status").default("active"),
  platform: text("platform").default("quotex"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const chartPatterns = pgTable("chart_patterns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'bullish', 'bearish', 'neutral'
  description: text("description").notNull(),
  accuracy: real("accuracy").default(0),
  minConfidence: real("min_confidence").default(80),
});

// Insert schemas
export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  timestamp: true,
});

export const insertTradingStrategySchema = createInsertSchema(tradingStrategies).omit({
  id: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  lastUpdated: true,
});

export const insertChartPatternSchema = createInsertSchema(chartPatterns).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;
export type TradingStrategy = typeof tradingStrategies.$inferSelect;
export type InsertTradingStrategy = z.infer<typeof insertTradingStrategySchema>;
export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;
export type ChartPattern = typeof chartPatterns.$inferSelect;
export type InsertChartPattern = z.infer<typeof insertChartPatternSchema>;
