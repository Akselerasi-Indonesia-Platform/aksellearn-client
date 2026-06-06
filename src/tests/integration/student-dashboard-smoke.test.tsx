import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders } from '@/tests/__utils__/test-utils'

// Mock components that might be problematic or not needed for smoke test
vi.mock('@/components/user/dashboard/sections/student-hero', () => ({
  StudentHero: () => <div data-testid="student-hero">Student Hero</div>,
}))
vi.mock('@/components/user/dashboard/sections/course-updates', () => ({
  CourseUpdates: () => <div data-testid="course-updates">Course Updates</div>,
}))

// Mock services directly to avoid integration issues with api-client
vi.mock('@/services/user/course.service', () => ({
  userCourseService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'course-1',
          uuid: 'course-1',
          slug: 'test-course',
          title: 'Test Student Course',
          category: { name: 'IT' },
          progress_percentage: 45,
          thumbnail: 'http://example.com/thumb.jpg',
          modules: [],
          modules_count: 5,
          stats: {
            total_modules: 5,
            total_lessons: 5,
            total_duration_human: '2h 30m',
          },
          remaining_days: 10,
        },
      ],
      meta: {
        total: 1,
        current_page: 1,
        per_page: 12,
        last_page: 1,
      },
    }),
  },
}))

vi.mock('@/services/user/dashboard.service', () => ({
  userDashboardService: {
    getSummary: vi.fn().mockResolvedValue({
      streak: 5,
      gpa: 4.0,
      total_enrolled: 1,
      completion_rate: 45,
      recent_courses: [],
      recent_activities: [
        {
          id: 'act-1',
          type: 'Lesson Complete',
          description: 'Completed introduction video',
        },
      ],
      total_certificates: 1,
      pending_assignments_count: 2,
    }),
  },
}))

// Import the component to test
import { Route } from '@/routes/student.dashboard'
const UserDashboard = (Route as any).component!

describe('Student Dashboard Smoke Tests', () => {
  it('Dashboard renders and loads core components', async () => {
    renderWithProviders(<UserDashboard />)

    // 1. Verify initial mount of Hero
    expect(screen.getByTestId('student-hero')).toBeInTheDocument()

    // 2. Wait for Course Resume List to load (indicated by Test Student Course)
    await waitFor(
      () => {
        expect(screen.getByText(/Test Student Course/i)).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('Dashboard Insights are visible', async () => {
    renderWithProviders(<UserDashboard />)

    await waitFor(
      () => {
        expect(screen.getByText(/Dashboard Insights/i)).toBeInTheDocument()
        expect(screen.getByText(/Browse More Modules/i)).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })
})
