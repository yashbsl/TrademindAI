import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, Target, Zap, Award, Calendar, DollarSign, Activity } from 'lucide-react'
import { useTradingData } from '@/hooks/use-trading-data'

interface PerformanceMetric {
  period: string
  profit: number
  trades: number
  winRate: number
  maxDrawdown: number
  sharpeRatio: number
}

interface TradingStats {
  totalTrades: number
  winningTrades: number
  totalProfit: number
  bestTrade: number
  worstTrade: number
  avgHoldTime: string
}

export function PerformanceAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '1W' | '1M' | '3M'>('1W')
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([])
  const [tradingStats, setTradingStats] = useState<TradingStats>()
  const { stats } = useTradingData()

  useEffect(() => {
    // Generate realistic performance data
    const periods = ['1D', '1W', '1M', '3M']
    const data = periods.map((period, index) => {
      const baseProfit = 500 + index * 200 + Math.sin(Date.now() / 100000 + index) * 100
      return {
        period,
        profit: Math.round(baseProfit * 100) / 100,
        trades: Math.round(20 + index * 15 + Math.random() * 10),
        winRate: Math.round((75 + Math.sin(Date.now() / 50000 + index) * 10) * 100) / 100,
        maxDrawdown: Math.round((5 + Math.random() * 8) * 100) / 100,
        sharpeRatio: Math.round((1.2 + Math.random() * 0.8) * 100) / 100
      }
    })
    setPerformanceData(data)

    // Generate trading statistics
    setTradingStats({
      totalTrades: 127,
      winningTrades: 96,
      totalProfit: 2847.65,
      bestTrade: 185.32,
      worstTrade: -67.89,
      avgHoldTime: '2h 34m'
    })
  }, [])

  const currentData = performanceData.find(d => d.period === selectedPeriod)
  
  // Portfolio allocation data
  const allocationData = [
    { name: 'BNB', value: 45, color: '#F0B90B' },
    { name: 'ETH', value: 25, color: '#627EEA' },
    { name: 'BTC', value: 15, color: '#F7931A' },
    { name: 'Other', value: 15, color: '#8B5CF6' }
  ]

  // Daily PnL data
  const dailyPnLData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    pnl: Math.sin(i / 3) * 50 + Math.random() * 40 - 20
  }))

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Performance Analytics
          </CardTitle>
          
          <div className="flex gap-1">
            {(['1D', '1W', '1M', '3M'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="h-8 px-3"
              >
                {period}
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Profit</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    ${currentData?.profit.toFixed(2) || '0.00'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Win Rate</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {currentData?.winRate.toFixed(1) || '0'}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Trades</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {currentData?.trades || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Sharpe Ratio</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {currentData?.sharpeRatio.toFixed(2) || '0.00'}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Risk Metrics
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Max Drawdown</span>
                    <span className="text-red-600">{currentData?.maxDrawdown.toFixed(1) || '0'}%</span>
                  </div>
                  <Progress value={currentData?.maxDrawdown || 0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Risk Score</span>
                    <span className="text-yellow-600">Medium</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Volatility</span>
                    <span className="text-orange-600">12.3%</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Trading Statistics
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Trade:</span>
                  <span className="text-green-600 font-semibold">+${tradingStats?.bestTrade.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Worst Trade:</span>
                  <span className="text-red-600 font-semibold">${tradingStats?.worstTrade.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Hold Time:</span>
                  <span className="font-semibold">{tradingStats?.avgHoldTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-semibold">
                    {tradingStats ? Math.round((tradingStats.winningTrades / tradingStats.totalTrades) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily PnL Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily PnL (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPnLData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="day" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'PnL']}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Bar 
                    dataKey="pnl" 
                    fill={(data: any) => data.pnl >= 0 ? '#22c55e' : '#ef4444'}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-700 dark:text-yellow-300">Profit Master</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">10+ Profitable Days</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold text-blue-700 dark:text-blue-300">Sharp Shooter</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">80%+ Win Rate</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">Trend Rider</p>
                <p className="text-xs text-green-600 dark:text-green-400">50+ Successful Trades</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
              <Zap className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-semibold text-purple-700 dark:text-purple-300">Speed Trader</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Fast Execution</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}