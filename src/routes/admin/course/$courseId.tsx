import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CourseForm } from '@/components/admin/courses/course-form'
import { Button } from '@/components/ui/button'
import { adminCourseService } from '@/services/admin/course.service'
import { adminCourseCategoryService } from '@/services/admin/course-category.service'
import { invalidateDiscoveryCache } from '@/lib/cache-utils'
import { Course } from '@/types/course'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { AuditHistoryPanel } from '@/components/admin/shared/audit-history-panel'

export const Route = createFileRoute('/admin/course/$courseId')({
  component: EditCoursePage,
})

function EditCoursePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { courseId } = useParams({ from: '/admin/course/$courseId' })

  const [course, setCourse] = React.useState<Course | undefined>()
  const [categories, setCategories] = React.useState<
    { label: string; value: string }[]
  >([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, catRes] = await Promise.all([
          adminCourseService.getOne(courseId),
          adminCourseCategoryService.getOptions(),
        ])
        setCourse(courseRes)
        setCategories(catRes)
      } catch {
        toast.error('Failed to fetch course data')
        navigate({ to: '/admin/course' })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [courseId, navigate])

  const handleSubmit = async (values: any, activeTab?: string) => {
    try {
      await adminCourseService.update(courseId, values)
      invalidateDiscoveryCache()
      toast.success(t('common.updateSuccess', 'Course updated successfully'))
      if (activeTab !== 'certificate') {
        navigate({ to: '/admin/course' })
      }
    } catch (error) {
      console.error(error)
      throw error // Re-throw to allow CourseForm to handle validation errors
    }
  }

  const confirmDelete = async () => {
    setDeleteError(null)
    try {
      await adminCourseService.delete(courseId)
      invalidateDiscoveryCache()
      toast.success(t('common.deleteSuccess', 'Course deleted successfully'))
      setIsDeleteDialogOpen(false)
      navigate({ to: '/admin/course' })
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to delete course'
      setDeleteError(msg)
      toast.error(msg)
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
          onClick={() => navigate({ to: '/admin/course' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Course</h2>
          <p className="text-muted-foreground">
            Update your course content and settings.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : course ? (
          <div className="space-y-6">
            <CourseForm
              categories={categories}
              course={course}
              onCancel={() => navigate({ to: '/admin/course' })}
              onSubmit={handleSubmit}
              onDelete={() => setIsDeleteDialogOpen(true)}
            />
            {course.db_id && (
              <div className="pt-6 border-t border-border/50">
                <AuditHistoryPanel entityType="course" entityId={course.db_id} />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Course not found.</p>
            <Button
              variant="link"
              onClick={() => navigate({ to: '/admin/course' })}
            >
              Back to Courses
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.areYouSure', 'Are you absolutely sure?')}
        description={`${t('common.deleteConfirmation', 'This action cannot be undone. This will permanently delete')} ${course?.title}.`}
        confirmText={t('common.delete')}
        onConfirm={confirmDelete}
        verifyText={course?.title}
        error={deleteError}
      />
    </AdminPage>
  )
}
