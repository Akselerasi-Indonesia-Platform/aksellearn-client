import apiClient from '@/lib/api-client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id?: number
  uuid?: string
  name: string
  email: string
  email_verified_at?: string | null
  access_token?: string
  role?: string
  roles: string[]
  permissions: string[]
  avatar?: string
  avatar_url?: string
  phone?: string | null
  organizations?: { id: number; name: string }[]
  profile?: {
    display_name?: string
    username?: string
    avatar_url?: string
    headline?: string | null
    bio?: string | null
    timezone?: string
    language?: string
    is_public?: boolean
    social_links?: {
      website?: string | null
      linkedin?: string | null
      github?: string | null
      twitter?: string | null
    }
    onboarding?: {
      learning_goal?: string
      experience_level?: string
      interests?: string[]
      completed_at?: string | null
      skipped?: boolean
    } | null
  }
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
  website?: string
  bio?: string
}

export interface AuthResponse {
  code: number
  message?: string
  data: User & { onboarding_required?: boolean }
  redirect_to?: string
}

export interface OnboardingData {
  learning_goal?: string
  experience_level?: string
  interests?: string[]
  skipped?: boolean
}

export const authService = {
  async saveOnboarding(data: OnboardingData): Promise<any> {
    const response = await apiClient.post('/api/user/onboarding', data)
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', credentials)
    return response.data
  },

  async adminLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/admin/login', credentials)
    return response.data
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/register', credentials)
    return response.data
  },

  async verifyEmail(token: string): Promise<any> {
    const response = await apiClient.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
    return response.data
  },

  async resendVerification(): Promise<any> {
    try {
      const response = await apiClient.post('/api/auth/resend-verification')
      return response.data
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message?.toLowerCase().includes('wait')) {
        err.response.status = 429
      }
      throw err
    }
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/api/user/me')
    return response.data.data || response.data
  },

  async updateProfile(data: Partial<User>): Promise<AuthResponse> {
    const response = await apiClient.put('/api/user/profile', data)
    return response.data
  },

  async getUserOrganizations(): Promise<{ id: number; uuid: string; name: string }[]> {
    const response = await apiClient.get('/api/user/organizations')
    return response.data.data || []
  },

  async updateUserOrganization(organizationId: number): Promise<any> {
    const response = await apiClient.patch('/api/user/profile/organizations', {
      organization_id: organizationId,
    })
    return response.data.data
  },

  async changePassword(data: any): Promise<any> {
    const response = await apiClient.put('/api/user/password', data)
    return response.data
  },

  async forgotPassword(data: { email: string }): Promise<any> {
    const response = await apiClient.post('/api/auth/forgot-password', data)
    return response.data
  },

  async resetPassword(data: any): Promise<any> {
    const response = await apiClient.post('/api/auth/reset-password', data)
    return response.data
  },

  async getSessions(): Promise<any> {
    const response = await apiClient.get('/api/user/sessions')
    return response.data.data || response.data
  },

  async revokeSession(id: string): Promise<any> {
    const response = await apiClient.delete(`/api/user/sessions/${id}`)
    return response.data
  },

  async revokeAllSessions(): Promise<any> {
    const response = await apiClient.delete('/api/user/sessions')
    return response.data
  },

  async deleteAccount(): Promise<any> {
    const response = await apiClient.delete('/api/user/account')
    return response.data
  },
}
