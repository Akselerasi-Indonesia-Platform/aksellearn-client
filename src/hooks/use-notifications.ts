import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { NotificationListResponse } from '@/types/notification'

export const useNotifications = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ['notifications', limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<NotificationListResponse>(`/api/v1/notification`, {
        params: { limit, page: pageParam },
      })
      return response.data
    },
    getNextPageParam: (lastPage, _allPages) => {
      const { page, total, limit } = lastPage.meta
      const hasNextPage = page * limit < total
      return hasNextPage ? page + 1 : undefined
    },
    initialPageParam: 1,
  })
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await apiClient.get<NotificationListResponse>(`/api/v1/notification`, {
        params: { limit: 1 },
      })
      return response.data.meta.unread_count
    },
    refetchInterval: 60000, // Poll every 60s
  })
}

export const useReadNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uuid?: string) => {
      if (uuid) {
        const response = await apiClient.post(`/api/v1/notification/${uuid}/read`)
        return response.data
      } else {
        const response = await apiClient.post(`/api/v1/notification/read-all`)
        return response.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uuid?: string) => {
      if (uuid) {
        const response = await apiClient.delete(`/api/v1/notification/${uuid}`)
        return response.data
      } else {
        const response = await apiClient.delete(`/api/v1/notification`)
        return response.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
