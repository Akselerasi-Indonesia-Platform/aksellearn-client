import apiClient from '@/lib/api-client'
import { QueueMonitorResponse } from '@/types/queue-monitor'

export const appService = {
  getMonitorQueue: async (page = 1, limit = 10, status = '') => {
    const response = await apiClient.get<QueueMonitorResponse>(
      '/api/monitor-queue',
      {
        params: { page, limit, status },
      },
    )
    return response.data
  },

  clearCache: async () => {
    return apiClient.get('/api/clear-cache')
  },

  testEmail: async () => {
    return apiClient.get('/api/test-email')
  },
}
