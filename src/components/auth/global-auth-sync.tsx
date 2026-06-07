import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/hooks/use-auth'

export function GlobalAuthSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setUser = useAuthStore((state) => state.setUser)

  const { data } = useQuery({
    queryKey: ['user', 'sync'],
    queryFn: async () => {
      const user = await authService.getProfile()
      return user
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (data) {
      setUser(data as any)
    }
  }, [data, setUser])

  return null
}
