import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTradingData } from '@/hooks/use-trading-data'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

export default function Signals() {
  const { smaSignals, tokenPrices } = useTradingData()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const simulateTradeMutation = useMutation({
    mutationFn: async (data: { token: string; action: string; amount: string }) => {
      const response = await apiRequest('POST', '/api/simulate-trade', {
        ...data,
        strategyId: 1,
        walletId: 1,
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] })
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] })
      toast({
        title: "Trade Simulated",
        description: "Your trade has been executed successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

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

  const getTokenPrice = (tokenId: string) => {
    const token = tokenPrices.find(t => t.id === tokenId)
    return token?.price || 0
  }

  const handleSimulateTrade = (token: string, action: string) => {
    simulateTradeMutation.mutate({
      token,
      action,
      amount: '1.0', // Simulate with 1 token
    })
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-8 w-8 text-trading-yellow" />
            Trading Signals
          </h1>
          <p className="mt-2 text-muted-foreground">
            AI-powered SMA crossover signals for BNB Chain tokens
          </p>
        </div>

        {/* Live Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {smaSignals.map((signal, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${getSignalColor(signal.type)}`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-trading-blue rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {getTokenSymbol(signal.token)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {getTokenSymbol(signal.token)}/USDT
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ${getTokenPrice(signal.token).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getSignalColor(signal.type)} text-white`}>
                    {signal.type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Signal Strength */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{signal.confidence}%</span>
                    </div>
                    <Progress value={signal.confidence} className="h-2" />
                  </div>

                  {/* SMA Values */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-muted-foreground">SMA5</p>
                      <p className="font-semibold text-blue-500">
                        ${signal.sma5?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-muted-foreground">SMA20</p>
                      <p className="font-semibold text-orange-500">
                        ${signal.sma20?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {signal.type !== 'HOLD' && (
                    <Button
                      onClick={() => handleSimulateTrade(signal.token, signal.type)}
                      disabled={simulateTradeMutation.isPending}
                      className={`w-full ${
                        signal.type === 'BUY' 
                          ? 'bg-trading-green hover:bg-trading-green/90' 
                          : 'bg-trading-red hover:bg-trading-red/90'
                      }`}
                    >
                      {simulateTradeMutation.isPending ? 'Processing...' : `Simulate ${signal.type}`}
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    Signal generated {formatDistanceToNow(new Date(signal.triggeredAt || Date.now()), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Signals State */}
        {smaSignals.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analyzing Market Data
              </h3>
              <p className="text-muted-foreground mb-4">
                AI is processing real-time price data to generate trading signals.
                Signals will appear here when market conditions meet strategy criteria.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-medium text-foreground mb-2">Strategy: SMA Crossover</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• BUY when SMA5 crosses above SMA20</li>
                  <li>• SELL when SMA5 crosses below SMA20</li>
                  <li>• Confidence based on crossover strength</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategy Information */}
        <Card>
          <CardHeader>
            <CardTitle>SMA Crossover Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-trading-green mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">Buy Signal</h4>
                <p className="text-sm text-muted-foreground">
                  Generated when the 5-period SMA crosses above the 20-period SMA
                </p>
              </div>
              <div className="text-center">
                <TrendingDown className="h-8 w-8 text-trading-red mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">Sell Signal</h4>
                <p className="text-sm text-muted-foreground">
                  Generated when the 5-period SMA crosses below the 20-period SMA
                </p>
              </div>
              <div className="text-center">
                <Activity className="h-8 w-8 text-trading-blue mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">Confidence Score</h4>
                <p className="text-sm text-muted-foreground">
                  Based on the strength and momentum of the crossover
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}