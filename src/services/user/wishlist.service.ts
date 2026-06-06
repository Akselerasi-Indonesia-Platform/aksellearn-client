import apiClient from '@/lib/api-client'
import type { Course } from '@/types/course'

export interface WishlistItem {
  id: number
  uuid: string
  user_id: number
  course_id: number
  course: Course
  created_at: string
}

export const userWishlistService = {
  /**
   * Get all wishlist items for the authenticated user
   */
  async getWishlist(): Promise<WishlistItem[]> {
    const response = await apiClient.get('/api/wishlist')
    return response.data.data?.items || []
  },

  /**
   * Add a course to the wishlist
   */
  async addItem(courseId: string | number): Promise<void> {
    await apiClient.post('/api/wishlist/item', { 
      purchasable_type: 'courses',
      purchasable_id: courseId
    })
  },

  /**
   * Remove an item from the wishlist
   */
  async removeItem(itemId: number): Promise<void> {
    await apiClient.delete(`/api/wishlist/item/${itemId}`)
  },
}
