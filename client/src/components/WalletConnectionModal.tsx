import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/use-wallet'
import { Wallet, ArrowRight } from 'lucide-react'

interface WalletConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const { connectors, connectWallet, isConnecting } = useWallet()

  const handleConnectWallet = async (connector: any) => {
    await connectWallet(connector)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              variant="outline"
              className="w-full flex items-center justify-between p-4 h-auto"
              onClick={() => handleConnectWallet(connector)}
              disabled={isConnecting}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{connector.name}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Make sure you're connected to BNB Smart Chain network
        </p>
      </DialogContent>
    </Dialog>
  )
}
