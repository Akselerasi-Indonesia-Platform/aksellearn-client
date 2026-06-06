import apiClient from '@/lib/api-client'
import { sanitizePayload } from '@/lib/utils'
import type { CourseCategory } from '@/types/course'

interface RawApiCourseCategory {
  id: number
  uuid: string
  name: string
  slug?: string
  description?: string
  created_at?: string
}

function mapApiToCourseCategory(data: RawApiCourseCategory): CourseCategory {
  const sanitize = (val?: string) =>
    val === '<nil>' || val === null ? undefined : val

  return {
    id: data.uuid,
    db_id: data.id,
    name: data.name,
    slug: data.slug || '',
    description: sanitize(data.description) || '',
    createdAt: data.created_at || new Date().toISOString(),
  }
}

export const adminCourseCategoryService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{
    categories: CourseCategory[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/course/category', {
      params,
    })
    const body = response.data

    const rawData =
      body.data && Array.isArray(body.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : body.categories && Array.isArray(body.categories)
            ? body.categories
            : []
    const metaData = body.meta

    const meta = {
      total:
        typeof metaData?.total === 'number' ? metaData.total : rawData.length,
      page:
        typeof metaData?.current_page === 'number'
          ? metaData.current_page
          : params?.page || 1,
      limit:
        typeof metaData?.per_page === 'number'
          ? metaData.per_page
          : params?.limit || 10,
    }

    return {
      categories: rawData.map(mapApiToCourseCategory),
      meta,
    }
  },

  async getOne(uuid: string): Promise<CourseCategory> {
    const response = await apiClient.get(`/api/admin/course/category/${uuid}`)
    const data = response.data.data || response.data
    return mapApiToCourseCategory(data)
  },

  async create(category: Partial<CourseCategory>): Promise<CourseCategory> {
    const payload = sanitizePayload(category)
    const response = await apiClient.post('/api/admin/course/category', payload)
    const data = response.data.data || response.data
    return mapApiToCourseCategory(data)
  },

  async update(
    uuid: string,
    category: Partial<CourseCategory>,
  ): Promise<CourseCategory> {
    const payload = sanitizePayload(category)
    const response = await apiClient.put(
      `/api/admin/course/category/${uuid}`,
      payload,
    )
    const data = response.data.data || response.data
    return mapApiToCourseCategory(data)
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/course/category/${uuid}`)
  },

  async getOptions(): Promise<{ label: string; value: string }[]> {
    try {
      const response = await apiClient.get('/api/admin/course/category/option')
      const items = response.data.data || response.data
      if (Array.isArray(items) && items.length > 0) {
        return items.map((item: any) => ({
          label: item.label || item.name || '',
          value: item.value || item.uuid || item.id?.toString() || '',
        }))
      }
    } catch (e) {
      console.warn('Option endpoint failed, falling back to list endpoint', e)
    }

    // Fallback to the main list endpoint if /option is not available
    try {
      const response = await apiClient.get('/api/admin/course/category')
      const items = response.data.data || response.data
      const rawData = Array.isArray(items) ? items : []
      return rawData.map((item: any) => ({
        label: item.name || '',
        value: item.uuid || item.id?.toString() || '',
      }))
    } catch (e) {
      console.error('Failed to fetch category options', e)
      return []
    }
  },
}
