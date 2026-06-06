'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Plus, Megaphone, Search, X } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { adminCourseAnnouncementService } from '@/services/admin/course-announcement.service'
import { CourseAnnouncement } from '@/types/course'
import { CourseAnnouncementForm } from './announcement-form'
import { CourseAnnouncementTable } from './announcement-table'

interface AnnouncementManagerProps {
  courseUuid: string
}

export function AnnouncementManager({ courseUuid }: AnnouncementManagerProps) {
  const { t } = useTranslation()
  const [announcements, setAnnouncements] = React.useState<
    CourseAnnouncement[]
  >([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = React.useState<
    CourseAnnouncement | undefined
  >()
  const [searchQuery, setSearchQuery] = React.useState('')

  const fetchAnnouncements = async () => {
    setIsLoading(true)
    try {
      const data = await adminCourseAnnouncementService.getAll(courseUuid)
      setAnnouncements(data)
    } catch {
      toast.error('Failed to fetch announcements')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (courseUuid) {
      fetchAnnouncements()
    }
  }, [courseUuid])

  const handleOpenCreate = () => {
    setEditingAnnouncement(undefined)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (announcement: CourseAnnouncement) => {
    setEditingAnnouncement(announcement)
    setIsModalOpen(true)
  }

  const handleDelete = async (announcement: CourseAnnouncement) => {
    try {
      await adminCourseAnnouncementService.delete(courseUuid, announcement.id)
      toast.success('Announcement deleted')
      fetchAnnouncements()
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleBroadcast = async (announcement: CourseAnnouncement) => {
    try {
      await adminCourseAnnouncementService.broadcast(
        courseUuid,
        announcement.id,
      )
      toast.success('Broadcast started successfully')
      fetchAnnouncements()
    } catch {
      toast.error('Broadcast failed')
    }
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    fetchAnnouncements()
  }

  const filteredAnnouncements = announcements.filter((ann) =>
    ann.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">
            {t('courses.announcements', 'Announcements')}
          </h3>
        </div>
        <Button
          className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all"
          size="sm"
          type="button"
          variant="outline"
          onClick={handleOpenCreate}
        >
          <Plus className="h-4 w-4" />
          {t('courses.addAnnouncement', 'Add Announcement')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            className="pl-8 h-10 rounded-xl"
            placeholder={`${t('common.search')}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              initial={{ opacity: 0, x: -10 }}
            >
              <Button
                className="h-10 px-3 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/10 transition-all rounded-xl"
                size="sm"
                variant="ghost"
                onClick={() => setSearchQuery('')}
              >
                <X className="mr-2 h-3 w-3" />
                {t('common.clear')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-4">
        <CourseAnnouncementTable
          announcements={filteredAnnouncements}
          onBroadcast={handleBroadcast}
          onDelete={handleDelete}
          onEdit={handleOpenEdit}
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[90vw] lg:max-w-[1400px] max-h-[90vh] overflow-y-auto admin-theme p-0 border-none shadow-2xl">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="size-5" />
                </div>
                {editingAnnouncement
                  ? t('courses.editAnnouncement', 'Edit Announcement')
                  : t('courses.addAnnouncement', 'Add Announcement')}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8">
            <CourseAnnouncementForm
              announcement={editingAnnouncement}
              courseUuid={courseUuid}
              onCancel={() => setIsModalOpen(false)}
              onSuccess={handleSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
