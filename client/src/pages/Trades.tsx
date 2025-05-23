import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTradingData } from '@/hooks/use-trading-data'
import { formatDistanceToNow } from 'date-fns'
import { History, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export default function Trades() {
  const { trades, stats } = useTradingData()

  const getActionColor = (action: string) => {
    return action === 'BUY' ? 'bg-trading-green' : 'bg-trading-red'
  }

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? 'text-trading-green' : 'text-trading-red'
  }

  const getTokenColor = (token: string) => {
    switch (token) {
      case 'binancecoin':
        return 'bg-yellow-500'
      case 'pancakeswap-token':
        return 'bg-purple-500'
      case 'ethereum':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTokenSymbol = (token: string) => {
    switch (token) {
      case 'binancecoin':
        return 'BNB'
      case 'pancakeswap-token':
        return 'CAKE'
      case 'ethereum':
        return 'ETH'
      default:
        return token.toUpperCase()
    }
  }

  const totalTrades = trades.length
  const profitableTrades = trades.filter((t: any) => parseFloat(t.pnl || '0') > 0).length
  const winRate = totalTrades > 0 ? ((profitableTrades / totalTrades) * 100).toFixed(1) : '0'

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <History className="h-8 w-8 text-trading-blue" />
            Trade History
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your simulated trading performance and analyze results
          </p>
        </div>

        {/* Trading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-trading-blue mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total PnL</p>
                  <p className={`text-2xl font-bold ${getPnLColor(stats.dailyPnL)}`}>
                    {stats.dailyPnL >= 0 ? '+' : ''}${stats.dailyPnL.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <History className="h-6 w-6 text-trading-green mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold text-foreground">{totalTrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-trading-green mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold text-foreground">{winRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-6 w-6 text-trading-red mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profitable</p>
                  <p className="text-2xl font-bold text-foreground">{profitableTrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trade History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        PnL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trades.map((trade: any, index: number) => (
                      <tr key={index} className="hover:bg-muted/25">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-6 h-6 ${getTokenColor(trade.token)} rounded-full flex items-center justify-center mr-3`}>
                              <span className="text-white text-xs font-bold">
                                {getTokenSymbol(trade.token).slice(0, 2)}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">
                              {getTokenSymbol(trade.token)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${getActionColor(trade.action)} text-white`}>
                            {trade.action}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          ${parseFloat(trade.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {parseFloat(trade.amount).toFixed(4)} {getTokenSymbol(trade.token)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={getPnLColor(parseFloat(trade.pnl || '0'))}>
                            {parseFloat(trade.pnl || '0') >= 0 ? '+' : ''}
                            ${parseFloat(trade.pnl || '0').toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Trades Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start trading by following signals from your AI strategies
                </p>
                <Button className="bg-trading-blue hover:bg-trading-blue/90">
                  View Trading Signals
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trading Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Trading Performance Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-trading-green mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">Risk Management</h4>
                <p className="text-sm text-muted-foreground">
                  Always use stop-losses and position sizing to manage risk effectively
                </p>
              </div>
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-trading-blue mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">Diversification</h4>
                <p className="text-sm text-muted-foreground">
                  Spread trades across multiple tokens to reduce portfolio risk
                </p>
              </div>
              <div className="text-center">
                <History className="h-8 w-8 text-trading-yellow mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">Track Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Regularly analyze your trade history to improve strategy performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}