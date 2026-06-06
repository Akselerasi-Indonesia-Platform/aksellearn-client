import apiClient, { getProxyUrl } from '@/lib/api-client'
import type { Article } from '@/types/article'

interface RawApiArticle {
  id: number
  uuid: string
  title: string
  excerpt: string
  content: string
  category?: {
    uuid: string
    name: string
  }
  thumbnail?: Record<string, string>
  images?: any[]
  published_at?: string
  created_at?: string
}

function mapApiToArticle(data: RawApiArticle): Article {
  const thumbObj = data.thumbnail as any
  const thumbnail = getProxyUrl(
    thumbObj?.original || thumbObj?.['175x175'] || thumbObj?.url || '',
  )

  return {
    id: data.uuid,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    article_category_uuid: data.category?.uuid || '',
    category: data.category
      ? {
          id: data.category.uuid,
          name: data.category.name,
          slug: '',
          status: 'active' as const,
          createdAt: '',
        }
      : undefined,
    images: [],
    thumbnail,
    status: 'published',
    published_at: data.published_at,
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.created_at || new Date().toISOString(),
  }
}

export const discoveryArticleService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    category_uuid?: string
    is_featured?: boolean
  }): Promise<{
    articles: Article[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/article', { params })
    const body = response.data

    const rawData = body.data || []
    const metaData = body.meta

    return {
      articles: rawData.map(mapApiToArticle),
      meta: {
        total: metaData?.total || rawData.length,
        page: metaData?.current_page || params?.page || 1,
        limit: metaData?.per_page || params?.limit || 10,
      },
    }
  },

  async getOne(uuid: string): Promise<Article> {
    const response = await apiClient.get(`/api/article/${uuid}`)
    const data = response.data.data || response.data
    return mapApiToArticle(data)
  },
}
