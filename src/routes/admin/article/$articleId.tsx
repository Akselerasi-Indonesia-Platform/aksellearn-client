import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ArticleForm } from '@/components/admin/article/article-form'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { adminArticleService } from '@/services/admin/article.service'
import { adminArticleCategoryService } from '@/services/admin/article-category.service'
import { Article, ArticleFormValues } from '@/types/article'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'

export const Route = createFileRoute('/admin/article/$articleId')({
  component: EditArticlePage,
})

function EditArticlePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { articleId } = useParams({ from: '/admin/article/$articleId' })

  const [article, setArticle] = React.useState<Article | undefined>()
  const [categories, setCategories] = React.useState<
    { label: string; value: string }[]
  >([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [articleRes, catRes] = await Promise.all([
          adminArticleService.getOne(articleId),
          adminArticleCategoryService.getOptions(),
        ])
        setArticle(articleRes)
        setCategories(catRes)
      } catch {
        toast.error('Failed to fetch article data')
        navigate({ to: '/admin/article' })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [articleId, navigate])

  const handleSubmit = async (values: ArticleFormValues) => {
    try {
      await adminArticleService.update(articleId, values)
      toast.success(t('common.updateSuccess', 'Post updated successfully'))
      navigate({ to: '/admin/article' })
    } catch (error) {
      toast.error('Failed to update post')
      console.error(error)
    }
  }

  const confirmDelete = async () => {
    try {
      await adminArticleService.delete(articleId)
      toast.success(t('common.deleteSuccess', 'Post deleted successfully'))
      setIsDeleteDialogOpen(false)
      navigate({ to: '/admin/article' })
    } catch (error) {
      toast.error('Failed to delete post')
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
            Edit Article Post
          </h2>
          <p className="text-muted-foreground">
            Update your post content and settings.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : article ? (
          <ArticleForm
            article={article}
            categories={categories}
            onCancel={() => navigate({ to: '/admin/article' })}
            onSubmit={handleSubmit}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Post not found.</p>
            <Button
              variant="link"
              onClick={() => navigate({ to: '/admin/article' })}
            >
              Back to Article Posts
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.areYouSure', 'Are you absolutely sure?')}
        description={`${t('common.deleteConfirmation', 'This action cannot be undone. This will permanently delete')} ${article?.title}.`}
        confirmText={t('common.delete')}
        onConfirm={confirmDelete}
      />
    </AdminPage>
  )
}
