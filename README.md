# 🤖 TradeMindAI - Advanced AI-Powered Trading Platform

An intelligent cryptocurrency trading bot platform for BNB Chain with real-time market analysis, automated trading strategies, and comprehensive portfolio management.

![TradeMindAI Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)

## ✨ Features

### 🎯 Core Trading Features
- **Live Market Data**: Real-time cryptocurrency prices from CoinGecko API
- **AI Trading Signals**: Intelligent SMA crossover analysis with confidence scoring
- **Automated Trading Engine**: Smart execution based on technical indicators
- **MetaMask Integration**: Seamless wallet connection for BNB Smart Chain
- **Multi-Token Support**: BNB, ETH, CAKE, and other major cryptocurrencies

### 📊 Advanced Analytics
- **Interactive Live Charts**: Professional trading charts with multiple timeframes
- **Market Heatmap**: Real-time overview of 16+ cryptocurrencies with signal strength
- **Performance Analytics**: Comprehensive profit tracking and risk metrics
- **Portfolio Management**: Asset allocation visualization and PnL analysis
- **Achievement System**: Trading badges and milestone tracking

### 🛡️ Security & Data
- **PostgreSQL Database**: Persistent storage for all trading data
- **Stripe Integration**: Secure subscription management
- **Authentication System**: User accounts with session management
- **Real-time Updates**: Live data streaming every 30 seconds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- MetaMask wallet (for trading)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/trademindai.git
cd trademindai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/trademindai

# Stripe (Optional - for subscriptions)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Development
NODE_ENV=development
```

4. **Database Setup**
```bash
# Push schema to database
npm run db:push
```

5. **Start the application**
```bash
npm run dev
```

Visit `http://localhost:5000` to access your TradeMindAI platform!

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Charts**: Recharts for advanced data visualization
- **Web3**: Wagmi for MetaMask integration

### Backend (Node.js + Express)
- **API**: RESTful endpoints with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **Payments**: Stripe integration for subscriptions

### Key Components
```
├── client/src/
│   ├── components/          # UI components
│   │   ├── LiveTradingChart.tsx      # Real-time price charts
│   │   ├── AutomatedTradingEngine.tsx # AI trading logic
│   │   ├── TradingHeatmap.tsx        # Market overview
│   │   ├── PerformanceAnalytics.tsx  # Trading analytics
│   │   └── WalletStatus.tsx          # MetaMask integration
│   ├── pages/              # Application pages
│   └── hooks/              # Custom React hooks
├── server/
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   └── db.ts              # Database connection
└── shared/
    └── schema.ts          # Database schema
```

## 📈 Trading Strategies

### SMA Crossover Strategy
- **SMA-5 vs SMA-20**: Short-term vs long-term moving averages
- **Golden Cross**: SMA-5 crosses above SMA-20 → BUY signal
- **Death Cross**: SMA-5 crosses below SMA-20 → SELL signal
- **Confidence Scoring**: Signal strength based on price momentum

### Risk Management
- **Stop Loss**: Automated risk protection
- **Position Sizing**: Dynamic allocation based on confidence
- **Drawdown Monitoring**: Real-time risk assessment
- **Performance Tracking**: Win rate and Sharpe ratio analysis

## 🔧 API Endpoints

### Market Data
- `GET /api/prices` - Live cryptocurrency prices
- `GET /api/sma-signals` - AI trading signals

### Trading
- `POST /api/execute-trade` - Execute automated trades
- `GET /api/trades` - Trading history
- `GET /api/strategies` - Active strategies

### User Management
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/alerts` - Trading alerts

## 🎨 Screenshots

### Live Trading Dashboard
Real-time market data, AI signals, and automated trading controls.

### Market Heatmap
Visual overview of cryptocurrency market with live signal indicators.

### Performance Analytics
Comprehensive trading statistics with profit tracking and risk metrics.

## 🔐 Security Features

- **Secure Authentication**: Session-based user management
- **API Rate Limiting**: Protection against abuse
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **Environment Variables**: Sensitive data protection
- **HTTPS Ready**: SSL/TLS support for production

## 📦 Deployment

### Using Replit (Recommended)
1. Import your GitHub repository to Replit
2. Set environment variables in Replit Secrets
3. Run `npm run dev` to start the application
4. Deploy using Replit Deployments

### Using Vercel/Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set environment variables
4. Deploy automatically on git push

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinGecko API](https://coingecko.com/) for real-time market data
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for data visualization
- [Wagmi](https://wagmi.sh/) for Web3 integration

## 📞 Support

- Create an [Issue](https://github.com/yourusername/trademindai/issues) for bug reports
- Join our [Discord](https://discord.gg/trademindai) for community support
- Follow us on [Twitter](https://twitter.com/trademindai) for updates

---

**⚠️ Disclaimer**: This software is for educational purposes only. Cryptocurrency trading involves substantial risk of loss. Always do your own research and never invest more than you can afford to lose.

**🚀 Start your AI trading journey with TradeMindAI today!**