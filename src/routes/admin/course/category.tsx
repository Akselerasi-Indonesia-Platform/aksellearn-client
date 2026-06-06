import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CourseCategoryForm } from '@/components/admin/course-categories/course-category-form'
import { CourseCategoryTable } from '@/components/admin/course-categories/course-category-table'
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
import { adminCourseCategoryService } from '@/services/admin/course-category.service'
import type { CourseCategory } from '@/types/course'

export const Route = createFileRoute('/admin/course/category')({
  component: CourseCategoriesPage,
})

function CourseCategoriesPage() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  const [categories, setCategories] = React.useState<CourseCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<
    CourseCategory | undefined
  >()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminCourseCategoryService.getAll({
        search: searchQuery,
      })
      // Note: Course category API might not have full pagination meta in simpler versions
      // but we treat it consistently.
      setCategories(res.categories)
      setPagination((prev) => ({
        ...prev,
        total: res.categories.length, // Fallback if meta is missing
      }))
    } catch {
      toast.error('Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  React.useEffect(() => {
    setMounted(true)
    fetchData()
  }, [fetchData])

  const handleCreate = () => {
    setSelectedCategory(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (category: CourseCategory) => {
    setSelectedCategory(category)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: {
    name: string
    slug: string
    description?: string
  }) => {
    try {
      if (selectedCategory) {
        await adminCourseCategoryService.update(selectedCategory.id, data)
        toast.success(
          t('common.updateSuccess', 'Category updated successfully'),
        )
      } else {
        await adminCourseCategoryService.create(data)
        toast.success(
          t('common.createSuccess', 'Category created successfully'),
        )
      }
      setIsFormOpen(false)
      fetchData()
    } catch {
      toast.error('Failed to save category')
    }
  }

  const handleDeleteClick = () => {
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedCategory) {
      setDeleteError(null)
      try {
        await adminCourseCategoryService.delete(selectedCategory.id)
        toast.success(
          t('common.deleteSuccess', 'Category deleted successfully'),
        )
        setIsDeleteDialogOpen(false)
        setIsFormOpen(false)
        setSelectedCategory(undefined)
        fetchData()
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Failed to delete category'
        setDeleteError(msg)
        toast.error(msg)
      }
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
  }

  if (!mounted) return null

  return (
    <AdminPage>
      <PageHeader
        title={t('courseCategories.title')}
        description={t('courseCategories.description')}
        actions={
          <Button
            className="shadow-lg shadow-primary/20 font-bold px-6"
            onClick={handleCreate}
          >
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('courseCategories.addCategory')}
          </Button>
        }
      />

      <DataHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
        activeFiltersCount={0}
        resultsCount={categories.length}
        resultsLabel="categories found"
      />

      <div className="flex flex-col gap-4">
        <CourseCategoryTable
          categories={categories}
          isLoading={isLoading}
          onEdit={handleEdit}
        />

        {pagination.total > pagination.limit && (
          <DataFooter
            page={pagination.page}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, page }))
            }
          />
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] admin-theme">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory
                ? t('common.edit')
                : t('courseCategories.addCategory')}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? t('common.updateDetails')
                : t('common.enterDetails')}
            </DialogDescription>
          </DialogHeader>
          <CourseCategoryForm
            category={selectedCategory}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            onDelete={handleDeleteClick}
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
        error={deleteError}
      />
    </AdminPage>
  )
}
