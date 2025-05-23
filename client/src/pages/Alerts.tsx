import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTradingData } from '@/hooks/use-trading-data'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { Bell, AlertTriangle, CheckCircle, Info, Check } from 'lucide-react'

export default function Alerts() {
  const { alerts } = useTradingData()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest('PATCH', `/api/alerts/${alertId}/read`, {})
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] })
      toast({
        title: "Alert Marked as Read",
        description: "Alert has been marked as read",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return AlertTriangle
      case 'success':
        return CheckCircle
      default:
        return Info
    }
  }

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
        }
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
        }
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
        }
    }
  }

  const unreadAlerts = alerts.filter((alert: any) => !alert.read)
  const readAlerts = alerts.filter((alert: any) => alert.read)

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-8 w-8 text-trading-blue" />
            Trading Alerts
            {unreadAlerts.length > 0 && (
              <Badge className="bg-trading-red text-white ml-2">
                {unreadAlerts.length} new
              </Badge>
            )}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated with your trading signals and system notifications
          </p>
        </div>

        {/* Unread Alerts */}
        {unreadAlerts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-trading-red" />
                Unread Alerts ({unreadAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unreadAlerts.map((alert: any, index: number) => {
                  const Icon = getAlertIcon(alert.type)
                  const colors = getAlertColors(alert.type)

                  return (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-4 ${colors.bg} border ${colors.border} rounded-lg`}
                    >
                      <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {alert.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(alert.sentAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReadMutation.mutate(alert.id)}
                        disabled={markAsReadMutation.isPending}
                        className="flex-shrink-0"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark Read
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>All Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert: any, index: number) => {
                  const Icon = getAlertIcon(alert.type)
                  const colors = getAlertColors(alert.type)

                  return (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-3 border rounded-lg ${
                        alert.read 
                          ? 'bg-muted/25 border-border opacity-75' 
                          : `${colors.bg} ${colors.border}`
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <Icon className={`h-4 w-4 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${alert.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {alert.title}
                          </p>
                          {alert.read && (
                            <Badge variant="outline" className="text-xs">
                              Read
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(alert.sentAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Alerts Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  You'll receive notifications here when your trading strategies generate signals
                </p>
                <Button className="bg-trading-blue hover:bg-trading-blue/90">
                  View Trading Signals
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Alert Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Trading Signals</h4>
                  <p className="text-sm text-muted-foreground">Get notified when AI generates buy/sell signals</p>
                </div>
                <Badge className="bg-trading-green text-white">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Trade Execution</h4>
                  <p className="text-sm text-muted-foreground">Notifications when trades are simulated</p>
                </div>
                <Badge className="bg-trading-green text-white">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">System Updates</h4>
                  <p className="text-sm text-muted-foreground">Important platform and feature announcements</p>
                </div>
                <Badge className="bg-trading-green text-white">Enabled</Badge>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Upgrade to Pro</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get real-time alerts, email notifications, and priority support with TradeMindAI Pro
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-trading-blue hover:bg-trading-blue/90"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}