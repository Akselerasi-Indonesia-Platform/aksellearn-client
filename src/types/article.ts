import { ArticleCategory } from './article-category'
import { GalleryImage } from './common'

export type ArticleImage = GalleryImage

export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  article_category_uuid: string
  category?: ArticleCategory
  images: ArticleImage[]
  thumbnail?: string
  status: 'published' | 'draft'
  meta_title?: string
  meta_description?: string
  published_at?: string
  createdAt: string
  updatedAt: string
  badge_text?: string
  author?: any
}

export interface ArticleFormValues {
  title: string
  excerpt: string
  content: string
  article_category_uuid: string
  images: ArticleImage[]
  status: 'published' | 'draft'
  meta_title?: string
  meta_description?: string
  published_at?: string
}
