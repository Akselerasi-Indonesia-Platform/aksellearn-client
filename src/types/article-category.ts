export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
}
