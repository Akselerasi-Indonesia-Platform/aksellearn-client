import apiClient from '@/lib/api-client'

export interface InstructorRevenueStat {
  total_revenue: number
  total_courses: number
  total_students: number
  total_sales: number
}

export interface RevenueBreakdown {
  course_uuid: string
  course_title: string
  sales_count: number
  revenue: number
}

export interface InstructorRevenueResponse {
  stats: InstructorRevenueStat
  breakdown: RevenueBreakdown[]
}

export const adminInstructorService = {
  async getRevenue(): Promise<InstructorRevenueResponse> {
    const response = await apiClient.get('/api/instructor/revenue')
    return response.data.data || response.data
  },

  // Bank Accounts
  async getAvailableBanks(): Promise<{ id: number, code: string, name: string, is_active: boolean }[]> {
    const response = await apiClient.get('/api/payment/banks')
    return response.data.data || response.data
  },
  async getBanks(): Promise<any[]> {
    const response = await apiClient.get('/api/instructor/banks')
    return response.data.data || response.data
  },
  async createBank(data: { bank_code: string; bank_name: string; account_number: string; account_name: string; is_primary: boolean }): Promise<any> {
    const response = await apiClient.post('/api/instructor/banks', data)
    return response.data.data || response.data
  },
  async updateBank(uuid: string, data: any): Promise<any> {
    const response = await apiClient.put(`/api/instructor/banks/${uuid}`, data)
    return response.data.data || response.data
  },
  async deleteBank(uuid: string): Promise<any> {
    const response = await apiClient.delete(`/api/instructor/banks/${uuid}`)
    return response.data.data || response.data
  },

  // Withdrawals
  async getWalletBalance(): Promise<{ available_balance: number; locked_balance: number }> {
    const response = await apiClient.get('/api/instructor/withdrawals/wallet')
    return response.data.data || response.data
  },
  async getWithdrawals(params?: { page?: number; limit?: number; status?: string }): Promise<{ data: any[]; meta: any }> {
    const response = await apiClient.get('/api/instructor/withdrawals', { params })
    return response.data
  },
  async requestWithdrawal(data: { amount: number; user_bank_id: string }): Promise<any> {
    const response = await apiClient.post('/api/instructor/withdrawals', data)
    return response.data.data || response.data
  },
}
