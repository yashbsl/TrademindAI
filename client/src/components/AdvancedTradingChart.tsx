import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react'
import { useTradingData } from '@/hooks/use-trading-data'

interface PricePoint {
  time: string
  price: number
  sma5: number
  sma20: number
  signal?: 'BUY' | 'SELL'
}

export function AdvancedTradingChart() {
  const { prices } = useTradingData()
  const [chartData, setChartData] = useState<PricePoint[]>([])
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d'>('1h')

  useEffect(() => {
    // Simulate historical price data with SMA calculations
    const generateChartData = () => {
      const data: PricePoint[] = []
      const currentPrice = prices?.binancecoin?.usd || 668
      const baseTime = Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
      
      for (let i = 0; i < 48; i++) {
        const time = new Date(baseTime + (i * 30 * 60 * 1000)) // 30 min intervals
        const volatility = Math.random() * 20 - 10 // ±10 price variation
        const price = currentPrice + Math.sin(i / 5) * 15 + volatility
        
        // Calculate SMAs (simplified)
        const sma5 = price + Math.sin(i / 3) * 5
        const sma20 = price + Math.sin(i / 8) * 8
        
        // Generate signals based on SMA crossover
        let signal: 'BUY' | 'SELL' | undefined
        if (i > 0) {
          const prevSma5 = data[i-1]?.sma5 || sma5
          const prevSma20 = data[i-1]?.sma20 || sma20
          
          if (sma5 > sma20 && prevSma5 <= prevSma20) {
            signal = 'BUY'
          } else if (sma5 < sma20 && prevSma5 >= prevSma20) {
            signal = 'SELL'
          }
        }
        
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: Math.round(price * 100) / 100,
          sma5: Math.round(sma5 * 100) / 100,
          sma20: Math.round(sma20 * 100) / 100,
          signal
        })
      }
      
      return data
    }

    setChartData(generateChartData())
  }, [prices])

  const currentPrice = prices?.binancecoin?.usd || 0
  const priceChange = prices?.binancecoin?.usd_24h_change || 0
  const latestData = chartData[chartData.length - 1]
  const currentSignal = latestData?.sma5 > latestData?.sma20 ? 'BUY' : 'SELL'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">Price: ${data.price}</p>
          <p className="text-green-600">SMA5: ${data.sma5}</p>
          <p className="text-orange-600">SMA20: ${data.sma20}</p>
          {data.signal && (
            <Badge variant={data.signal === 'BUY' ? 'default' : 'destructive'}>
              {data.signal}
            </Badge>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            BNB/USD Advanced Chart
          </CardTitle>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
              <Badge variant={priceChange >= 0 ? 'default' : 'destructive'} className="flex items-center gap-1">
                {priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {priceChange.toFixed(2)}%
              </Badge>
            </div>
            <Badge variant={currentSignal === 'BUY' ? 'default' : 'destructive'} className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {currentSignal} Signal
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {(['1h', '4h', '1d'] as const).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Price line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                name="Price"
              />
              
              {/* SMA 5 line */}
              <Line
                type="monotone"
                dataKey="sma5"
                stroke="#16a34a"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="SMA 5"
              />
              
              {/* SMA 20 line */}
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#ea580c"
                strokeWidth={1.5}
                strokeDasharray="10 10"
                dot={false}
                name="SMA 20"
              />

              {/* Signal markers */}
              {chartData.map((point, index) => {
                if (point.signal) {
                  return (
                    <ReferenceLine
                      key={index}
                      x={point.time}
                      stroke={point.signal === 'BUY' ? '#16a34a' : '#dc2626'}
                      strokeWidth={2}
                      strokeDasharray="2 2"
                    />
                  )
                }
                return null
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">SMA 5</p>
            <p className="font-semibold text-green-600">${latestData?.sma5.toFixed(2) || '0.00'}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">SMA 20</p>
            <p className="font-semibold text-orange-600">${latestData?.sma20.toFixed(2) || '0.00'}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Signal Strength</p>
            <p className="font-semibold">
              {Math.abs((latestData?.sma5 || 0) - (latestData?.sma20 || 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}