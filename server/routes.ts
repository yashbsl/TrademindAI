import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertWalletSchema, insertStrategySchema, insertTradeSchema, insertSignalSchema, insertAlertSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.sendStatus(401);
    }
    req.user = user;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

// SMA calculation helper
function calculateSMA(prices: number[], period: number): number {
  const relevantPrices = prices.slice(-period);
  return relevantPrices.reduce((sum, price) => sum + price, 0) / relevantPrices.length;
}

// Price history storage for SMA calculations
const priceHistory: { [token: string]: number[] } = {
  'binancecoin': [],
  'pancakeswap-token': [],
  'ethereum': []
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create demo user on startup
  const demoUser = await storage.createUser({
    email: 'demo@trademindai.com',
    password: await bcrypt.hash('demo123', 10),
    plan: 'free'
  });

  // Create demo wallet
  await storage.createWallet({
    userId: demoUser.id,
    address: '0x742d35Cc6635C0532925a3b8D21C2f8E2f4f8E11',
    network: 'bsc'
  });

  // Create demo strategy
  await storage.createStrategy({
    userId: demoUser.id,
    name: 'BNB SMA Strategy',
    type: 'sma_crossover',
    params: { shortPeriod: 5, longPeriod: 20, tokens: ['binancecoin'] },
    active: true
  });

  // Create demo alerts
  await storage.createAlert({
    userId: demoUser.id,
    title: 'Welcome to TradeMindAI!',
    message: 'Your AI trading bot is ready. Start by connecting your MetaMask wallet.',
    type: 'info'
  });

  await storage.createAlert({
    userId: demoUser.id,
    title: 'BNB Buy Signal Generated',
    message: 'SMA5 crossed above SMA20 for BNB - Strong buy signal detected!',
    type: 'success'
  });
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ email, password: hashedPassword, plan: "free" });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ user: { id: user.id, email: user.email, plan: user.plan }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ user: { id: user.id, email: user.email, plan: user.plan }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({ user: { id: req.user.id, email: req.user.email, plan: req.user.plan } });
  });

  // Wallet routes
  app.post("/api/wallets", authenticateToken, async (req: any, res) => {
    try {
      const walletData = insertWalletSchema.parse({ ...req.body, userId: req.user.id });
      
      const existingWallet = await storage.getWalletByAddress(walletData.address);
      if (existingWallet) {
        return res.json(existingWallet);
      }

      const wallet = await storage.createWallet(walletData);
      res.json(wallet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/wallets", authenticateToken, async (req: any, res) => {
    try {
      const wallets = await storage.getWalletsByUserId(req.user.id);
      res.json(wallets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Strategy routes
  app.get("/api/strategies", authenticateToken, async (req: any, res) => {
    try {
      const strategies = await storage.getStrategiesByUserId(req.user.id);
      res.json(strategies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/strategies", authenticateToken, async (req: any, res) => {
    try {
      const strategyData = insertStrategySchema.parse({ ...req.body, userId: req.user.id });
      const strategy = await storage.createStrategy(strategyData);
      res.json(strategy);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Trade routes
  app.get("/api/trades", authenticateToken, async (req: any, res) => {
    try {
      const trades = await storage.getTradesByUserId(req.user.id);
      res.json(trades);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/trades", authenticateToken, async (req: any, res) => {
    try {
      const tradeData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(tradeData);
      res.json(trade);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Signal routes
  app.get("/api/signals/latest", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const signals = await storage.getLatestSignals(limit);
      res.json(signals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Alert routes
  app.get("/api/alerts", authenticateToken, async (req: any, res) => {
    try {
      const alerts = await storage.getAlertsByUserId(req.user.id);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Real-time price data from CoinGecko
  app.get("/api/prices", async (req, res) => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,pancakeswap-token,ethereum&vs_currencies=usd&include_24hr_change=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices from CoinGecko');
      }
      
      const data = await response.json();
      
      // Update price history for SMA calculations
      for (const [tokenId, priceData] of Object.entries(data) as [string, any][]) {
        if (!priceHistory[tokenId]) priceHistory[tokenId] = [];
        priceHistory[tokenId].push(priceData.usd);
        
        // Keep only last 50 prices for SMA calculations
        if (priceHistory[tokenId].length > 50) {
          priceHistory[tokenId] = priceHistory[tokenId].slice(-50);
        }
      }
      
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching prices:', error);
      res.status(500).json({ message: 'Failed to fetch price data' });
    }
  });

  // SMA signals calculation
  app.get("/api/sma-signals", async (req, res) => {
    try {
      const signals = [];
      
      for (const [tokenId, prices] of Object.entries(priceHistory)) {
        if (prices.length >= 20) {
          const sma5 = calculateSMA(prices, 5);
          const sma20 = calculateSMA(prices, 20);
          const currentPrice = prices[prices.length - 1];
          
          let signalType = 'HOLD';
          let confidence = 50;
          
          if (sma5 > sma20) {
            signalType = 'BUY';
            confidence = Math.min(95, 50 + ((sma5 - sma20) / sma20) * 1000);
          } else if (sma5 < sma20) {
            signalType = 'SELL';
            confidence = Math.min(95, 50 + ((sma20 - sma5) / sma5) * 1000);
          }
          
          signals.push({
            token: tokenId,
            type: signalType,
            confidence: Math.round(confidence),
            price: currentPrice,
            sma5: sma5,
            sma20: sma20,
            triggeredAt: new Date()
          });
        }
      }
      
      res.json(signals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Simulate trade based on signal
  app.post("/api/simulate-trade", authenticateToken, async (req: any, res) => {
    try {
      const { token, action, amount, strategyId, walletId } = req.body;
      
      // Get current price
      const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`);
      const priceData = await priceResponse.json();
      const currentPrice = priceData[token]?.usd;
      
      if (!currentPrice) {
        return res.status(400).json({ message: 'Unable to get current price' });
      }
      
      // Calculate simulated PnL (random for demo purposes)
      const pnl = (Math.random() - 0.5) * currentPrice * parseFloat(amount) * 0.1;
      
      const trade = await storage.createTrade({
        strategyId: parseInt(strategyId),
        walletId: parseInt(walletId),
        token,
        action,
        price: currentPrice.toString(),
        amount,
        pnl: pnl.toString()
      });
      
      // Create alert for trade
      await storage.createAlert({
        userId: req.user.id,
        title: `Trade Executed: ${action} ${token}`,
        message: `Successfully ${action.toLowerCase()}ed ${amount} ${token} at $${currentPrice}`,
        type: 'success'
      });
      
      res.json(trade);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe routes
  if (stripe) {
    app.post("/api/create-subscription", authenticateToken, async (req: any, res) => {
      try {
        let user = req.user;

        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
            expand: ['payment_intent']
          });

          return res.json({
            subscriptionId: subscription.id,
            clientSecret: (invoice.payment_intent as any)?.client_secret,
          });
        }

        if (!user.email) {
          throw new Error('No user email on file');
        }

        const customer = await stripe.customers.create({
          email: user.email,
        });

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price: process.env.STRIPE_PRICE_ID || 'price_1234567890',
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        await storage.updateUserStripeInfo(user.id, customer.id, subscription.id);

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
      } catch (error: any) {
        console.error('Stripe error:', error);
        res.status(400).json({ error: { message: error.message } });
      }
    });

    app.get("/api/plans", async (req, res) => {
      try {
        const plans = await storage.getAllPlans();
        res.json(plans);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    });
  } else {
    app.post("/api/create-subscription", (req, res) => {
      res.status(500).json({ message: "Stripe not configured" });
    });
    
    app.get("/api/plans", async (req, res) => {
      try {
        const plans = await storage.getAllPlans();
        res.json(plans);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
