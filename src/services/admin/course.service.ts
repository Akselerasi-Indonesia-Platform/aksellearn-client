import apiClient, { getProxyUrl } from '@/lib/api-client'
import { sanitizePayload } from '@/lib/utils'
import type {
  Course,
  CourseModule,
  VideoResource,
  CourseCertificateConfig,
} from '@/types/course'
import { adminMediaService } from './media.service'
import { getToken } from '@/lib/auth'

interface RawApiCourse {
  id: number
  uuid: string
  title: string
  description: string
  content: string
  course_category_uuid?: string
  course_category_id?: string // Handle both cases
  category?: {
    id: number
    uuid: string
    name: string
    [key: string]: any
  }
  thumbnail: string
  thumbnail_uuid?: string
  video: string
  video_id?: number
  video_uuid?: string
  is_active?: number | string | boolean
  status?: string
  published_at?: string
  meta_title?: string
  meta_description?: string
  price?: number
  base_price?: number
  access_duration_days?: number
  is_corporate?: number | string | boolean
  created_at?: string
  updated_at?: string
  modules?: {
    uuid: string
    title: string
    description?: string
    content?: string
    video?: string
    order: number
    order_weight?: number
    type?: 'lesson' | 'quiz'
    module_type?: 'lesson' | 'quiz'
    is_active?: number | string | boolean
  }[]
}

function mapApiToCourse(data: RawApiCourse): Course {
  const sanitize = (val?: string) =>
    val === '<nil>' || val === null ? undefined : val

  const modules: CourseModule[] = (data.modules || [])
    .map((m) => ({
      id: m.uuid,
      title: m.title,
      description: sanitize(m.description),
      content: sanitize(m.content),
      video: sanitize(m.video),
      order: m.order,
      order_weight: m.order_weight || m.order || 0,
      type: m.type || m.module_type || 'lesson',
      is_active:
        m.is_active !== undefined
          ? typeof m.is_active === 'boolean'
            ? m.is_active
            : Number(m.is_active) === 1
          : true,
    }))
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  let videoUrl = ''
  let videoThumbnail = ''
  let videoId = typeof data.video_id === 'number' ? data.video_id : undefined
  let videoUuid = (data as any).video_uuid || undefined
  let videoData: any = undefined

  if (typeof data.video === 'string') {
    videoUrl = data.video
  } else if (data.video && typeof data.video === 'object') {
    videoUrl = (data.video as any).stream_url || ''
    videoThumbnail = getProxyUrl((data.video as any).thumbnail_url || '')
    videoId = (data.video as any).id || videoId
    videoUuid = (data.video as any).uuid || videoUuid
    videoData = data.video
  }

  return {
    id: data.uuid || data.id?.toString() || '',
    db_id: data.id,
    uuid: data.uuid || '',
    slug: (data as any).slug || '',
    title: data.title,
    description: sanitize(data.description) || '',
    content: sanitize(data.content) || '',
    course_category_id: Number(data.course_category_id || 0),
    course_category_uuid: data.course_category_uuid || data.category?.uuid,
    category: data.category,
    thumbnail:
      data.thumbnail && typeof data.thumbnail === 'object'
        ? getProxyUrl(
            (data.thumbnail as any).url ||
              (data.thumbnail as any).original ||
              (data.thumbnail as any).images?.original ||
              '',
          )
        : getProxyUrl(data.thumbnail || (data as any).thumbnail_url || ''),
    thumbnail_uuid:
      data.thumbnail_uuid ||
      (data.thumbnail && typeof data.thumbnail === 'object'
        ? (data.thumbnail as any).uuid
        : undefined) ||
      undefined,
    video: videoUrl,
    video_thumbnail: videoThumbnail,
    video_id: videoId,
    video_uuid: videoUuid,
    video_data: videoData,
    is_active:
      data.is_active !== undefined
        ? Number(data.is_active) === 1
        : data.status === 'published',
    published_at: data.published_at,
    modules: modules,
    announcements: (data as any).announcements || [],
    comments: (data as any).comments || [],
    certificate_config: (data as any).certificate_config || {
      variant: (data as any).certificate_variant || 'modern',
      title: (data as any).certificate_headline || '',
      subtitle: (data as any).certificate_sub_headline || '',
      issuing_authority: (data as any).certificate_config?.issuing_authority || '',
      signature_name: (data as any).certificate_config?.signature_name || '',
      signature_title: (data as any).certificate_config?.signature_title || '',
      logo_url: (data as any).certificate_config?.logo_url || '',
      seal_url: (data as any).certificate_config?.seal_url || '',
      show_qr: (data as any).show_qr_code ?? true,
      accent_color: (data as any).certificate_config?.accent_color || '',
      certificate_background_id: (data as any).certificate_background_id || null,
      certificate_background_uuid: (data as any).certificate_background_uuid || null,
      certificate_background_url: (data as any).certificate_background_url || '',
      certificate_number_pattern: (data as any).certificate_number_pattern || '',
    },
    meta_title: sanitize(data.meta_title) || '',
    meta_description: sanitize(data.meta_description) || '',
    og_image_uuid: (data as any).og_image_uuid || '',
    og_image_url: (data as any).og_image_url || '',
    price: data.price || 0,
    base_price: data.base_price || 0,
    access_duration_days: data.access_duration_days || 365,
    is_corporate:
      data.is_corporate !== undefined
        ? typeof data.is_corporate === 'boolean'
          ? data.is_corporate
          : Number(data.is_corporate) === 1
        : false,
    images: (data as any).images || [],
    what_you_will_get: Array.isArray((data as any).summary?.what_you_will_get)
      ? (data as any).summary.what_you_will_get
      : typeof (data as any).summary?.what_you_will_get === 'string'
        ? [(data as any).summary.what_you_will_get]
        : [],
    who_is_this_for: Array.isArray((data as any).summary?.who_is_this_for)
      ? (data as any).summary.who_is_this_for
      : typeof (data as any).summary?.who_is_this_for === 'string'
        ? [(data as any).summary.who_is_this_for]
        : [],
    what_you_will_learn: Array.isArray(
      (data as any).summary?.what_you_will_learn,
    )
      ? (data as any).summary.what_you_will_learn
      : typeof (data as any).summary?.what_you_will_learn === 'string'
        ? [(data as any).summary.what_you_will_learn]
        : [],
    requirements: Array.isArray((data as any).summary?.requirements)
      ? (data as any).summary.requirements
      : typeof (data as any).summary?.requirements === 'string'
        ? [(data as any).summary.requirements]
        : [],
    summary: {
      stats: (data as any).summary?.stats || {},
    },
    createdAt: data.created_at || new Date().toISOString(),
  }
}

export const adminCourseService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    category_uuid?: string
    is_active?: string | number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }): Promise<{
    courses: Course[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/course', {
      params: {
        ...params,
        per_page: params?.limit,
        current_page: params?.page,
      },
    })
    const body = response.data

    const rawData =
      body.data && Array.isArray(body.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : body.courses && Array.isArray(body.courses)
            ? body.courses
            : []

    const metaData = body.meta

    const meta = {
      total: Number(
        metaData?.total ??
          metaData?.pagination?.total ??
          body.total ??
          body.total_count ??
          body.total_items ??
          body.count ??
          body.pagination?.total ??
          rawData.length,
      ),
      page: Number(
        metaData?.current_page ??
          metaData?.pagination?.current_page ??
          body.current_page ??
          body.page ??
          body.pagination?.current_page ??
          params?.page ??
          1,
      ),
      limit: Number(
        metaData?.per_page ??
          metaData?.pagination?.per_page ??
          body.per_page ??
          body.limit ??
          body.pagination?.per_page ??
          params?.limit ??
          10,
      ),
    }

    const lastPage = Number(
      metaData?.last_page ??
        body.last_page ??
        metaData?.pagination?.last_page ??
        body.pagination?.last_page ??
        1,
    )

    // Ensure total is consistent with lastPage to force pagination UI visibility
    if (lastPage > 1 && meta.total <= meta.limit) {
      meta.total = lastPage * meta.limit
    }

    return {
      courses: rawData.map(mapApiToCourse),
      meta,
    }
  },

  async getOne(uuid: string): Promise<Course> {
    const response = await apiClient.get(`/api/admin/course/${uuid}`)
    const data = response.data.data || response.data
    return mapApiToCourse(data)
  },

  async checkSlug(slug: string, exclude_uuid?: string): Promise<{ is_available: boolean; slug: string }> {
    const params: Record<string, string> = { slug }
    if (exclude_uuid) {
      params.exclude_uuid = exclude_uuid
    }
    const response = await apiClient.get('/api/admin/course/check-slug', { params })
    return response.data.data
  },

  async create(course: any): Promise<Course> {
    const flatCourse = { ...course }
    if (course.certificate_config) {
      flatCourse.certificate_variant = course.certificate_config.variant
      flatCourse.certificate_headline = course.certificate_config.title
      flatCourse.certificate_sub_headline = course.certificate_config.subtitle
      flatCourse.show_qr_code = course.certificate_config.show_qr
      flatCourse.certificate_number_pattern = course.certificate_config.certificate_number_pattern
      flatCourse.certificate_background_uuid = course.certificate_config.certificate_background_uuid || null
      delete flatCourse.certificate_config
      delete flatCourse.certificate_background_id
    }
    const payload = sanitizePayload(flatCourse)
    const response = await apiClient.post('/api/admin/course', payload)
    const data = response.data.data || response.data
    return mapApiToCourse(data)
  },

  async update(uuid: string, course: any): Promise<Course> {
    const flatCourse = { ...course }
    if (course.certificate_config) {
      flatCourse.certificate_variant = course.certificate_config.variant
      flatCourse.certificate_headline = course.certificate_config.title
      flatCourse.certificate_sub_headline = course.certificate_config.subtitle
      flatCourse.show_qr_code = course.certificate_config.show_qr
      flatCourse.certificate_number_pattern = course.certificate_config.certificate_number_pattern
      flatCourse.certificate_background_uuid = course.certificate_config.certificate_background_uuid || null
      delete flatCourse.certificate_config
      delete flatCourse.certificate_background_id
    }
    const payload = sanitizePayload(flatCourse)
    const response = await apiClient.put(`/api/admin/course/${uuid}`, payload)
    const data = response.data.data || response.data
    return mapApiToCourse(data)
  },

  async upload(file: File, onProgress?: (progress: number) => void): Promise<{ url: string; uuid: string }> {
    const data = await adminMediaService.upload(file, 'course', onProgress)

    let url = data.url || ''
    if (data.images) {
      url =
        data.images['original'] ||
        data.images['175x175'] ||
        Object.values(data.images)[0] ||
        ''
    }

    return { url: getProxyUrl(url), uuid: data.uuid }
  },

  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<VideoResource> {
    const data = await adminMediaService.upload(file, 'course', onProgress)
    return {
      id: 0,
      uuid: data.uuid,
      status: data.status || 'pending',
      stream_url: data.url || data.stream_url || '',
      thumbnail_url: getProxyUrl(
        data.thumbnail?.['175x175'] ||
          data.thumbnail?.original ||
          data.thumbnail_url ||
          '',
      ),
      progress: Number(data.progress || (data as any).contents?.progress || 0),
      duration: Number((data as any).meta?.duration || data.duration || 0),
    }
  },

  async getVideoStatus(uuid: string): Promise<VideoResource> {
    const data = await adminMediaService.getStatus(uuid)
    return {
      id: 0,
      uuid: data.uuid,
      status: data.status || 'pending',
      stream_url: data.url || data.stream_url || '',
      thumbnail_url: getProxyUrl(
        data.thumbnail?.['175x175'] ||
          data.thumbnail?.original ||
          data.thumbnail_url ||
          '',
      ),
      progress: Number(data.progress || (data as any).contents?.progress || 0),
      duration: Number((data as any).meta?.duration || data.duration || 0),
      // HD detection fields — critical for "keep polling until HD arrives" strategy
      qualities: (data as any).qualities || [],
      hd_status: (data as any).hd_status || null,
      hd_progress: (data as any).hd_progress || null,
      hd_eta: (data as any).hd_eta || null,
    }
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/course/${uuid}`)
  },
  getCertificateUrl(
    courseUuid: string,
    type: 'html' | 'pdf' = 'html',
    config?: Partial<CourseCertificateConfig>,
  ): string {
    const token = getToken()
    const baseUrl =
      (typeof window !== 'undefined' && window.__ENV__?.VITE_API_URL) ||
      import.meta.env.VITE_API_URL ||
      ''

    // Use the admin-specific preview endpoint to bypass enrollment checks
    let url = `${baseUrl}/api/admin/course/${courseUuid}/certificate-preview?type=${type}`

    if (config) {
      if (config.variant) url += `&variant=${config.variant}`
      if (config.title) url += `&headline=${encodeURIComponent(config.title)}`
      if (config.subtitle)
        url += `&sub_headline=${encodeURIComponent(config.subtitle)}`
      if (config.issuing_authority)
        url += `&organization_name=${encodeURIComponent(config.issuing_authority)}`
      if (config.signature_name)
        url += `&signer_name=${encodeURIComponent(config.signature_name)}`
      if (config.signature_title)
        url += `&signer_title=${encodeURIComponent(config.signature_title)}`
      if (config.show_qr !== undefined)
        url += `&show_qr_code=${config.show_qr ? 'true' : 'false'}`
      if (config.certificate_background_id) {
        url += `&certificate_background_id=${config.certificate_background_id}`
      } else if (config.certificate_background_uuid) {
        url += `&certificate_background_id=${config.certificate_background_uuid}`
      }
      if (config.certificate_number_pattern)
        url += `&certificate_number_pattern=${encodeURIComponent(config.certificate_number_pattern)}`

      // Testing overrides
      const c = config as any
      if (c.student_name)
        url += `&student_name=${encodeURIComponent(c.student_name)}`
      if (c.course_name)
        url += `&course_name=${encodeURIComponent(c.course_name)}`
    }

    return token ? `${url}${url.includes('?') ? '&' : '?'}token=${token}` : url
  },

  async getCertificateMetadata(courseUuid: string): Promise<{
    available_variants: { id: string; name: string; description: string }[]
    context: Record<string, any>
  }> {
    const response = await apiClient.get(
      `/api/admin/course/${courseUuid}/certificate-preview?type=json`,
    )
    return response.data.data || response.data
  },

  async getGradebook(courseUuid: string): Promise<any> {
    const response = await apiClient.get(`/api/admin/course/${courseUuid}/gradebook`)
    return response.data.data || response.data
  },

  async getAnalytics(courseUuid: string): Promise<any> {
    const response = await apiClient.get(`/api/admin/course/${courseUuid}/analytics`)
    return response.data.data || response.data
  },
}
