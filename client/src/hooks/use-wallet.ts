import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: wallets } = useQuery({
    queryKey: ['/api/wallets'],
    enabled: isConnected,
  })

  const createWalletMutation = useMutation({
    mutationFn: async (walletData: { address: string; network: string }) => {
      const response = await apiRequest('POST', '/api/wallets', walletData)
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] })
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected to TradeMindAI",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const connectWallet = async (connector: any) => {
    try {
      const result = await connect({ connector })
      if (result && result.accounts[0]) {
        await createWalletMutation.mutateAsync({
          address: result.accounts[0],
          network: 'bsc',
        })
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const disconnectWallet = () => {
    disconnect()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  return {
    address,
    isConnected,
    wallets,
    connectors,
    connectWallet,
    disconnectWallet,
    isConnecting: createWalletMutation.isPending,
  }
}
