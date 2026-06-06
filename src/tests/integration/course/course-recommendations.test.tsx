// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/tests/__utils__/test-utils'
import { useParams } from '@tanstack/react-router'

// Mock useParams to return a specific course slug
vi.mocked(useParams).mockReturnValue({ courseSlug: 'test-course-slug' })

// Mock services
vi.mock('@/services/discovery/course.service', () => ({
  discoveryCourseService: {
    getDetails: vi.fn(),
    getRelatedCourses: vi.fn(),
  },
}))

vi.mock('@/services/user/course.service', () => ({
  userCourseService: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

vi.mock('@/services/user/wishlist.service', () => ({
  userWishlistService: {
    getWishlist: vi.fn().mockResolvedValue([]),
  },
}))

// Import Route and extract component
import { Route } from '@/routes/course/$courseSlug'
import { discoveryCourseService } from '@/services/discovery/course.service'
const CoursePublicDetails = (Route as any).component!

describe('Course Public Details - Recommended Courses Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the course details page and recommended courses section when related courses exist', async () => {
    // Mock getDetails response
    vi.mocked(discoveryCourseService.getDetails).mockResolvedValue({
      id: 'course-123',
      uuid: 'course-uuid-123',
      slug: 'test-course-slug',
      title: 'Mastering Go & React',
      description: 'An advanced full-stack course.',
      price: 250000,
      price_discount: 199000,
      category: { uuid: 'cat-1', name: 'Software Development', slug: 'software-dev' },
      summary: {
        stats: {
          average_rating: 4.9,
          total_reviews: 24,
          total_students: 150,
          total_lessons: 45,
          total_duration_human_full: '12h 30m',
        },
      },
      what_you_will_get: ['Certificate of completion'],
      requirements: ['Basic HTML/CSS/JS'],
    } as any)

    // Mock getRelatedCourses response
    vi.mocked(discoveryCourseService.getRelatedCourses).mockResolvedValue([
      {
        id: 'related-1',
        uuid: 'related-uuid-1',
        slug: 'go-fundamentals',
        title: 'Go Fundamentals',
        description: 'Learn the basics of Go.',
        price: 120000,
        price_discount: 0,
        category: { uuid: 'cat-1', name: 'Software Development', slug: 'software-dev' },
        summary: {
          stats: {
            average_rating: 4.7,
            total_reviews: 12,
            total_students: 80,
            total_lessons: 15,
            total_duration_human_full: '4h 15m',
          },
        },
      } as any,
    ])

    renderWithProviders(<CoursePublicDetails />)

    // 1. Verify main course details are loaded
    await waitFor(() => {
      expect(screen.getAllByText('Mastering Go & React').length).toBeGreaterThan(0)
    })

    // 2. Verify Recommended Courses section header is displayed
    await waitFor(() => {
      expect(screen.getByText('Recommended Courses')).toBeInTheDocument()
      expect(screen.getByText('Go Fundamentals')).toBeInTheDocument()
    })
  })

  it('hides the Recommended Courses section entirely if no related courses are returned', async () => {
    // Mock getDetails response
    vi.mocked(discoveryCourseService.getDetails).mockResolvedValue({
      id: 'course-123',
      uuid: 'course-uuid-123',
      slug: 'test-course-slug',
      title: 'Mastering Go & React',
      description: 'An advanced full-stack course.',
      price: 250000,
      price_discount: 199000,
      category: { uuid: 'cat-1', name: 'Software Development', slug: 'software-dev' },
      summary: {
        stats: {
          average_rating: 4.9,
          total_reviews: 24,
          total_students: 150,
          total_lessons: 45,
          total_duration_human_full: '12h 30m',
        },
      },
    } as any)

    // Mock empty getRelatedCourses response
    vi.mocked(discoveryCourseService.getRelatedCourses).mockResolvedValue([])

    renderWithProviders(<CoursePublicDetails />)

    // 1. Verify main course details are loaded
    await waitFor(() => {
      expect(screen.getAllByText('Mastering Go & React').length).toBeGreaterThan(0)
    })

    // 2. Verify Recommended Courses section is not visible
    expect(screen.queryByText('Recommended Courses')).not.toBeInTheDocument()
  })
})
