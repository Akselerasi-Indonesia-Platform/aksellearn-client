import type { Course } from '@/types/course'

export interface FeaturedCourse {
  id: number
  course_id: number
  course?: Course
  sort_order: number
  start_at?: string | null
  end_at?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FeaturedCoursePayload {
  course_id: number
  sort_order?: number
  start_at?: string | null
  end_at?: string | null
  is_active: boolean
}
