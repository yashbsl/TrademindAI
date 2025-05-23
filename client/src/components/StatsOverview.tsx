import { Card, CardContent } from '@/components/ui/card'
import { Wallet, Settings, TrendingUp, Zap } from 'lucide-react'
import { useTradingData } from '@/hooks/use-trading-data'

export function StatsOverview() {
  const { stats } = useTradingData()

  const statsData = [
    {
      title: 'Portfolio Value',
      value: `$${stats.portfolioValue.toLocaleString()}`,
      icon: Wallet,
      color: 'text-trading-blue',
    },
    {
      title: 'Active Strategies',
      value: stats.activeStrategies.toString(),
      icon: Settings,
      color: 'text-trading-green',
    },
    {
      title: '24h PnL',
      value: `${stats.dailyPnL >= 0 ? '+' : ''}$${stats.dailyPnL.toFixed(2)}`,
      icon: TrendingUp,
      color: stats.dailyPnL >= 0 ? 'text-trading-green' : 'text-trading-red',
    },
    {
      title: 'Active Signals',
      value: stats.activeSignals.toString(),
      icon: Zap,
      color: 'text-trading-yellow',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statsData.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
