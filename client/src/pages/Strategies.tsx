import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings, Plus, Activity, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const strategySchema = z.object({
  name: z.string().min(1, 'Strategy name is required'),
  type: z.string().default('sma_crossover'),
  params: z.object({
    shortPeriod: z.number().min(1).max(50).default(5),
    longPeriod: z.number().min(1).max(200).default(20),
    tokens: z.array(z.string()).default(['binancecoin', 'pancakeswap-token', 'ethereum']),
  }),
  active: z.boolean().default(true),
})

type StrategyForm = z.infer<typeof strategySchema>

export default function Strategies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['/api/strategies'],
  })

  const form = useForm<StrategyForm>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      name: '',
      type: 'sma_crossover',
      params: {
        shortPeriod: 5,
        longPeriod: 20,
        tokens: ['binancecoin', 'pancakeswap-token', 'ethereum'],
      },
      active: true,
    },
  })

  const createStrategyMutation = useMutation({
    mutationFn: async (data: StrategyForm) => {
      const response = await apiRequest('POST', '/api/strategies', data)
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] })
      setIsDialogOpen(false)
      form.reset()
      toast({
        title: "Strategy Created",
        description: "Your new trading strategy has been created successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: StrategyForm) => {
    createStrategyMutation.mutate(data)
  }

  const getTokenName = (tokenId: string) => {
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

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-8 w-8 text-trading-blue" />
              Trading Strategies
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your AI-powered trading strategies
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-trading-blue hover:bg-trading-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                New Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Strategy</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Strategy Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="My SMA Strategy"
                    className="mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shortPeriod">Short Period (SMA5)</Label>
                    <Input
                      id="shortPeriod"
                      type="number"
                      {...form.register('params.shortPeriod', { valueAsNumber: true })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longPeriod">Long Period (SMA20)</Label>
                    <Input
                      id="longPeriod"
                      type="number"
                      {...form.register('params.longPeriod', { valueAsNumber: true })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    {...form.register('active')}
                  />
                  <Label htmlFor="active">Active Strategy</Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-trading-blue hover:bg-trading-blue/90"
                  disabled={createStrategyMutation.isPending}
                >
                  {createStrategyMutation.isPending ? 'Creating...' : 'Create Strategy'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Strategies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy: any) => (
            <Card key={strategy.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">
                      {strategy.type.replace('_', ' ')}
                    </p>
                  </div>
                  <Badge 
                    className={strategy.active ? 'bg-trading-green' : 'bg-gray-500'}
                  >
                    {strategy.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Strategy Parameters */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="font-medium text-foreground mb-2">Parameters</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Short SMA:</span>
                        <span className="ml-1 font-medium">{strategy.params?.shortPeriod || 5}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Long SMA:</span>
                        <span className="ml-1 font-medium">{strategy.params?.longPeriod || 20}</span>
                      </div>
                    </div>
                  </div>

                  {/* Supported Tokens */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Tokens</h4>
                    <div className="flex flex-wrap gap-1">
                      {(strategy.params?.tokens || ['binancecoin', 'pancakeswap-token', 'ethereum']).map((token: string) => (
                        <Badge key={token} variant="outline" className="text-xs">
                          {getTokenName(token)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Strategy Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <TrendingUp className="h-4 w-4 text-trading-green mx-auto mb-1" />
                      <p className="font-medium">0</p>
                      <p className="text-muted-foreground text-xs">Signals</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <Activity className="h-4 w-4 text-trading-blue mx-auto mb-1" />
                      <p className="font-medium">0</p>
                      <p className="text-muted-foreground text-xs">Trades</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Created {formatDistanceToNow(new Date(strategy.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {strategies.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Strategies Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI trading strategy to start generating signals
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-trading-blue hover:bg-trading-blue/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Strategy
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Strategy Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About SMA Crossover Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                The Simple Moving Average (SMA) Crossover strategy is a popular technical analysis tool 
                that generates trading signals based on the intersection of two moving averages.
              </p>
              <ul className="list-disc list-inside space-y-1 mt-4">
                <li><strong>Buy Signal:</strong> When the short-term SMA crosses above the long-term SMA</li>
                <li><strong>Sell Signal:</strong> When the short-term SMA crosses below the long-term SMA</li>
                <li><strong>Confidence:</strong> Based on the strength and momentum of the crossover</li>
                <li><strong>Risk Management:</strong> All trades are simulated for learning purposes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}