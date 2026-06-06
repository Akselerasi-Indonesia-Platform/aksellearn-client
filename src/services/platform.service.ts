import apiClient from '@/lib/api-client'

export interface PlatformProfile {
  name: string
  tagline?: string
  email?: string
  phone_number?: string
  whatsapp_number?: string
  address?: string
  social_links?: Record<string, string>
  logo?: {
    url: string
    uuid: string
  }
  logo_dark?: {
    url: string
    uuid: string
  } | null
  favicon?: {
    url: string
    uuid: string
  }
  // keeping these for backwards compatibility if needed, but should use the ones above
  platform_primary_color?: string
  platform_focus?: 'course' | 'article' | 'all'
}

const normalizeImage = (value: any) => {
  if (!value) return undefined
  if (typeof value === 'string') {
    return { url: value, uuid: '' }
  }
  return value
}

export const platformService = {
  getProfile: async (): Promise<PlatformProfile> => {
    const response = await apiClient.get('/api/platform-profile')
    const data = response.data.data
    return {
      ...data,
      logo: normalizeImage(data.logo),
      logo_dark: normalizeImage(data.logo_dark),
      favicon: normalizeImage(data.favicon),
    }
  },
  updateProfile: async (data: any): Promise<PlatformProfile> => {
    const response = await apiClient.put('/api/admin/platform', data)
    const resData = response.data.data
    return {
      ...resData,
      logo: normalizeImage(resData.logo),
      logo_dark: normalizeImage(resData.logo_dark),
      favicon: normalizeImage(resData.favicon),
    }
  },
}
