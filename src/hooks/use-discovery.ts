import { useQuery } from '@tanstack/react-query'
import { discoveryCourseService } from '@/services/discovery/course.service'
import { discoveryArticleService } from '@/services/discovery/article.service'

export function useCourseCategories() {
  return useQuery({
    queryKey: ['discovery', 'course-categories'],
    queryFn: () => discoveryCourseService.getCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['discovery', 'category', slug],
    queryFn: () => discoveryCourseService.getCategoryBySlug(slug),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!slug,
  })
}

export function usePublicArticles(
  params?: Parameters<typeof discoveryArticleService.getAll>[0],
) {
  return useQuery({
    queryKey: ['discovery', 'articles', params],
    queryFn: () => discoveryArticleService.getAll(params),
  })
}

export function usePublicCourseSearch(
  params: Parameters<typeof discoveryCourseService.search>[0],
) {
  return useQuery({
    queryKey: ['discovery', 'course-search', params],
    queryFn: () => discoveryCourseService.search(params),
  })
}
