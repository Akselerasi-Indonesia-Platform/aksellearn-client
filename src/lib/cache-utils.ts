import { queryClient } from '@/lib/query-client'

/**
 * Invalidates all queries related to the public discovery and course search.
 * Call this after making changes in the admin dashboard (create/update/delete courses).
 */
export const invalidateDiscoveryCache = () => {
  // Invalidate discovery-specific hooks
  queryClient.invalidateQueries({ queryKey: ['discovery'] })
  
  // Invalidate public-facing hooks
  queryClient.invalidateQueries({ queryKey: ['public'] })
  
  // Specifically target the course list and categories
  queryClient.invalidateQueries({ queryKey: ['discovery', 'course-search'] })
  queryClient.invalidateQueries({ queryKey: ['discovery', 'course-categories'] })
  queryClient.invalidateQueries({ queryKey: ['public', 'courses'] })
  queryClient.invalidateQueries({ queryKey: ['public', 'categories'] })
  queryClient.invalidateQueries({ queryKey: ['public', 'platform-stats'] })
  queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
}
