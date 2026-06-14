import apiClient, { getProxyUrl } from '@/lib/api-client'
import type {
  Course,
  CourseAnnouncement,
  CourseComment,
  Quiz,
} from '@/types/course'
import { getToken } from '@/lib/auth'

/**
 * Append authentication token to playlist URLs to resolve 401 Unauthorized errors
 * when the player (Plyr/Hls.js) requests the .m3u8 manifest externally.
 */
const appendTokenToUrl = (url: string | undefined): string => {
  if (!url || !url.includes('/playlist')) return url || ''

  const token = getToken()
  if (!token) return url

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}token=${token}`
}

export interface CourseListResponse {
  data: Course[]
  links?: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface QuizSubmissionResponse {
  score: number
  is_passing: boolean
  correct_count: number
  total_questions: number
  details?: {
    question_uuid: string
    is_correct: boolean
    points: number
    earned_points: number
  }[]
}

export const userCourseService = {
  /**
   * Get all enrolled courses for student
   */
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    status?: string
    difficulty?: string
    sort_by?: string
    sort?: string
  }): Promise<CourseListResponse> {
    const response = await apiClient.get('/api/course/enrollment', { params })
    
    // Safely extract data, handling Go's null serialization for empty slices
    const responseData = response?.data || {}
    const rawData = responseData.data
    const data = Array.isArray(rawData) ? rawData : []
    const meta = responseData.meta || { total: 0, current_page: 1, per_page: 12, last_page: 1 }
    const links = responseData.links

    // Map enrollments or raw course data to Course interface
    const mappedCourses: Course[] = data.map((item: any) => {
      // If item has a nested 'course' property (enrollment structure)
      const courseData = item.course || item
      const summary = courseData.summary || {}
      const stats = courseData.stats || summary.stats || {}

      return {
        ...courseData,
        id: courseData.uuid || courseData.id || item.uuid || '',
        uuid: courseData.uuid || courseData.id || item.uuid || '',
        slug: courseData.slug || '',
        progress_percentage: item.progress_percentage || 0,
        enrollment_uuid: item.uuid,
        enrollment_status: item.status || courseData.enrollment_status,
        thumbnail: getProxyUrl(
          courseData.thumbnail?.url ||
            courseData.thumbnail?.original ||
            courseData.thumbnail ||
            '',
        ),
        category: courseData.category || {},
        modules_count: stats.total_modules || stats.total_lessons || 0,
        stats: {
          total_lessons: stats.total_modules || stats.total_lessons || 0,
          total_quizzes: stats.total_quizzes || 0,
          total_videos: stats.total_videos || 0,
          total_duration:
            stats.total_duration_human || stats.total_duration || '20m',
          total_students: stats.total_students || 0,
          average_rating: stats.average_rating || 0,
          total_reviews: stats.total_reviews || 0,
        },
        createdAt:
          courseData.created_at ||
          courseData.createdAt ||
          item.created_at ||
          new Date().toISOString(),
      }
    })

    return {
      data: mappedCourses,
      links,
      meta: {
        total: meta.total,
        current_page: meta.current_page,
        per_page: meta.per_page,
        last_page: meta.last_page,
      },
    }
  },

  /**
   * Get full course details including syllabus via the specialized Learn Experience endpoint
   */
  async getLearnExperience(uuid: string): Promise<Course> {
    const response = await apiClient.get(`/api/course/${uuid}/learn`)
    const rawData = response.data.data || response.data

    // If nested course exists (enrollment response)
    const courseData = rawData.course || rawData
    const summary = courseData.summary || {}
    const stats = courseData.stats || summary.stats || {}

    let courseVideoUrl = ''
    let courseVideoData = courseData.video_data || undefined
    if (typeof courseData.video === 'string') {
      courseVideoUrl = courseData.video
    } else if (courseData.video && typeof courseData.video === 'object') {
      courseVideoUrl = courseData.video.stream_url || courseData.video.url || ''
      courseVideoData = courseData.video
    }

    return {
      ...courseData,
      id: courseData.uuid || courseData.id || rawData.uuid || '',
      uuid: courseData.uuid || courseData.id || rawData.uuid || '',
      slug: courseData.slug || '',
      enrollment_uuid: rawData.course ? rawData.uuid : undefined,
      enrollment_status: rawData.status,
      user_review: rawData.user_review,
      progress_percentage: rawData.progress_percentage || 0,
      thumbnail: getProxyUrl(
        courseData.thumbnail?.url ||
          courseData.thumbnail?.original ||
          courseData.thumbnail ||
          '',
      ),
      video: appendTokenToUrl(courseVideoUrl),
      video_data: courseVideoData,
      modules_count: stats.total_modules || stats.total_lessons || 0,
      stats: {
        total_lessons: stats.total_modules || stats.total_lessons || 0,
        total_quizzes: stats.total_quizzes || 0,
        total_videos: stats.total_videos || 0,
        total_duration:
          stats.total_duration_human || stats.total_duration || '20m',
        total_students: stats.total_students || 0,
        average_rating: stats.average_rating || 0,
        total_reviews: stats.total_reviews || 0,
      },
      what_you_will_get:
        summary.what_you_will_get || courseData.what_you_will_get || [],
      who_is_this_for:
        summary.who_is_this_for || courseData.who_is_this_for || [],
      what_you_will_learn:
        summary.what_you_will_learn || courseData.what_you_will_learn || [],
      requirements: summary.requirements || courseData.requirements || [],
      modules: (courseData.modules || []).map((m: any) => {
        let videoUrl = ''
        let videoData = m.video_data || undefined
        if (typeof m.video === 'string') {
          videoUrl = m.video
        } else if (m.video && typeof m.video === 'object') {
          videoUrl = m.video.stream_url || m.video.url || ''
          videoData = m.video
        }
        // DEBUG: Expose raw API module to verify videos[] is coming from BE
        if (process.env.NODE_ENV === 'development') {
          console.log(`[LearnExperience] Module "${m.title}" raw:`, {
            uuid: m.uuid,
            module_type: m.module_type,
            videos: m.videos,
            videos_count: m.videos?.length,
          })
        }
        return {
          ...m,
          id: m.uuid || m.id || '',
          order: m.order_weight || m.order || 0,
          type: m.module_type || m.type || 'lesson',
          video: appendTokenToUrl(videoUrl),
          video_data: videoData,
          videos: m.videos ? m.videos.map((v: any) => ({
            ...v,
            stream_url: appendTokenToUrl(v.stream_url)
          })) : undefined,
        }
      }),
    }
  },

  /**
   * Mark a module as complete (heartbeat or explicit)
   */
  async completeModule(
    moduleUuid: string,
    payload?: Record<string, any>,
  ): Promise<void> {
    await apiClient.post(`/api/course/module/${moduleUuid}/complete`, payload || {})
  },

  /**
   * Fetch lightweight media status for progressive encoding UI
   */
  async getMediaStatus(uuid: string): Promise<any> {
    const response = await apiClient.get(`/api/media/${uuid}/status`)
    return response.data.data || response.data
  },

  /**
   * Fetch quiz details and questions
   */
  async getQuiz(quizUuid: string): Promise<Quiz> {
    const response = await apiClient.get(`/api/course/quiz/${quizUuid}`)
    const { data } = response.data
    return {
      ...(data.quiz || data),
      completed: data.completed,
      result: data.result,
    }
  },

  /**
   * Submit quiz answers
   * Format: {"q1": ["a1", "a2"]}
   */
  async submitQuiz(
    quizUuid: string,
    answers: Record<string, string[]>,
  ): Promise<QuizSubmissionResponse> {
    // Note: Documentation says format is direct map, not wrapped in { answers }
    const response = await apiClient.post(
      `/api/course/quiz/${quizUuid}/submit`,
      answers,
    )
    return response.data.data || response.data
  },

  /**
   * Fetch latest announcements for a course
   */
  async getAnnouncements(courseUuid: string): Promise<CourseAnnouncement[]> {
    const response = await apiClient.get(
      `/api/course/${courseUuid}/announcement`,
    )
    const data = response.data.data || response.data
    return (data || []).map((ann: any) => ({
      ...ann,
      id: ann.uuid || ann.id || '',
      createdAt: ann.created_at || ann.createdAt || new Date().toISOString(),
    }))
  },

  /**
   * Fetch comments/discussions for a course
   */
  async getComments(courseUuid: string): Promise<CourseComment[]> {
    const response = await apiClient.get(`/api/course/${courseUuid}/comment`)
    const data = response.data.data || response.data

    const mapComment = (c: any): any => ({
      ...c,
      id: c.uuid || c.id || '',
      createdAt: c.created_at || c.createdAt || new Date().toISOString(),
      replies: c.replies && Array.isArray(c.replies) ? c.replies.map(mapComment) : []
    })

    return (data || []).map(mapComment)
  },

  /**
   * Post a new comment to a course discussion
   */
  async postComment(
    courseUuid: string,
    content: string,
    videoTimestamp?: number,
    parentUuid?: string,
  ): Promise<CourseComment> {
    const payload: any = { content }
    if (videoTimestamp !== undefined && videoTimestamp !== null) {
      payload.video_timestamp = Math.floor(videoTimestamp)
    }
    if (parentUuid) {
      payload.comment_uuid = parentUuid // Backend expects comment_uuid for the parent
    }
    const response = await apiClient.post(`/api/course/${courseUuid}/comment`, payload)
    const data = response.data.data || response.data
    return {
      ...data,
      id: data.uuid || data.id || '',
      createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    }
  },

  /**
   * Remove a comment
   */
  async deleteComment(courseUuid: string, commentUuid: string): Promise<void> {
    await apiClient.delete(`/api/course/${courseUuid}/comment/${commentUuid}`)
  },

  /**
   * Update a comment
   */
  async updateComment(courseUuid: string, commentUuid: string, content: string): Promise<void> {
    await apiClient.put(`/api/course/${courseUuid}/comment/${commentUuid}`, { content })
  },

  /**
   * Toggle like on a comment
   */
  async toggleCommentLike(courseUuid: string, commentUuid: string): Promise<{ liked: boolean }> {
    const response = await apiClient.post(`/api/course/${courseUuid}/comment/${commentUuid}/like`)
    return response.data.data || response.data
  },

  /**
   * Get student's certificate for the course if completed.
   * Note: This usually returns JSON with metadata.
   * For the direct Mirror Rendering URL, use getCertificateUrl.
   */
  async getCertificate(
    courseUuid: string,
  ): Promise<{
    url?: string
    serial_number?: string
    variant?: string
  } | null> {
    try {
      const response = await apiClient.get(
        `/api/course/${courseUuid}/certificate`,
      )
      const data = response.data.data || response.data
      return data
    } catch {
      return null
    }
  },

  /**
   * Get the direct Mirror Rendering URL for the certificate.
   * This URL includes the authentication token for standalone rendering.
   */
  getCertificateUrl(
    courseUuid: string,
    type: 'html' | 'pdf' = 'html',
    variant?: string,
  ): string {
    const token = getToken()
    // Ensure we use the full API URL, not just the proxy prefix if it's relative
    const baseUrl =
      (typeof window !== 'undefined' && window.__ENV__?.VITE_API_URL) ||
      import.meta.env.VITE_API_URL ||
      ''

    const url = `${baseUrl}/api/course/${courseUuid}/certificate?type=${type}${variant ? `&variant=${variant}` : ''}`
    return token ? `${url}${url.includes('?') ? '&' : '?'}token=${token}` : url
  },

  /**
   * Fetch Certifier.io certificate for a specific enrollment
   */
  async getCertifierCertificate(enrollmentUuid: string): Promise<{ certificate_url: string }> {
    const response = await apiClient.get(`/api/enrollments/${enrollmentUuid}/certificate`)
    return response.data.data || response.data
  },

  /**
   * Fetch student's existing review for a course
   */
  async getReview(
    courseUuid: string,
  ): Promise<{ rating: number; comment: string; created_at: string } | null> {
    try {
      const response = await apiClient.get(`/api/course/${courseUuid}/review`)
      return response.data.data || response.data
    } catch {
      return null
    }
  },

  /**
   * Submit or update a course review
   */
  async postReview(
    courseUuid: string,
    data: { rating: number; comment: string },
  ): Promise<void> {
    await apiClient.post(`/api/course/${courseUuid}/review`, data)
  },

  /**
   * Verify a public certificate by its ID
   */
  async verifyCertificate(
    certificateId: string,
  ): Promise<{
    is_valid: boolean
    issued_to: string
    course_title: string
    completion_date: string
    issued_by?: string
    certificate_id?: string
  } | null> {
    try {
      const response = await apiClient.get(
        `/api/certificate/verify/${certificateId}`,
      )
      return response.data.data || response.data
    } catch {
      return null
    }
  },

  /**
   * Fetch assignment details
   */
  async getAssignment(courseUuid: string, assignmentUuid: string): Promise<any> {
    const response = await apiClient.get(`/api/course/assignment/${assignmentUuid}`)
    return response.data.data || response.data
  },

  /**
   * Submit assignment files
   */
  async submitAssignment(courseUuid: string, assignmentUuid: string, files: File[]): Promise<any> {
    if (!files || files.length === 0) {
      throw new Error('No files provided')
    }
    const formData = new FormData()
    formData.append('file', files[0])
    formData.append('module', 'user')

    const uploadResponse = await apiClient.post('/api/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    const attachmentUuid = uploadResponse.data.data?.uuid || uploadResponse.data.uuid
    if (!attachmentUuid) {
      throw new Error('Failed to upload file attachment')
    }

    const response = await apiClient.post(`/api/course/assignment/${assignmentUuid}/submit`, {
      attachment_uuid: attachmentUuid,
    })
    return response.data.data || response.data
  },
}
