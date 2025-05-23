import { 
  users, wallets, strategies, trades, signals, alerts, plans,
  type User, type InsertUser, type Wallet, type InsertWallet,
  type Strategy, type InsertStrategy, type Trade, type InsertTrade,
  type Signal, type InsertSignal, type Alert, type InsertAlert,
  type Plan
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserPlan(id: number, plan: string): Promise<User>;

  // Wallet methods
  getWalletsByUserId(userId: number): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;

  // Strategy methods
  getStrategiesByUserId(userId: number): Promise<Strategy[]>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  updateStrategy(id: number, updates: Partial<Strategy>): Promise<Strategy>;

  // Trade methods
  getTradesByUserId(userId: number): Promise<Trade[]>;
  getTradesByStrategyId(strategyId: number): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;

  // Signal methods
  getSignalsByStrategyId(strategyId: number): Promise<Signal[]>;
  createSignal(signal: InsertSignal): Promise<Signal>;
  getLatestSignals(limit: number): Promise<Signal[]>;

  // Alert methods
  getAlertsByUserId(userId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<Alert>;

  // Plan methods
  getAllPlans(): Promise<Plan[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private wallets: Map<number, Wallet> = new Map();
  private strategies: Map<number, Strategy> = new Map();
  private trades: Map<number, Trade> = new Map();
  private signals: Map<number, Signal> = new Map();
  private alerts: Map<number, Alert> = new Map();
  private plans: Map<number, Plan> = new Map();
  
  private currentUserId = 1;
  private currentWalletId = 1;
  private currentStrategyId = 1;
  private currentTradeId = 1;
  private currentSignalId = 1;
  private currentAlertId = 1;
  private currentPlanId = 1;

  constructor() {
    // Initialize default plans
    this.plans.set(1, {
      id: 1,
      name: "Free",
      price: "0",
      stripePriceId: "price_free",
      features: JSON.stringify(["Basic SMA strategy", "5 trades/day", "Basic alerts"])
    });
    this.plans.set(2, {
      id: 2,
      name: "Pro",
      price: "29.00",
      stripePriceId: process.env.STRIPE_PRICE_ID || "price_pro",
      features: JSON.stringify(["Advanced AI strategies", "Unlimited trades", "Real-time alerts", "Backtesting", "Priority support"])
    });
    this.currentPlanId = 3;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      plan: insertUser.plan || 'free',
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserStripeInfo(id: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, stripeCustomerId, stripeSubscriptionId };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPlan(id: number, plan: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, plan };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return Array.from(this.wallets.values()).filter(wallet => wallet.userId === userId);
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const wallet: Wallet = {
      ...insertWallet,
      id: this.currentWalletId++,
      network: insertWallet.network || 'bsc',
      createdAt: new Date(),
    };
    this.wallets.set(wallet.id, wallet);
    return wallet;
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(wallet => wallet.address === address);
  }

  async getStrategiesByUserId(userId: number): Promise<Strategy[]> {
    return Array.from(this.strategies.values()).filter(strategy => strategy.userId === userId);
  }

  async createStrategy(insertStrategy: InsertStrategy): Promise<Strategy> {
    const strategy: Strategy = {
      ...insertStrategy,
      id: this.currentStrategyId++,
      createdAt: new Date(),
    };
    this.strategies.set(strategy.id, strategy);
    return strategy;
  }

  async updateStrategy(id: number, updates: Partial<Strategy>): Promise<Strategy> {
    const strategy = this.strategies.get(id);
    if (!strategy) throw new Error("Strategy not found");
    
    const updatedStrategy = { ...strategy, ...updates };
    this.strategies.set(id, updatedStrategy);
    return updatedStrategy;
  }

  async getTradesByUserId(userId: number): Promise<Trade[]> {
    const userWallets = await this.getWalletsByUserId(userId);
    const walletIds = userWallets.map(w => w.id);
    return Array.from(this.trades.values())
      .filter(trade => walletIds.includes(trade.walletId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getTradesByStrategyId(strategyId: number): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .filter(trade => trade.strategyId === strategyId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const trade: Trade = {
      ...insertTrade,
      id: this.currentTradeId++,
      timestamp: new Date(),
    };
    this.trades.set(trade.id, trade);
    return trade;
  }

  async getSignalsByStrategyId(strategyId: number): Promise<Signal[]> {
    return Array.from(this.signals.values())
      .filter(signal => signal.strategyId === strategyId)
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  async createSignal(insertSignal: InsertSignal): Promise<Signal> {
    const signal: Signal = {
      ...insertSignal,
      id: this.currentSignalId++,
      triggeredAt: new Date(),
    };
    this.signals.set(signal.id, signal);
    return signal;
  }

  async getLatestSignals(limit: number): Promise<Signal[]> {
    return Array.from(this.signals.values())
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, limit);
  }

  async getAlertsByUserId(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const alert: Alert = {
      ...insertAlert,
      id: this.currentAlertId++,
      sentAt: new Date(),
    };
    this.alerts.set(alert.id, alert);
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert> {
    const alert = this.alerts.get(id);
    if (!alert) throw new Error("Alert not found");
    
    const updatedAlert = { ...alert, read: true };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async getAllPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        stripeCustomerId: insertUser.stripeCustomerId || null,
        stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
        plan: insertUser.plan || 'free',
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, stripeSubscriptionId })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserPlan(id: number, plan: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ plan })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db
      .insert(wallets)
      .values({
        ...insertWallet,
        network: insertWallet.network || 'bsc',
      })
      .returning();
    return wallet;
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.address, address));
    return wallet || undefined;
  }

  async getStrategiesByUserId(userId: number): Promise<Strategy[]> {
    return await db.select().from(strategies).where(eq(strategies.userId, userId));
  }

  async createStrategy(insertStrategy: InsertStrategy): Promise<Strategy> {
    const [strategy] = await db
      .insert(strategies)
      .values({
        ...insertStrategy,
        type: insertStrategy.type || 'sma_crossover',
        active: insertStrategy.active !== undefined ? insertStrategy.active : true,
      })
      .returning();
    return strategy;
  }

  async updateStrategy(id: number, updates: Partial<Strategy>): Promise<Strategy> {
    const [strategy] = await db
      .update(strategies)
      .set(updates)
      .where(eq(strategies.id, id))
      .returning();
    if (!strategy) throw new Error("Strategy not found");
    return strategy;
  }

  async getTradesByUserId(userId: number): Promise<Trade[]> {
    const userWallets = await this.getWalletsByUserId(userId);
    const walletIds = userWallets.map(w => w.id);
    
    if (walletIds.length === 0) return [];
    
    return await db
      .select()
      .from(trades)
      .where(eq(trades.walletId, walletIds[0])) // Simplified for now
      .orderBy(desc(trades.timestamp));
  }

  async getTradesByStrategyId(strategyId: number): Promise<Trade[]> {
    return await db
      .select()
      .from(trades)
      .where(eq(trades.strategyId, strategyId))
      .orderBy(desc(trades.timestamp));
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const [trade] = await db
      .insert(trades)
      .values({
        ...insertTrade,
        pnl: insertTrade.pnl || null,
      })
      .returning();
    return trade;
  }

  async getSignalsByStrategyId(strategyId: number): Promise<Signal[]> {
    return await db
      .select()
      .from(signals)
      .where(eq(signals.strategyId, strategyId))
      .orderBy(desc(signals.triggeredAt));
  }

  async createSignal(insertSignal: InsertSignal): Promise<Signal> {
    const [signal] = await db
      .insert(signals)
      .values({
        ...insertSignal,
        sma5: insertSignal.sma5 || null,
        sma20: insertSignal.sma20 || null,
      })
      .returning();
    return signal;
  }

  async getLatestSignals(limit: number): Promise<Signal[]> {
    return await db
      .select()
      .from(signals)
      .orderBy(desc(signals.triggeredAt))
      .limit(limit);
  }

  async getAlertsByUserId(userId: number): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.sentAt));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values({
        ...insertAlert,
        type: insertAlert.type || 'info',
        signalId: insertAlert.signalId || null,
        read: insertAlert.read !== undefined ? insertAlert.read : false,
      })
      .returning();
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert> {
    const [alert] = await db
      .update(alerts)
      .set({ read: true })
      .where(eq(alerts.id, id))
      .returning();
    if (!alert) throw new Error("Alert not found");
    return alert;
  }

  async getAllPlans(): Promise<Plan[]> {
    return await db.select().from(plans);
  }
}

export const storage = new DatabaseStorage();
