import { useQuery } from '@tanstack/react-query'

export function useTradingData() {
  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ['/api/prices'],
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: smaSignals, isLoading: signalsLoading } = useQuery({
    queryKey: ['/api/sma-signals'],
    refetchInterval: 30000,
  })

  const { data: trades, isLoading: tradesLoading } = useQuery({
    queryKey: ['/api/trades'],
  })

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/alerts'],
  })

  const { data: strategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['/api/strategies'],
  })

  // Transform prices data for display
  const tokenPrices = prices ? [
    {
      id: 'binancecoin',
      symbol: 'BNB',
      name: 'Binance Coin',
      price: prices.binancecoin?.usd || 0,
      change: prices.binancecoin?.usd_24h_change || 0,
      color: 'bg-yellow-500',
    },
    {
      id: 'pancakeswap-token',
      symbol: 'CAKE',
      name: 'PancakeSwap',
      price: prices['pancakeswap-token']?.usd || 0,
      change: prices['pancakeswap-token']?.usd_24h_change || 0,
      color: 'bg-purple-500',
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      price: prices.ethereum?.usd || 0,
      change: prices.ethereum?.usd_24h_change || 0,
      color: 'bg-blue-500',
    },
  ] : []

  // Calculate portfolio stats
  const portfolioValue = trades?.reduce((total: number, trade: any) => {
    const value = parseFloat(trade.price) * parseFloat(trade.amount)
    return total + (trade.action === 'BUY' ? value : -value)
  }, 10000) || 12450.67 // Starting with mock value

  const dailyPnL = trades?.reduce((total: number, trade: any) => {
    const today = new Date()
    const tradeDate = new Date(trade.timestamp)
    if (tradeDate.toDateString() === today.toDateString()) {
      return total + (parseFloat(trade.pnl) || 0)
    }
    return total
  }, 0) || 0

  const activeStrategies = strategies?.filter((s: any) => s.active).length || 0
  const activeSignals = smaSignals?.filter((s: any) => s.type !== 'HOLD').length || 0

  return {
    tokenPrices,
    smaSignals: smaSignals || [],
    trades: trades || [],
    alerts: alerts?.slice(0, 10) || [], // Latest 10 alerts
    stats: {
      portfolioValue,
      dailyPnL,
      activeStrategies,
      activeSignals,
    },
    isLoading: pricesLoading || signalsLoading || tradesLoading || alertsLoading || strategiesLoading,
  }
}
