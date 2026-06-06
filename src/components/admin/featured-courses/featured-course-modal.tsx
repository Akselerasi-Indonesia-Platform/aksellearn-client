import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeaturedCourseForm } from './featured-course-form'
import type { FeaturedCourse, FeaturedCoursePayload } from '@/types/featured-course'

interface FeaturedCourseModalProps {
  isOpen: boolean
  onClose: () => void
  featuredCourse?: FeaturedCourse
  onSubmit: (data: FeaturedCoursePayload) => void
  onDelete?: () => void
}

export function FeaturedCourseModal({
  isOpen,
  onClose,
  featuredCourse,
  onSubmit,
  onDelete,
}: FeaturedCourseModalProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] admin-theme shadow-lg border border-slate-100 rounded-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {featuredCourse
              ? t('featuredCourses.editFeatured', 'Edit Featured Course')
              : t('featuredCourses.addFeatured', 'Feature a Course')}
          </DialogTitle>
          <DialogDescription>
            {t('common.updateDetails', 'Update the details below.')}
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4">
          <FeaturedCourseForm
            featuredCourse={featuredCourse}
            onSubmit={onSubmit}
            onCancel={onClose}
            onDelete={onDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
