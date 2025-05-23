import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useTradingData } from '@/hooks/use-trading-data'

export function SMAStrategy() {
  const { smaSignals } = useTradingData()

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'bg-trading-green'
      case 'SELL':
        return 'bg-trading-red'
      default:
        return 'bg-gray-500'
    }
  }

  const getSignalTextColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'text-trading-green'
      case 'SELL':
        return 'text-trading-red'
      default:
        return 'text-muted-foreground'
    }
  }

  const getTokenSymbol = (tokenId: string) => {
    switch (tokenId) {
      case 'binancecoin':
        return 'BNB'
      case 'pancakeswap-token':
        return 'CAKE'
      case 'ethereum':
        return 'ETH'
      default:
        return tokenId.toUpperCase()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>SMA Strategy Status</CardTitle>
          <Badge className="bg-trading-green text-white">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {smaSignals.map((signal, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {getTokenSymbol(signal.token)}/USDT
                </span>
                <span className={`text-sm font-medium ${getSignalTextColor(signal.type)}`}>
                  {signal.type} Signal
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    SMA5: <span className="text-blue-500">${signal.sma5?.toFixed(2)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    SMA20: <span className="text-orange-500">${signal.sma20?.toFixed(2)}</span>
                  </span>
                </div>
                <Progress 
                  value={signal.confidence} 
                  className="w-full h-2"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="text-muted-foreground">{signal.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
          
          {smaSignals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading strategy signals...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
