import apiClient, { getProxyUrl } from '@/lib/api-client'
import type { Course } from '@/types/course'

export interface CourseCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  courses_count?: number
  total_learners?: number
  average_rating?: number
}

export interface PlatformStats {
  total_students: number
  total_courses: number
  total_hours_watched: number
  total_instructors?: number
}

export function mapApiToCourse(raw: any): Course {
  if (!raw) return {} as any
  const summary = raw.summary || {}
  const stats = raw.stats || summary.stats || {}

  return {
    id: String(raw.uuid || raw.id || ''),
    uuid: String(raw.uuid || raw.id || ''),
    slug: raw.slug || '',
    title: raw.title || '',
    description: raw.description || '',
    content: raw.content || '',
    badge_text: raw.badge_text || '',
    thumbnail: getProxyUrl(
      raw.thumbnail?.url || raw.thumbnail?.original || raw.thumbnail || '',
    ),
    category: raw.category || {},
    price: raw.price || 0,
    price_discount: raw.price_discount !== undefined ? raw.price_discount : null,
    base_price: raw.base_price || 0,
    modules_count: stats.total_modules || stats.total_lessons || 0,
    summary: {
      difficulty: raw.difficulty || raw.summary?.difficulty,
      language: raw.language || raw.summary?.language,
      stats: {
        total_lessons: stats.total_modules || stats.total_lessons || 0,
        total_quizzes: stats.total_quizzes || 0,
        total_videos: stats.total_videos || 0,
        total_duration:
          stats.total_duration_human || stats.total_duration || '20m',
        total_students: stats.total_students || 0,
        average_rating: stats.average_rating || 0,
        total_reviews: stats.total_reviews || 0,
        total_modules: stats.total_modules || 0,
        total_duration_human_full:
          stats.total_duration_human_full || stats.total_duration_human || '',
        average_video_duration_human:
          stats.average_video_duration_human || '',
      },
    },
    video_data: raw.video
      ? {
          id: raw.video.id || 0,
          uuid: raw.video.uuid,
          status: raw.video.status,
          stream_url: raw.video.stream_url,
          thumbnail_url: raw.video.thumbnail_url,
          duration: raw.video.duration,
          is_public:
            raw.video.contents?.is_public === true ||
            raw.video.is_public === true,
        }
      : undefined,
    is_public:
      raw.video?.contents?.is_public === true ||
      raw.video?.is_public === true,
    what_you_will_get: summary.what_you_will_get || [],
    who_is_this_for: Array.isArray(summary.who_is_this_for)
      ? summary.who_is_this_for
      : [],
    what_you_will_learn: summary.what_you_will_learn || [],
    requirements: summary.requirements || [],
    is_enrolled: raw.is_enrolled === true,
    is_corporate: raw.is_corporate === true,
    status: raw.status || 'active',
    createdAt: raw.created_at || new Date().toISOString(),
    access_duration_days: raw.access_duration_days || 0,
    enrollment_expiry: raw.enrollment_expiry || null,
    modules: raw.modules
      ? (raw.modules || []).map((m: any) => ({
          id: m.uuid || m.id || '',
          title: m.title,
          order: m.order_weight || m.order || 0,
          type: m.module_type || m.type || 'lesson',
          description: m.description,
        }))
      : undefined,
    attachments: raw.attachments
      ? (raw.attachments || []).map((a: any) => ({
          uuid: a.uuid,
          title: a.title,
          description: a.description || '',
          order_weight: a.order_weight || 0,
          media: a.media
            ? {
                url: getProxyUrl(a.media.url),
                mime_type: a.media.mime_type,
                size: a.media.size || 0,
              }
            : null,
        }))
      : undefined,
    instructor: raw.instructor
      ? {
          id: raw.instructor.uuid || raw.instructor.id || '',
          name: raw.instructor.name || '',
          profile: raw.instructor.profile
            ? {
                avatar_url: raw.instructor.profile.avatar_url
                  ? getProxyUrl(raw.instructor.profile.avatar_url)
                  : null,
                headline: raw.instructor.profile.headline || '',
                bio: raw.instructor.profile.bio || '',
                linkedin_url: raw.instructor.profile.linkedin_url || '',
              }
            : null,
        }
      : undefined,
    reviews: raw.reviews
      ? (raw.reviews || []).map((r: any) => ({
          uuid: r.uuid || r.id || '',
          rating: r.rating || 0,
          comment: r.comment || '',
          user: r.user
            ? {
                name: r.user.name || '',
              }
            : null,
        }))
      : undefined,
  } as any
}

export const discoveryCourseService = {
  async getCategories(): Promise<CourseCategory[]> {
    const response = await apiClient.get('/api/course/category')
    const data = response.data.data || response.data
    return data.map((cat: any) => ({
      id: cat.uuid,
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description,
      icon: cat.contents?.icon || 'layout',
      color: cat.contents?.color || 'blue',
      courses_count: cat.courses_count || 0,
      total_learners: cat.total_learners,
      average_rating: cat.average_rating,
    }))
  },

  async getCategoryBySlug(slug: string): Promise<CourseCategory> {
    const response = await apiClient.get(`/api/course/category/${slug}`)
    const cat = response.data.data || response.data
    return {
      id: cat.uuid,
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description,
      icon: cat.contents?.icon || 'layout',
      color: cat.contents?.color || 'blue',
      courses_count: cat.courses_count || 0,
      total_learners: cat.total_learners,
      average_rating: cat.average_rating,
    }
  },

  async getPlatformStats(): Promise<PlatformStats> {
    const response = await apiClient.get('/api/discovery/stats')
    return response.data.data || response.data
  },

  async search(params: {
    query?: string
    category?: string
    difficulty?: string
    language?: string
    is_free?: boolean
    price_min?: number
    price_max?: number
    rating?: number
    sort_by?: string
    page?: number
    limit?: number
  }) {
    const response = await apiClient.get('/api/course', {
      params: {
        search: params.query,
        category: params.category,
        difficulty: params.difficulty,
        language: params.language,
        is_free: params.is_free,
        price_min: params.price_min,
        price_max: params.price_max,
        rating: params.rating,
        sort_by: params.sort_by,
        page: params.page,
        limit: params.limit,
      },
    })

    const body = response.data
    const rawData = body.data || []
    const mappedData = rawData.map(mapApiToCourse)

    return {
      data: mappedData,
      meta: body.meta,
    }
  },

  async getDetails(uuid: string) {
    const response = await apiClient.get(`/api/course/${uuid}`)
    const raw = response.data.data || response.data
    return mapApiToCourse(raw)
  },
  
  async getRelatedCourses(uuid: string): Promise<Course[]> {
    const response = await apiClient.get(`/api/course/${uuid}/related`)
    const rawData = response.data.data || []
    return rawData.map(mapApiToCourse)
  },
}
