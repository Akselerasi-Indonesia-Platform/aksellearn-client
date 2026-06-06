import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { FeaturedCourseModal } from '@/components/admin/featured-courses/featured-course-modal'
import { FeaturedCourseTable } from '@/components/admin/featured-courses/featured-course-table'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { DataHeader } from '@/components/admin/shared/data'
import { AdminPage, PageHeader } from '@/components/admin/shared/layout'
import { AddActionButton } from '@/components/admin/shared/button/add-action-button'
import { adminFeaturedCourseService } from '@/services/admin/featured-course.service'
import type { FeaturedCourse, FeaturedCoursePayload } from '@/types/featured-course'

export const Route = createFileRoute('/admin/featured-courses')({
  component: AdminFeaturedCoursesPage,
})

function AdminFeaturedCoursesPage() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  const [featuredCourses, setFeaturedCourses] = React.useState<FeaturedCourse[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedFC, setSelectedFC] = React.useState<FeaturedCourse | undefined>()

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminFeaturedCourseService.getAll()
      setFeaturedCourses(res.featured_courses)
    } catch {
      toast.error('Failed to fetch featured courses')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    setMounted(true)
    fetchData()
  }, [fetchData])

  const handleCreate = () => {
    setSelectedFC(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (fc: FeaturedCourse) => {
    setSelectedFC(fc)
    setIsFormOpen(true)
  }

  const handleDeleteClick = () => {
    setIsFormOpen(false)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedFC) return
    try {
      await adminFeaturedCourseService.delete(selectedFC.id)
      toast.success(t('common.deleteSuccess', 'Featured course configuration removed.'))
      setIsDeleteDialogOpen(false)
      fetchData()
    } catch {
      toast.error(t('common.deleteError', 'Failed to remove featured course configuration.'))
    }
  }

  const handleFormSubmit = async (payload: FeaturedCoursePayload) => {
    try {
      if (selectedFC) {
        await adminFeaturedCourseService.update(selectedFC.id, payload)
        toast.success(t('common.updateSuccess', 'Configuration updated successfully.'))
      } else {
        await adminFeaturedCourseService.create(payload)
        toast.success(t('common.createSuccess', 'Course featured successfully.'))
      }
      setIsFormOpen(false)
      fetchData()
    } catch {
      toast.error(
        selectedFC
          ? t('common.updateError', 'Failed to update configuration.')
          : t('common.createError', 'Failed to feature course.')
      )
    }
  }

  const filteredFeaturedCourses = React.useMemo(() => {
    return featuredCourses.filter(fc =>
      fc.course?.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [featuredCourses, searchQuery])

  if (!mounted) return null

  return (
    <AdminPage>
      <PageHeader
        title={t('featuredCourses.title', 'Featured Courses')}
        description={t('featuredCourses.description', 'Choose which courses are highlighted on the public homepage and manage their display priority.')}
        actions={
          <AddActionButton
            label={t('featuredCourses.addFeatured', 'Feature a Course')}
            onClick={handleCreate}
          />
        }
      />

      <div className="space-y-6">
        <DataHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearFilters={() => setSearchQuery('')}
          activeFiltersCount={0}
          resultsCount={filteredFeaturedCourses.length}
          resultsLabel="featured courses found"
        />

        <FeaturedCourseTable
          featuredCourses={filteredFeaturedCourses}
          onEdit={handleEdit}
          isLoading={isLoading}
        />
      </div>

      {/* Create / Edit Dialog Modal */}
      <FeaturedCourseModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        featuredCourse={selectedFC}
        onSubmit={handleFormSubmit}
        onDelete={selectedFC ? handleDeleteClick : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.areYouSure', 'Are you sure?')}
        description={t('featuredCourses.removeConfirm', 'This will remove the course from the featured section. The course itself will not be deleted.')}
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </AdminPage>
  )
}
