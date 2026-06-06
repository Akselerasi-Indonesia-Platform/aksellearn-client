import apiClient, { getProxyUrl } from '@/lib/api-client'
import type { FeaturedCourse, FeaturedCoursePayload } from '@/types/featured-course'

function normalizeThumbnail(fc: any) {
  if (fc?.course) {
    const thumb = fc.course.thumbnail
    let resolvedThumbnail = ''
    if (thumb) {
      if (typeof thumb === 'string') {
        resolvedThumbnail = getProxyUrl(thumb)
      } else if (typeof thumb === 'object') {
        resolvedThumbnail = getProxyUrl(thumb['175x175'] || thumb.original || '')
      }
    }
    return {
      ...fc,
      course: {
        ...fc.course,
        thumbnail: resolvedThumbnail,
      },
    }
  }
  return fc
}

export const adminFeaturedCourseService = {
  async getAll(params?: {
    page?: number
    limit?: number
    is_active?: string
  }): Promise<{
    featured_courses: FeaturedCourse[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/featured-courses', { params })
    const list = (response.data.data || []) as any[]
    return {
      featured_courses: list.map(normalizeThumbnail),
      meta: response.data.meta || { total: 0, page: 1, limit: 10 },
    }
  },

  async create(data: FeaturedCoursePayload): Promise<FeaturedCourse> {
    const response = await apiClient.post('/api/admin/featured-courses', data)
    return normalizeThumbnail(response.data.data)
  },

  async update(id: number, data: Partial<FeaturedCoursePayload>): Promise<FeaturedCourse> {
    const response = await apiClient.patch(`/api/admin/featured-courses/${id}`, data)
    return normalizeThumbnail(response.data.data)
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/featured-courses/${id}`)
  },
}
