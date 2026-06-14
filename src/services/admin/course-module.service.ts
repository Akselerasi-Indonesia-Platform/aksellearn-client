import apiClient from '@/lib/api-client'
import { sanitizePayload } from '@/lib/utils'
import type { CourseModule } from '@/types/course'

interface RawApiModule {
  uuid: string
  title: string
  type?: 'lesson' | 'quiz'
  module_type?: 'lesson' | 'quiz'
  description?: string
  content?: string
  video?: string
  order?: number
  order_weight?: number
  is_active?: number | string | boolean
  published_at?: string
  status?: string
  quiz?: {
    uuid: string
    title: string
  }
  quiz_uuid?: string
}

function mapApiToModule(data: RawApiModule): CourseModule {
  // Sanitize potential Go nil strings or nulls
  const sanitize = (val?: any) =>
    val === '<nil>' || val === null ? undefined : val

  let videoUrl = ''
  let videoUuid = (data as any).video_uuid || undefined
  let videoData: any = undefined

  if (typeof data.video === 'string') {
    videoUrl = data.video
  } else if (data.video && typeof data.video === 'object') {
    videoUrl = (data.video as any).stream_url || ''
    videoUuid = (data.video as any).uuid || videoUuid
    videoData = data.video
  }

  return {
    id: data.uuid,
    title: data.title,
    // Supporting both module_type (API) and type (Frontend mapping preference)
    type: data.type || data.module_type || 'lesson',
    module_type: data.module_type || data.type || 'lesson',
    description: sanitize(data.description),
    content: sanitize(data.content),
    video: videoUrl,
    video_uuid: videoUuid,
    video_data: videoData,
    order: data.order !== undefined ? data.order : data.order_weight || 0,
    order_weight: data.order_weight !== undefined ? data.order_weight : data.order || 0,
    is_active:
      data.is_active !== undefined
        ? typeof data.is_active === 'boolean'
          ? data.is_active
          : Number(data.is_active) === 1
        : data.status === 'published',
    published_at: data.published_at,
    // Extracting nested quiz uuid for easier form handling
    quiz_uuid: data.quiz_uuid || data.quiz?.uuid || '',
    quiz: data.quiz as any,
    // Map videos array from API — each item may come back with uuid, title, stream_url, order_weight
    videos: Array.isArray((data as any).videos)
      ? (data as any).videos.map((v: any) => ({
          uuid: v.uuid || v.media_uuid || '',
          title: v.title || '',
          order_weight: v.order_weight ?? 0,
          stream_url: v.stream_url || v.video?.stream_url || '',
          duration: v.duration,
          watch_progress: v.watch_progress ?? null,
        }))
      : undefined,
  }
}

export const adminCourseModuleService = {
  async getAll(courseUuid: string): Promise<CourseModule[]> {
    const response = await apiClient.get(
      `/api/admin/course/${courseUuid}/module`,
    )
    const data = response.data.data || response.data
    return Array.isArray(data) ? data.map(mapApiToModule) : []
  },

  async getOne(courseUuid: string, moduleUuid: string): Promise<CourseModule> {
    const response = await apiClient.get(
      `/api/admin/course/${courseUuid}/module/${moduleUuid}`,
    )
    const data = response.data.data || response.data
    return mapApiToModule(data)
  },

  async create(
    courseUuid: string,
    module: Partial<CourseModule>,
  ): Promise<CourseModule> {
    const payload = sanitizePayload(module)
    const response = await apiClient.post(
      `/api/admin/course/${courseUuid}/module`,
      payload,
    )
    const data = response.data.data || response.data
    return mapApiToModule(data)
  },

  async update(
    courseUuid: string,
    moduleUuid: string,
    module: Partial<CourseModule>,
  ): Promise<CourseModule> {
    const payload = sanitizePayload(module)
    const response = await apiClient.put(
      `/api/admin/course/${courseUuid}/module/${moduleUuid}`,
      payload,
    )
    const data = response.data.data || response.data
    return mapApiToModule(data)
  },

  async delete(courseUuid: string, moduleUuid: string): Promise<void> {
    await apiClient.delete(
      `/api/admin/course/${courseUuid}/module/${moduleUuid}`,
    )
  },

  async reorder(courseUuid: string, uuids: string[]): Promise<void> {
    await apiClient.post(`/api/admin/course/${courseUuid}/module/reorder`, {
      uuids,
    })
  },
}
