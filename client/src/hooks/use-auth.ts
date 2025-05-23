import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: number
  email: string
  plan: string
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Auto-login with demo account for seamless experience
  useEffect(() => {
    if (!token) {
      loginWithDemo()
    }
  }, [])

  const loginWithDemo = async () => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email: 'demo@trademindai.com',
        password: 'demo123'
      })
      const data = await response.json()
      
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] })
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] })
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] })
    } catch (error) {
      console.log('Demo login not available, using guest mode')
    }
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials)
      return response.json()
    },
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Invalidate all protected queries
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] })
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] })
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] })
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to TradeMindAI",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/register', credentials)
      return response.json()
    },
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      toast({
        title: "Account Created!",
        description: "Welcome to TradeMindAI",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    queryClient.clear()
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    })
  }

  return {
    user,
    token,
    isAuthenticated: !!token,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  }
}