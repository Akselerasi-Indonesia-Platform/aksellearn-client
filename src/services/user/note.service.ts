import apiClient from '@/lib/api-client'
import { sanitizePayload } from '@/lib/utils'
import type { CourseNote } from '@/types/course'

export interface SaveNotePayload {
  uuid?: string
  course_uuid: string
  module_uuid?: string | null
  video_timestamp?: number | null
  content: string
}

export const userNoteService = {
  /**
   * List all notes for a specific course and optionally filter by module
   */
  async getAll(courseUuid?: string, moduleUuid?: string): Promise<CourseNote[]> {
    const params: any = {}
    if (courseUuid) params.course_uuid = courseUuid
    if (moduleUuid) params.module_uuid = moduleUuid

    const response = await apiClient.get('/api/course/note', { params })
    return response.data.data
  },

  /**
   * Create a new note
   */
  async create(data: SaveNotePayload): Promise<CourseNote> {
    const { uuid, ...restData } = data
    const response = await apiClient.post(
      '/api/course/note',
      sanitizePayload(restData),
    )
    return response.data.data
  },

  /**
   * Update an existing note (PATCH)
   */
  async update(uuid: string, data: Partial<SaveNotePayload>): Promise<CourseNote> {
    const response = await apiClient.patch(
      `/api/course/note/${uuid}`,
      sanitizePayload(data),
    )
    return response.data.data
  },

  /**
   * Delete a specific note
   */
  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/course/note/${uuid}`)
  },
}
