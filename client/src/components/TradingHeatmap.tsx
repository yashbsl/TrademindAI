import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Zap, Activity, Flame } from 'lucide-react'
import { useTradingData } from '@/hooks/use-trading-data'

interface HeatmapCell {
  symbol: string
  name: string
  price: number
  change: number
  volume: number
  signal: 'BUY' | 'SELL' | 'HOLD'
  strength: number
  momentum: number
}

export function TradingHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([])
  const [sortBy, setSortBy] = useState<'change' | 'volume' | 'strength'>('change')
  const { tokenPrices } = useTradingData()

  useEffect(() => {
    // Generate enhanced heatmap data
    const generateHeatmap = () => {
      const cryptoTokens = [
        'BNB', 'BTC', 'ETH', 'ADA', 'SOL', 'MATIC', 'DOT', 'AVAX',
        'CAKE', 'UNI', 'LINK', 'LTC', 'XRP', 'DOGE', 'SHIB', 'ATOM'
      ]

      const data = cryptoTokens.map((symbol, index) => {
        const basePrice = tokenPrices.find(t => t.symbol === symbol)?.price || 
          (Math.random() * 1000 + 10)
        
        const change = tokenPrices.find(t => t.symbol === symbol)?.change || 
          (Math.random() - 0.5) * 20
        
        const volume = Math.random() * 10000 + 1000
        const momentum = Math.sin(Date.now() / 10000 + index) * 50 + 50
        const strength = Math.min(95, Math.abs(change) * 5 + Math.random() * 30)
        
        let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
        if (change > 2 && momentum > 60) signal = 'BUY'
        else if (change < -2 && momentum < 40) signal = 'SELL'

        return {
          symbol,
          name: symbol === 'BNB' ? 'BNB' : `${symbol} Token`,
          price: Math.round(basePrice * 100) / 100,
          change: Math.round(change * 100) / 100,
          volume: Math.round(volume),
          signal,
          strength: Math.round(strength),
          momentum: Math.round(momentum)
        }
      })

      return data.sort((a, b) => {
        switch (sortBy) {
          case 'change': return Math.abs(b.change) - Math.abs(a.change)
          case 'volume': return b.volume - a.volume
          case 'strength': return b.strength - a.strength
          default: return 0
        }
      })
    }

    setHeatmapData(generateHeatmap())
  }, [tokenPrices, sortBy])

  const getIntensityColor = (change: number, signal: string) => {
    const intensity = Math.min(Math.abs(change) / 10, 1)
    
    if (signal === 'BUY') {
      return `rgba(34, 197, 94, ${0.1 + intensity * 0.8})`
    } else if (signal === 'SELL') {
      return `rgba(239, 68, 68, ${0.1 + intensity * 0.8})`
    } else {
      return `rgba(156, 163, 175, ${0.1 + intensity * 0.3})`
    }
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="h-3 w-3" />
      case 'SELL': return <TrendingDown className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Market Heatmap
          <Badge variant="outline" className="animate-pulse">
            <Activity className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        </CardTitle>
        
        <div className="flex gap-1">
          {(['change', 'volume', 'strength'] as const).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(sort)}
              className="h-7 px-2 text-xs"
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {heatmapData.slice(0, 16).map((token, index) => (
            <div
              key={token.symbol}
              className="p-3 rounded-lg border transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
              style={{ backgroundColor: getIntensityColor(token.change, token.signal) }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{token.symbol}</span>
                <Badge
                  variant={token.signal === 'BUY' ? 'default' : token.signal === 'SELL' ? 'destructive' : 'secondary'}
                  className="h-5 px-1 text-xs flex items-center gap-1"
                >
                  {getSignalIcon(token.signal)}
                  {token.signal}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  ${token.price > 1 ? token.price.toFixed(2) : token.price.toFixed(4)}
                </div>
                
                <div className={`text-xs font-semibold ${
                  token.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Vol: {token.volume.toLocaleString()}</span>
                  <span>S: {token.strength}%</span>
                </div>
              </div>
              
              {/* Momentum indicator */}
              <div className="mt-2">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      token.momentum > 50 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${token.momentum}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500/20 rounded border border-green-500/30" />
                <span>Bullish</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500/20 rounded border border-red-500/30" />
                <span>Bearish</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-500/20 rounded border border-gray-500/30" />
                <span>Neutral</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>Signal Strength</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}