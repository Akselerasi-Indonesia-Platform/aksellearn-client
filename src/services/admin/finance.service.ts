import apiClient from '@/lib/api-client'

export const adminFinanceService = {

  // --- Platform Finance Summary ---
  async getPlatformFinanceSummary(): Promise<{
    financials: {
      total_gmv: number
      total_platform_fees: number
      total_instructor_earnings: number
      total_pending_withdrawals: number
      total_completed_withdrawals: number
    }
    metrics: {
      total_courses: number
      total_orders: number
      total_enrollments: number
    }
  }> {
    const response = await apiClient.get('/api/admin/finance/revenue')
    return response.data.data || response.data
  },

  // --- NEW Platform Fee Configs CRUD (Super Admin / Admin) ---
  async getPlatformFeeConfigs(params?: {
    page?: number
    limit?: number
    search?: string
    applies_to?: 'all' | 'course' | 'instructor'
  }): Promise<{ data: any[]; meta: any }> {
    const response = await apiClient.get('/api/admin/platform-fee-configs', {
      params,
    })
    return response.data
  },

  async createPlatformFeeConfig(data: any): Promise<any> {
    const response = await apiClient.post('/api/admin/platform-fee-configs', data)
    return response.data.data || response.data
  },

  async updatePlatformFeeConfig(id: number, data: any): Promise<any> {
    const response = await apiClient.put(`/api/admin/platform-fee-configs/${id}`, data)
    return response.data.data || response.data
  },

  async deletePlatformFeeConfig(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/platform-fee-configs/${id}`)
  },

  // --- NEW Admin Payouts (Super Admin / Admin) ---
  async getAdminPayouts(params?: {
    page?: number
    limit?: number
    status?: 'pending' | 'approved' | 'paid' | 'held'
    instructor_id?: number
  }): Promise<{ data: any[]; meta: any }> {
    const response = await apiClient.get('/api/admin/payouts', {
      params: {
        page: params?.page,
        limit: params?.limit,
        status: params?.status,
        instructor_id: params?.instructor_id,
      },
    })
    return response.data
  },

  async approveAdminPayout(uuid: string): Promise<any> {
    const response = await apiClient.post(`/api/admin/payouts/${uuid}/approve`)
    return response.data.data || response.data
  },

  async payAdminPayout(uuid: string, notes: string): Promise<any> {
    const response = await apiClient.post(`/api/admin/payouts/${uuid}/pay`, { notes })
    return response.data.data || response.data
  },

  // --- NEW Admin Withdrawals (Super Admin / Admin) ---
  async getAdminWithdrawals(params?: {
    page?: number
    limit?: number
    status?: 'pending' | 'completed' | 'rejected'
  }): Promise<{ data: any[]; meta: any }> {
    const response = await apiClient.get('/api/admin/withdrawals', { params })
    return response.data
  },

  async approveAdminWithdrawal(id: string, formData: FormData): Promise<any> {
    const response = await apiClient.post(`/api/admin/withdrawals/${id}/approve`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data || response.data
  },

  async rejectAdminWithdrawal(id: string, rejectedReason: string): Promise<any> {
    const response = await apiClient.post(`/api/admin/withdrawals/${id}/reject`, {
      rejected_reason: rejectedReason,
    })
    return response.data.data || response.data
  },

  // --- NEW Instructor Self-Service Payouts ---
  async getInstructorPayoutsSummary(): Promise<{
    total_earnings: number
    pending: number
    approved: number
    paid: number
  }> {
    const response = await apiClient.get('/api/user/payouts/summary')
    return response.data.data || response.data
  },

  async getInstructorPayoutHistory(params?: {
    page?: number
    limit?: number
    status?: 'pending' | 'approved' | 'paid' | 'held'
  }): Promise<{ data: any[]; meta: any }> {
    const response = await apiClient.get('/api/user/payouts', { params })
    return response.data
  },

  // --- Entity Helper Lists ---
  async getCoursesList(): Promise<{ id: number; title: string; uuid: string }[]> {
    const response = await apiClient.get('/api/admin/course', { params: { limit: 100 } })
    const items = response.data.data || response.data || []
    return items.map((item: any) => ({
      id: item.id,
      title: item.title,
      uuid: item.uuid,
    }))
  },

  async getInstructorsList(): Promise<{ id: number; name: string; email: string }[]> {
    const response = await apiClient.get('/api/admin/user', { params: { limit: 100 } })
    const items = response.data.data || response.data || []
    return items.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
    }))
  },
}
