import apiClient from '@/lib/api-client'
import { sanitizePayload } from '@/lib/utils'
import type { CourseAnnouncement } from '@/types/course'

interface RawApiAnnouncement {
  uuid: string
  course_uuid: string
  title: string
  excerpt?: string
  content: string
  is_broadcasted: boolean
  created_at: string
  updated_at: string
}

function mapApiToAnnouncement(data: RawApiAnnouncement): CourseAnnouncement {
  const sanitize = (val?: string): string =>
    val === '<nil>' || val === null || !val ? '' : val

  return {
    id: data.uuid,
    course_id: data.course_uuid,
    title: sanitize(data.title),
    excerpt: sanitize(data.excerpt),
    content: sanitize(data.content),
    is_broadcasted: !!data.is_broadcasted,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export const adminCourseAnnouncementService = {
  async getAll(courseUuid: string): Promise<CourseAnnouncement[]> {
    const response = await apiClient.get(
      `/api/admin/course/${courseUuid}/announcement`,
    )
    const data = response.data.data || response.data
    return Array.isArray(data) ? data.map(mapApiToAnnouncement) : []
  },

  async getOne(
    courseUuid: string,
    announcementUuid: string,
  ): Promise<CourseAnnouncement> {
    const response = await apiClient.get(
      `/api/admin/course/${courseUuid}/announcement/${announcementUuid}`,
    )
    const data = response.data.data || response.data
    return mapApiToAnnouncement(data)
  },

  async create(
    courseUuid: string,
    announcement: Partial<CourseAnnouncement>,
  ): Promise<CourseAnnouncement> {
    const payload = sanitizePayload(announcement)
    const response = await apiClient.post(
      `/api/admin/course/${courseUuid}/announcement`,
      payload,
    )
    const data = response.data.data || response.data
    return mapApiToAnnouncement(data)
  },

  async update(
    courseUuid: string,
    announcementUuid: string,
    announcement: Partial<CourseAnnouncement>,
  ): Promise<CourseAnnouncement> {
    const payload = sanitizePayload(announcement)
    const response = await apiClient.put(
      `/api/admin/course/${courseUuid}/announcement/${announcementUuid}`,
      payload,
    )
    const data = response.data.data || response.data
    return mapApiToAnnouncement(data)
  },

  async delete(courseUuid: string, announcementUuid: string): Promise<void> {
    await apiClient.delete(
      `/api/admin/course/${courseUuid}/announcement/${announcementUuid}`,
    )
  },

  async broadcast(courseUuid: string, announcementUuid: string): Promise<void> {
    await apiClient.post(
      `/api/admin/course/${courseUuid}/announcement/${announcementUuid}/broadcast`,
    )
  },
}
