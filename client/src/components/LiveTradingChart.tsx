import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, Dot } from 'recharts'
import { TrendingUp, TrendingDown, Target, Zap, Activity, BarChart3, Maximize2 } from 'lucide-react'
import { useTradingData } from '@/hooks/use-trading-data'

interface PriceDataPoint {
  time: string
  timestamp: number
  price: number
  sma5: number
  sma20: number
  volume: number
  signal?: 'BUY' | 'SELL'
  signalStrength?: number
}

export function LiveTradingChart() {
  const [priceHistory, setPriceHistory] = useState<PriceDataPoint[]>([])
  const [timeframe, setTimeframe] = useState<'5m' | '15m' | '1h' | '4h'>('15m')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { tokenPrices, smaSignals } = useTradingData()
  const intervalRef = useRef<NodeJS.Timeout>()
  const maxDataPoints = 50

  // Get current BNB price
  const currentBNB = tokenPrices.find(token => token.symbol === 'BNB')
  const currentPrice = currentBNB?.price || 0

  useEffect(() => {
    const addDataPoint = () => {
      if (currentPrice === 0) return

      const now = Date.now()
      const timeStr = new Date(now).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })

      // Calculate SMA values with slight variation for realism
      const baseVariation = Math.sin(now / 60000) * 2 // Slower oscillation
      const sma5 = currentPrice + baseVariation + (Math.random() - 0.5) * 1.5
      const sma20 = currentPrice + baseVariation * 0.7 + (Math.random() - 0.5) * 2

      // Determine signal based on SMA crossover
      let signal: 'BUY' | 'SELL' | undefined
      let signalStrength = 0

      if (priceHistory.length > 0) {
        const lastPoint = priceHistory[priceHistory.length - 1]
        const prevSma5 = lastPoint.sma5
        const prevSma20 = lastPoint.sma20

        // Golden cross (BUY signal)
        if (sma5 > sma20 && prevSma5 <= prevSma20) {
          signal = 'BUY'
          signalStrength = Math.min(95, 70 + Math.abs(sma5 - sma20) / currentPrice * 1000)
        }
        // Death cross (SELL signal)  
        else if (sma5 < sma20 && prevSma5 >= prevSma20) {
          signal = 'SELL'
          signalStrength = Math.min(95, 70 + Math.abs(sma5 - sma20) / currentPrice * 1000)
        }
      }

      const newPoint: PriceDataPoint = {
        time: timeStr,
        timestamp: now,
        price: Math.round(currentPrice * 100) / 100,
        sma5: Math.round(sma5 * 100) / 100,
        sma20: Math.round(sma20 * 100) / 100,
        volume: Math.round((Math.random() * 1000 + 500) * 100) / 100,
        signal,
        signalStrength: Math.round(signalStrength)
      }

      setPriceHistory(prev => {
        const updated = [...prev, newPoint]
        return updated.slice(-maxDataPoints)
      })
    }

    // Add initial data point
    addDataPoint()

    // Set up interval based on timeframe
    const intervals = {
      '5m': 5000,   // 5 seconds for demo
      '15m': 10000, // 10 seconds for demo
      '1h': 15000,  // 15 seconds for demo
      '4h': 30000   // 30 seconds for demo
    }

    intervalRef.current = setInterval(addDataPoint, intervals[timeframe])

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentPrice, timeframe])

  const latestData = priceHistory[priceHistory.length - 1]
  const priceChange = priceHistory.length > 1 
    ? latestData?.price - priceHistory[priceHistory.length - 2].price 
    : 0
  const priceChangePercent = priceHistory.length > 1 
    ? (priceChange / priceHistory[priceHistory.length - 2].price) * 100 
    : 0

  // Detect current trend
  const recentPrices = priceHistory.slice(-5).map(p => p.price)
  const isUptrend = recentPrices.length > 1 && 
    recentPrices[recentPrices.length - 1] > recentPrices[0]

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-xl">
          <p className="font-medium text-foreground">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-blue-600 font-semibold">
              Price: ${data.price}
            </p>
            <p className="text-green-600 text-sm">
              SMA5: ${data.sma5}
            </p>
            <p className="text-orange-600 text-sm">
              SMA20: ${data.sma20}
            </p>
            <p className="text-muted-foreground text-sm">
              Volume: {data.volume}
            </p>
            {data.signal && (
              <Badge 
                variant={data.signal === 'BUY' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {data.signal} {data.signalStrength}%
              </Badge>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // Custom dot for signals
  const SignalDot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload.signal) {
      return (
        <Dot
          cx={cx}
          cy={cy}
          r={4}
          fill={payload.signal === 'BUY' ? '#16a34a' : '#dc2626'}
          stroke="#fff"
          strokeWidth={2}
        />
      )
    }
    return null
  }

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : 'col-span-2'} transition-all duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Live BNB/USD Chart
            <Badge variant="outline" className="animate-pulse">
              <Activity className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                ${latestData?.price.toFixed(2) || '0.00'}
              </span>
              <Badge 
                variant={priceChange >= 0 ? 'default' : 'destructive'} 
                className="flex items-center gap-1"
              >
                {priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(3)}%
              </Badge>
            </div>
            
            {latestData?.signal && (
              <Badge 
                variant={latestData.signal === 'BUY' ? 'default' : 'destructive'}
                className="flex items-center gap-1 animate-pulse"
              >
                <Zap className="h-3 w-3" />
                {latestData.signal} {latestData.signalStrength}%
              </Badge>
            )}
            
            <Badge variant="outline" className={isUptrend ? 'text-green-600' : 'text-red-600'}>
              {isUptrend ? '📈 Uptrend' : '📉 Downtrend'}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['5m', '15m', '1h', '4h'] as const).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="h-8 px-3"
              >
                {tf}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={`${isFullscreen ? 'h-[calc(100vh-12rem)]' : 'h-80'} transition-all duration-300`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-30" />
              
              <XAxis 
                dataKey="time" 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              
              <YAxis 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 10 }}
                domain={['dataMin - 2', 'dataMax + 2']}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Price area */}
              <Area
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={<SignalDot />}
              />
              
              {/* SMA Lines */}
              <Line
                type="monotone"
                dataKey="sma5"
                stroke="#16a34a"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 3, stroke: '#16a34a', strokeWidth: 2 }}
              />
              
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#ea580c"
                strokeWidth={1.5}
                strokeDasharray="10 5"
                dot={false}
                activeDot={{ r: 3, stroke: '#ea580c', strokeWidth: 2 }}
              />

              {/* Signal reference lines */}
              {priceHistory.filter(p => p.signal).map((point, index) => (
                <ReferenceLine
                  key={`signal-${index}`}
                  x={point.time}
                  stroke={point.signal === 'BUY' ? '#16a34a' : '#dc2626'}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  opacity={0.7}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">SMA 5</p>
            <p className="font-semibold text-green-600">
              ${latestData?.sma5.toFixed(2) || '0.00'}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">SMA 20</p>
            <p className="font-semibold text-orange-600">
              ${latestData?.sma20.toFixed(2) || '0.00'}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="font-semibold text-blue-600">
              {latestData?.volume.toFixed(0) || '0'}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Data Points</p>
            <p className="font-semibold text-muted-foreground">
              {priceHistory.length}/{maxDataPoints}
            </p>
          </div>
        </div>
        
        {/* Signal History */}
        {priceHistory.filter(p => p.signal).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Recent Signals</p>
            <div className="flex gap-2 flex-wrap">
              {priceHistory
                .filter(p => p.signal)
                .slice(-3)
                .map((point, index) => (
                  <Badge
                    key={index}
                    variant={point.signal === 'BUY' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {point.signal} at ${point.price} ({point.signalStrength}%)
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}