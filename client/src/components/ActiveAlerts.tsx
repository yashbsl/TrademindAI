import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useTradingData } from '@/hooks/use-trading-data'
import { formatDistanceToNow } from 'date-fns'

export function ActiveAlerts() {
  const { alerts } = useTradingData()

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert, index) => {
            const Icon = getAlertIcon(alert.type)
            const colors = getAlertColors(alert.type)

            return (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 ${colors.bg} border ${colors.border} rounded-lg`}
              >
                <div className="flex-shrink-0">
                  <Icon className={`h-4 w-4 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {alert.title}
                  </p>
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

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No alerts yet. You'll see trading notifications here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
