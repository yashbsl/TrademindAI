import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTradingData } from '@/hooks/use-trading-data'
import { formatDistanceToNow } from 'date-fns'

export function TradeHistory() {
  const { trades } = useTradingData()

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
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
              {trades.slice(0, 10).map((trade, index) => (
                <tr key={index}>
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
          
          {trades.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No trades yet. Start trading to see your history here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
