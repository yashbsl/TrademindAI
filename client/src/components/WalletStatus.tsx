import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, CheckCircle, AlertCircle, ExternalLink, Zap, RefreshCw } from 'lucide-react'
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { bsc } from 'wagmi/chains'
import { useToast } from '@/hooks/use-toast'

export function WalletStatus() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, error, isLoading } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletInstalled, setWalletInstalled] = useState(false)

  useEffect(() => {
    // Check if MetaMask is installed
    const checkWallet = () => {
      const isInstalled = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
      setWalletInstalled(isInstalled)
    }
    checkWallet()
  }, [])

  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address,
    chainId: bsc.id,
  })

  const handleConnect = async () => {
    if (!walletInstalled) {
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    setIsConnecting(true)
    try {
      const connector = connectors.find(c => c.id === 'injected') || connectors[0]
      await connect({ connector })
      
      toast({
        title: "🎉 Wallet Connected!",
        description: "Successfully connected to your MetaMask wallet",
      })
    } catch (error: any) {
      console.error('Connection error:', error)
      toast({
        title: "Connection Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    }
    setIsConnecting(false)
  }

  const handleSwitchToBSC = async () => {
    try {
      await switchChain({ chainId: bsc.id })
      toast({
        title: "Network Switched",
        description: "Successfully switched to BNB Smart Chain",
      })
    } catch (error: any) {
      toast({
        title: "Network Switch Failed", 
        description: "Please switch to BNB Smart Chain manually in MetaMask",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (bal: any) => {
    if (!bal) return '0.00'
    return parseFloat(bal.formatted).toFixed(4)
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Wallet Status
        </CardTitle>
        {isConnected && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Wallet not connected</span>
            </div>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Connect your MetaMask wallet to enable live trading and portfolio tracking on BNB Smart Chain
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{formatAddress(address!)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://bscscan.com/address/${address}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge variant={chain?.id === bsc.id ? "default" : "destructive"}>
                  {chain?.name || "Unknown"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">BNB Balance:</span>
                <span className="text-sm font-semibold">
                  {formatBalance(balance)} BNB
                </span>
              </div>
            </div>
            
            {chain?.id !== bsc.id && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Please switch to BNB Smart Chain for trading
                </p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}