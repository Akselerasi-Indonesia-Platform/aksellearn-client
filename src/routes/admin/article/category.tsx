import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CategoryForm } from '@/components/admin/article-categories/category-form'
import { CategoryTable } from '@/components/admin/article-categories/category-table'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/admin/shared/layout'
import { DataHeader, DataFooter } from '@/components/admin/shared/data'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { adminArticleCategoryService } from '@/services/admin/article-category.service'
import type { ArticleCategory } from '@/types/article-category'

export const Route = createFileRoute('/admin/article/category')({
  component: ArticleCategoriesPage,
})

function ArticleCategoriesPage() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  // Search State
  const [searchQuery, setSearchQuery] = React.useState('')
  const [categories, setCategories] = React.useState<ArticleCategory[]>([])
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const isFirstRender = React.useRef(true)
  const lastRequestId = React.useRef(0)

  const fetchCategories = React.useCallback(
    async (page: number, limit: number, search: string) => {
      const requestId = ++lastRequestId.current
      setIsLoading(true)
      try {
        const { categories, meta } = await adminArticleCategoryService.getAll({
          page,
          limit,
          search,
        })

        if (requestId === lastRequestId.current) {
          setCategories(categories)
          setPagination(meta)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        if (requestId === lastRequestId.current) {
          setIsLoading(false)
        }
      }
    },
    [],
  )

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Debounced search effect
  React.useEffect(() => {
    if (!mounted) return

    if (isFirstRender.current) {
      isFirstRender.current = false
      fetchCategories(1, pagination.limit, searchQuery)
      return
    }

    const handler = setTimeout(() => {
      fetchCategories(1, pagination.limit, searchQuery)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchQuery, mounted, fetchCategories, pagination.limit])

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
    fetchCategories(newPage, pagination.limit, searchQuery)
  }

  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<
    ArticleCategory | undefined
  >()

  const handleCreate = () => {
    setSelectedCategory(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = async (category: ArticleCategory) => {
    try {
      const categoryData = await adminArticleCategoryService.getOne(category.id)
      setSelectedCategory(categoryData)
      setIsFormOpen(true)
    } catch (error) {
      console.error('Failed to fetch category details:', error)
    }
  }

  const handleDeleteClick = (category: ArticleCategory) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: Partial<ArticleCategory>) => {
    try {
      if (selectedCategory) {
        await adminArticleCategoryService.update(selectedCategory.id, data)
        toast.success('Category updated successfully')
      } else {
        await adminArticleCategoryService.create(data)
        toast.success('Category created successfully')
      }
      await fetchCategories(pagination.page, pagination.limit, searchQuery)
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to save category:', error)
      toast.error('Failed to save category')
      throw error
    }
  }

  const confirmDelete = async () => {
    if (selectedCategory) {
      try {
        await adminArticleCategoryService.delete(selectedCategory.id)
        toast.success('Category deleted successfully')
        await fetchCategories(pagination.page, pagination.limit, searchQuery)
        setIsDeleteDialogOpen(false)
        setSelectedCategory(undefined)
      } catch (error) {
        console.error('Failed to delete category:', error)
        toast.error('Failed to delete category')
      }
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    fetchCategories(1, pagination.limit, '')
  }

  if (!mounted) return null

  return (
    <AdminPage>
      <PageHeader
        title={t('articleCategories.title')}
        description={t('articleCategories.description')}
        actions={
          <Button
            className="shadow-lg shadow-primary/20 font-bold px-6"
            onClick={handleCreate}
          >
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('articleCategories.addCategory')}
          </Button>
        }
      />

      <DataHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
        activeFiltersCount={0}
        resultsCount={pagination.total}
        resultsLabel="categories found"
      />

      <div className="flex flex-col gap-4">
        <CategoryTable
          categories={categories}
          isLoading={isLoading}
          pageSize={pagination.limit}
          onDelete={handleDeleteClick}
          onEdit={handleEdit}
        />

        <DataFooter
          page={pagination.page}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={handlePageChange}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] admin-theme">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory
                ? t('common.edit')
                : t('articleCategories.addCategory')}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? t('common.updateDetails')
                : t('common.enterDetails')}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={selectedCategory}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.areYouSure', 'Are you absolutely sure?')}
        description={`${t('common.deleteConfirmation', 'This action cannot be undone. This will permanently delete')} ${selectedCategory?.name}.`}
        confirmText={t('common.delete')}
        onConfirm={confirmDelete}
      />
    </AdminPage>
  )
}
