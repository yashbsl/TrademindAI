import { StatsOverview } from '@/components/StatsOverview'
import { RealTimePrices } from '@/components/RealTimePrices'
import { SMAStrategy } from '@/components/SMAStrategy'
import { TradeHistory } from '@/components/TradeHistory'
import { ActiveAlerts } from '@/components/ActiveAlerts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'wouter'
import { Crown } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Trading Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor your AI-powered trading strategies and performance
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RealTimePrices />
          <SMAStrategy />
        </div>

        {/* Trade History and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TradeHistory />
          </div>
          <ActiveAlerts />
        </div>

        {/* Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border rounded-lg p-6">
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-foreground">Free Plan</h4>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    $0<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Basic SMA strategy
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    5 simulated trades/day
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Basic alerts
                  </li>
                </ul>
                <Button variant="secondary" className="w-full mt-6" disabled>
                  Current Plan
                </Button>
              </div>

              <div className="border-2 border-trading-blue rounded-lg p-6 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-trading-blue text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-foreground">Pro Plan</h4>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    $29<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Advanced AI strategies
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Unlimited simulated trades
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Real-time alerts
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Backtesting tools
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Priority support
                  </li>
                </ul>
                <Link href="/subscribe">
                  <Button className="w-full mt-6 bg-trading-blue hover:bg-trading-blue/90">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
