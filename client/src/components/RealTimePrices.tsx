import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTradingData } from '@/hooks/use-trading-data'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function RealTimePrices() {
  const { tokenPrices } = useTradingData()

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Live Token Prices</CardTitle>
          <span className="text-xs text-muted-foreground">
            Updates every 30 seconds
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tokenPrices.map((token) => (
            <div
              key={token.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${token.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">
                    {token.symbol}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{token.symbol}</p>
                  <p className="text-xs text-muted-foreground">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  ${token.price.toFixed(2)}
                </p>
                <div className="flex items-center text-xs">
                  {token.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-trading-green mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-trading-red mr-1" />
                  )}
                  <span
                    className={
                      token.change >= 0 ? 'text-trading-green' : 'text-trading-red'
                    }
                  >
                    {token.change >= 0 ? '+' : ''}
                    {token.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
