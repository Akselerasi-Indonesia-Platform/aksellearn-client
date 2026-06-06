import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ArticleForm } from '@/components/admin/article/article-form'
import { Button } from '@/components/ui/button'
import { adminArticleService } from '@/services/admin/article.service'
import { adminArticleCategoryService } from '@/services/admin/article-category.service'
import { ArticleFormValues } from '@/types/article'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'

export const Route = createFileRoute('/admin/article/create')({
  component: CreateArticlePage,
})

function CreateArticlePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [categories, setCategories] = React.useState<
    { label: string; value: string }[]
  >([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminArticleCategoryService.getOptions()
        setCategories(res)
      } catch {
        toast.error('Failed to fetch categories')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (values: ArticleFormValues) => {
    try {
      await adminArticleService.create(values)
      toast.success(t('common.createSuccess', 'Post created successfully'))
      navigate({ to: '/admin/article' })
    } catch (error) {
      toast.error('Failed to create post')
      console.error(error)
    }
  }

  return (
    <AdminPage>
      <div className="flex items-center gap-4">
        <Button
          className="rounded-full"
          size="icon"
          variant="ghost"
          onClick={() => navigate({ to: '/admin/article' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            New Article Post
          </h2>
          <p className="text-muted-foreground">
            Create a new story to share with your audience.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <ArticleForm
            categories={categories}
            onCancel={() => navigate({ to: '/admin/article' })}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </AdminPage>
  )
}
