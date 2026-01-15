import { z } from "zod";
import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
  password: z.string().min(6),
});

export const otpResendSchema = z.object({
  email: z.string().email(),
});

export const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires: z.string(),
});

export const userInfoSchema = z.object({
  email: z.string().email(),
  id: z.union([z.string(), z.number()]).optional(),
});

export const transferRequestSchema = z.object({
  from_wallet: z.enum(["forex", "arb", "fut"]),
  to_wallet: z.enum(["forex", "arb", "fut"]),
  amount: z.number().positive(),
});

export const notificationSchema = z.object({
  id: z.number(),
  action: z.string(),
  details: z.string().nullable(),
  created_at: z.string(),
});

export const tradeStatusEnum = z.enum(["PENDING", "COMPLETED", "ACTIVE"]);

export const tradeSchema = z.object({
  id: z.union([z.string(), z.number()]),
  symbol: z.string(),
  type: z.string(),
  side: z.string(),
  amount: z.number(),
  price: z.number(),
  status: tradeStatusEnum,
  profit_loss: z.number().optional(),
  created_at: z.string(),
});

export const dashboardStatsSchema = z.object({
  total_balance: z.number(),
  today_pnl: z.number(),
  active_trades: z.number(),
  win_rate: z.number(),
});

export const walletSchema = z.object({
  name: z.string(),
  type: z.enum(["arb", "forex", "fut"]),
  balance: z.number(),
  value: z.number(),
  change_24h: z.number(),
  icon_color: z.string(),
  abbreviation: z.string(),
});

export const arbitrageOpportunitySchema = z.object({
  symbol: z.string(),
  exchange_buy: z.string(),
  exchange_sell: z.string(),
  price_buy: z.number(),
  price_sell: z.number(),
  profit_percentage: z.number(),
  volume: z.number(),
});

export const forexSessionSchema = z.object({
  name: z.string(),
  timezone: z.string(),
  status: z.enum(["open", "closed", "pre-open"]),
  volume: z.enum(["low", "medium", "high"]),
  open_time: z.string(),
  close_time: z.string(),
});

export const futuresPositionSchema = z.object({
  symbol: z.string(),
  side: z.enum(["long", "short"]),
  size: z.number(),
  entry_price: z.number(),
  current_price: z.number(),
  leverage: z.number(),
  pnl: z.number(),
  liquidation_price: z.number(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OTPResendInput = z.infer<typeof otpResendSchema>;
export type Token = z.infer<typeof tokenSchema>;
export type UserInfo = z.infer<typeof userInfoSchema>;
export type TransferRequest = z.infer<typeof transferRequestSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type TradeStatus = z.infer<typeof tradeStatusEnum>;
export type Trade = z.infer<typeof tradeSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type Wallet = z.infer<typeof walletSchema>;
export type ArbitrageOpportunity = z.infer<typeof arbitrageOpportunitySchema>;
export type ForexSession = z.infer<typeof forexSessionSchema>;
export type FuturesPosition = z.infer<typeof futuresPositionSchema>;
