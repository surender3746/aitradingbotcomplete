import { 
  users, 
  tradingSignals, 
  tradingStrategies, 
  systemMetrics, 
  chartPatterns,
  type User, 
  type InsertUser,
  type TradingSignal,
  type InsertTradingSignal,
  type TradingStrategy,
  type InsertTradingStrategy,
  type SystemMetrics,
  type InsertSystemMetrics,
  type ChartPattern,
  type InsertChartPattern
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trading signal methods
  createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal>;
  getTradingSignals(limit?: number): Promise<TradingSignal[]>;
  updateTradingSignalResult(id: number, result: string, profitLoss: number): Promise<void>;
  getTodaySignals(): Promise<TradingSignal[]>;

  // Trading strategy methods
  getTradingStrategies(): Promise<TradingStrategy[]>;
  updateStrategy(id: number, enabled: boolean): Promise<void>;
  updateStrategyStats(name: string, won: boolean): Promise<void>;

  // System metrics methods
  getSystemMetrics(): Promise<SystemMetrics | undefined>;
  updateSystemMetrics(metrics: Partial<InsertSystemMetrics>): Promise<void>;

  // Chart pattern methods
  getChartPatterns(): Promise<ChartPattern[]>;
  createChartPattern(pattern: InsertChartPattern): Promise<ChartPattern>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tradingSignals: Map<number, TradingSignal>;
  private tradingStrategies: Map<number, TradingStrategy>;
  private systemMetrics: SystemMetrics | undefined;
  private chartPatterns: Map<number, ChartPattern>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.tradingSignals = new Map();
    this.tradingStrategies = new Map();
    this.chartPatterns = new Map();
    this.currentId = 1;
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default ultra-powerful strategies
    const defaultStrategies: TradingStrategy[] = [
      {
        id: 1,
        name: "Triple Confirmation",
        description: "Volume + Price action + S/R confluence",
        enabled: true,
        winRate: 100,
        totalTrades: 23,
        totalWins: 23
      },
      {
        id: 2,
        name: "Fibonacci Golden Ratio",
        description: "61.8% & 38.2% precision entries",
        enabled: true,
        winRate: 97,
        totalTrades: 31,
        totalWins: 30
      },
      {
        id: 3,
        name: "Multi-Timeframe MACD",
        description: "Cross-timeframe momentum analysis",
        enabled: true,
        winRate: 95,
        totalTrades: 42,
        totalWins: 40
      },
      {
        id: 4,
        name: "Smart Money Concepts",
        description: "Institutional order flow detection",
        enabled: true,
        winRate: 98,
        totalTrades: 19,
        totalWins: 19
      },
      {
        id: 5,
        name: "Super Bullish Candle",
        description: "Open=Low, Close=High pattern",
        enabled: true,
        winRate: 100,
        totalTrades: 45,
        totalWins: 45
      },
      {
        id: 6,
        name: "Super Bearish Candle",
        description: "Open=High, Close=Low pattern",
        enabled: true,
        winRate: 98,
        totalTrades: 52,
        totalWins: 51
      },
      {
        id: 7,
        name: "Heikin Ashi Trend Flip",
        description: "Color change + wick analysis",
        enabled: true,
        winRate: 94,
        totalTrades: 67,
        totalWins: 63
      },
      {
        id: 8,
        name: "RSI + EMA Confluence",
        description: "Oversold/Overbought with trend",
        enabled: false,
        winRate: 89,
        totalTrades: 38,
        totalWins: 34
      },
      {
        id: 9,
        name: "Volume Spike Hammer",
        description: "High volume + reversal pattern",
        enabled: true,
        winRate: 96,
        totalTrades: 29,
        totalWins: 28
      }
    ];

    defaultStrategies.forEach(strategy => {
      this.tradingStrategies.set(strategy.id, strategy);
    });

    // Initialize system metrics
    this.systemMetrics = {
      id: 1,
      totalProfit: 2847.50,
      totalSignals: 231,
      winRate: 87.3,
      botStatus: "active",
      platform: "quotex",
      lastUpdated: new Date()
    };

    // Initialize some sample signals
    const sampleSignals: TradingSignal[] = [
      {
        id: 1,
        pair: "EUR/USD",
        signal: "BUY",
        strategy: "Super Bullish Candle",
        confidence: 98,
        timestamp: new Date(),
        duration: 5,
        pattern: "Hammer + Volume",
        supportResistance: "Bounce at 1.0850",
        executed: true,
        result: "WIN",
        profitLoss: 85.00
      },
      {
        id: 2,
        pair: "GBP/JPY",
        signal: "SELL",
        strategy: "Super Bearish Candle",
        confidence: 95,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        duration: 3,
        pattern: "Shooting Star",
        supportResistance: "Reject at 185.20",
        executed: true,
        result: "WIN",
        profitLoss: 92.50
      }
    ];

    sampleSignals.forEach(signal => {
      this.tradingSignals.set(signal.id, signal);
    });

    this.currentId = 10;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTradingSignal(insertSignal: InsertTradingSignal): Promise<TradingSignal> {
    const id = this.currentId++;
    const signal: TradingSignal = { 
      ...insertSignal, 
      id, 
      timestamp: new Date(),
      executed: false,
      profitLoss: 0,
      result: null,
      pattern: insertSignal.pattern || null,
      supportResistance: insertSignal.supportResistance || null
    };
    this.tradingSignals.set(id, signal);
    return signal;
  }

  async getTradingSignals(limit: number = 50): Promise<TradingSignal[]> {
    const signals = Array.from(this.tradingSignals.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return signals.slice(0, limit);
  }

  async updateTradingSignalResult(id: number, result: string, profitLoss: number): Promise<void> {
    const signal = this.tradingSignals.get(id);
    if (signal) {
      signal.result = result;
      signal.profitLoss = profitLoss;
      this.tradingSignals.set(id, signal);
    }
  }

  async getTodaySignals(): Promise<TradingSignal[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.tradingSignals.values())
      .filter(signal => signal.timestamp >= today);
  }

  async getTradingStrategies(): Promise<TradingStrategy[]> {
    return Array.from(this.tradingStrategies.values());
  }

  async updateStrategy(id: number, enabled: boolean): Promise<void> {
    const strategy = this.tradingStrategies.get(id);
    if (strategy) {
      strategy.enabled = enabled;
      this.tradingStrategies.set(id, strategy);
    }
  }

  async updateStrategyStats(name: string, won: boolean): Promise<void> {
    const strategy = Array.from(this.tradingStrategies.values())
      .find(s => s.name === name);
    
    if (strategy) {
      strategy.totalTrades = (strategy.totalTrades || 0) + 1;
      if (won) {
        strategy.totalWins = (strategy.totalWins || 0) + 1;
      }
      strategy.winRate = ((strategy.totalWins || 0) / (strategy.totalTrades || 1)) * 100;
      this.tradingStrategies.set(strategy.id, strategy);
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics | undefined> {
    return this.systemMetrics;
  }

  async updateSystemMetrics(metrics: Partial<InsertSystemMetrics>): Promise<void> {
    if (this.systemMetrics) {
      this.systemMetrics = { 
        ...this.systemMetrics, 
        ...metrics, 
        lastUpdated: new Date() 
      };
    }
  }

  async getChartPatterns(): Promise<ChartPattern[]> {
    return Array.from(this.chartPatterns.values());
  }

  async createChartPattern(insertPattern: InsertChartPattern): Promise<ChartPattern> {
    const id = this.currentId++;
    const pattern: ChartPattern = { 
      ...insertPattern, 
      id,
      accuracy: insertPattern.accuracy || null,
      minConfidence: insertPattern.minConfidence || null
    };
    this.chartPatterns.set(id, pattern);
    return pattern;
  }
}

export const storage = new MemStorage();
