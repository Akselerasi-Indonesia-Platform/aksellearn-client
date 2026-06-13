import apiClient from '@/lib/api-client'
import type { Course } from '@/types/course'
import type { Banner } from '@/types/banner'
import { mapApiToCourse } from './course.service'

export interface PopularCourse {
  id: number
  course_id: number
  course: Course
  sort_order: number
  start_at: string | null
  end_at: string | null
  is_active: boolean
}

export interface HomepageResponse {
  latest: Course[]
  popular: PopularCourse[]
  banners?: Banner[]
}

export type HomepageData = HomepageResponse

export const homepageService = {
  async getHomepageData(): Promise<HomepageResponse> {
    const response = await apiClient.get('/api/homepage')
    const data = response.data.data || response.data

    if (data) {
      if (Array.isArray(data.popular)) {
        data.popular = data.popular.map((item: any) => ({
          ...item,
          course: item.course ? mapApiToCourse(item.course) : undefined,
        }))
      }

      if (Array.isArray(data.latest)) {
        data.latest = data.latest.map(mapApiToCourse)
      }
    }

    return data
  },
}
