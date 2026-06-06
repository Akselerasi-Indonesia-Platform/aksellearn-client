import apiClient from '@/lib/api-client'

export interface MediaUploadResponse {
  status: string
  message: string
  data: MediaData
}

export interface MediaData {
  uuid: string
  name?: string
  original_name?: string
  url?: string
  images?: {
    original: string
    '175x175'?: string
    [key: string]: string | undefined
  }
  thumbnail?: {
    original: string
    '175x175'?: string
    [key: string]: string | undefined
  }
  status?:
    | 'pending'
    | 'processing'
    | 'available'
    | 'completed'
    | 'failed'
    | 'finished'
    | 'transcoding'
  hd_status?: 'encoding' | 'completed' | 'failed' | null
  hd_progress?: number | null
  qualities?: string[]
  hd_eta?: string | null
  stream_url?: string
  thumbnail_url?: string
  duration?: number
  progress?: number
  created_by_id?: number
}

export const adminMediaService = {
  async upload(
    file: File,
    module: 'article' | 'course' | 'user' | 'platform',
  ): Promise<MediaData> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('module', module)

    const response = await apiClient.post('/api/admin/media/upload', formData)

    return response.data.data || response.data
  },

  async getStatus(uuid: string): Promise<MediaData> {
    const response = await apiClient.get(`/api/media/${uuid}`)
    return response.data.data || response.data
  },

  async getStatusOnly(uuid: string): Promise<MediaData> {
    const response = await apiClient.get(`/api/media/${uuid}/status`)
    return response.data.data || response.data
  },

  async reprocess(uuid: string): Promise<void> {
    await apiClient.post(`/api/admin/media/${uuid}/reprocess`)
  },

  async getAll(params?: {
    page?: number
    limit?: number
    mime_type?: 'image' | 'video'
    search?: string
  }): Promise<{
    data: MediaData[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/media', {
      params: {
        ...params,
        per_page: params?.limit,
        current_page: params?.page,
      },
    })
    const body = response.data
    const rawData = Array.isArray(body.data)
      ? body.data
      : Array.isArray(body)
        ? body
        : []

    return {
      data: rawData,
      meta: {
        total: Number(
          body.meta?.total ||
            body.total ||
            body.total_count ||
            rawData.length ||
            0,
        ),
        page: Number(
          body.meta?.current_page ||
            body.page ||
            body.current_page ||
            params?.page ||
            1,
        ),
        limit: Number(
          body.meta?.per_page ||
            body.limit ||
            body.per_page ||
            params?.limit ||
            10,
        ),
      },
    }
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/media/${uuid}`)
  },
}
