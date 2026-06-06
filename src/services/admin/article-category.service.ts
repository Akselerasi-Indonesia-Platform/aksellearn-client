import apiClient from '@/lib/api-client'
import type { ArticleCategory } from '@/types/article-category'

interface RawApiArticleCategory {
  id: number
  uuid: string
  name: string
  slug: string
  description?: string
  status?: string
  created_at?: string
  deleted_at?: string | null
}

function mapApiToArticleCategory(data: RawApiArticleCategory): ArticleCategory {
  return {
    id: data.uuid,
    name: data.name,
    slug: data.slug,
    description: data.description,
    status: (data.deleted_at ? 'inactive' : data.status || 'active') as
      | 'active'
      | 'inactive',
    createdAt: data.created_at || new Date().toISOString(),
  }
}

export const adminArticleCategoryService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{
    categories: ArticleCategory[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/article/category', {
      params,
    })
    const body = response.data

    const rawData = Array.isArray(body.data) ? body.data : []
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
      categories: rawData.map(mapApiToArticleCategory),
      meta,
    }
  },

  async getOne(uuid: string): Promise<ArticleCategory> {
    const response = await apiClient.get(`/api/admin/article/category/${uuid}`)
    const data = response.data.data || response.data
    return mapApiToArticleCategory(data)
  },

  async create(category: Partial<ArticleCategory>): Promise<ArticleCategory> {
    const response = await apiClient.post(
      '/api/admin/article/category',
      category,
    )
    const data = response.data.data || response.data
    return mapApiToArticleCategory(data)
  },

  async update(
    uuid: string,
    category: Partial<ArticleCategory>,
  ): Promise<ArticleCategory> {
    const response = await apiClient.put(
      `/api/admin/article/category/${uuid}`,
      category,
    )
    const data = response.data.data || response.data
    return mapApiToArticleCategory(data)
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/article/category/${uuid}`)
  },

  async getOptions(): Promise<{ label: string; value: string }[]> {
    try {
      const response = await apiClient.get('/api/admin/article/category/option')
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
      const response = await apiClient.get('/api/admin/article/category')
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
