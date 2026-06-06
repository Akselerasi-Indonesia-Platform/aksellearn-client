import apiClient, { getProxyUrl } from '@/lib/api-client'
import { sanitizePayload } from '@/lib/utils'
import type { Article } from '@/types/article'
import type { ProcessedImage } from '@/types/common'
import { adminMediaService } from './media.service'

interface RawApiArticle {
  id: number
  uuid: string
  title: string
  excerpt: string
  content: string
  article_category_uuid: string
  category?: {
    uuid: string
    name: string
    created_at?: string
  }
  thumbnail?: Record<string, string>
  images?: any[]
  is_active?: boolean
  status?: string
  meta_title?: string
  meta_description?: string
  published_at?: string
  created_at?: string
  updated_at?: string
}

function mapApiToArticle(data: RawApiArticle): Article {
  // Helper to extract UUID from URL if not provided
  const extractUuid = (url?: string) => {
    if (!url) return ''
    const match = url.match(
      /([a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})/i,
    )
    return match ? match[1] : ''
  }

  const rawImages = Array.isArray(data.images) ? data.images : []
  const images = rawImages
    .map((img: any, idx: number) => {
      const url =
        img.original ||
        img['175x175'] ||
        (Object.values(img)[0] as string) ||
        ''
      return {
        id: img.uuid || extractUuid(url) || `img-${idx}`,
        url: getProxyUrl(url),
        order: img.order ?? idx,
      }
    })
    .sort((a, b) => a.order - b.order)

  const thumbObj = data.thumbnail as any
  const thumbnail = getProxyUrl(
    thumbObj?.original ||
      thumbObj?.['175x175'] ||
      (images.length > 0 ? images[0].url : undefined) ||
      '',
  )

  return {
    id: data.uuid,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    article_category_uuid:
      data.article_category_uuid || data.category?.uuid || '',
    category: data.category
      ? {
          id: data.category.uuid,
          name: data.category.name,
          slug: '',
          status: 'active' as const,
          createdAt: data.category.created_at || '',
        }
      : undefined,
    images,
    thumbnail,
    status: (data.status || (data.is_active ? 'published' : 'draft')) as
      | 'published'
      | 'draft',
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    published_at: data.published_at,
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
  }
}

export const adminArticleService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    category_uuid?: string
    status?: string
  }): Promise<{
    articles: Article[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/article', { params })
    const body = response.data

    const rawData =
      body.data && Array.isArray(body.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : body.articles && Array.isArray(body.articles)
            ? body.articles
            : []
    const metaData = body.meta

    const meta = {
      total: Number(
        metaData?.total ??
          metaData?.pagination?.total ??
          body.total ??
          body.total_count ??
          body.total_items ??
          body.count ??
          body.pagination?.total ??
          rawData.length,
      ),
      page: Number(
        metaData?.current_page ??
          metaData?.pagination?.current_page ??
          body.current_page ??
          body.page ??
          body.pagination?.current_page ??
          params?.page ??
          1,
      ),
      limit: Number(
        metaData?.per_page ??
          metaData?.pagination?.per_page ??
          body.per_page ??
          body.limit ??
          body.pagination?.per_page ??
          params?.limit ??
          10,
      ),
    }

    const lastPage = Number(
      metaData?.last_page ??
        body.last_page ??
        metaData?.pagination?.last_page ??
        body.pagination?.last_page ??
        1,
    )

    // Ensure total is consistent with lastPage to force pagination UI visibility
    if (lastPage > 1 && meta.total <= meta.limit) {
      meta.total = lastPage * meta.limit
    }

    return {
      articles: rawData.map(mapApiToArticle),
      meta,
    }
  },

  async getOne(uuid: string): Promise<Article> {
    const response = await apiClient.get(`/api/admin/article/${uuid}`)
    const data = response.data.data || response.data
    return mapApiToArticle(data)
  },

  async create(article: any): Promise<Article> {
    const payload = sanitizePayload(article)
    const response = await apiClient.post('/api/admin/article', payload)
    const data = response.data.data || response.data
    return mapApiToArticle(data)
  },

  async update(uuid: string, article: any): Promise<Article> {
    const payload = sanitizePayload(article)
    const response = await apiClient.put(`/api/admin/article/${uuid}`, payload)
    const data = response.data.data || response.data
    return mapApiToArticle(data)
  },

  async uploadImages(files: FileList | File[]): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = []

    for (const file of Array.from(files)) {
      const data = await adminMediaService.upload(file, 'article')
      results.push({
        filename: data.uuid,
        images: (data.images as Record<string, string>) || {
          original: data.url || '',
        },
      })
    }

    return results
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/article/${uuid}`)
  },
}
