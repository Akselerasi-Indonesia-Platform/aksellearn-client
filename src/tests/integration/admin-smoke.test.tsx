import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/tests/__utils__/test-utils'

// Import Routes to extract Component
import { Route as DashboardRoute } from '@/routes/admin/dashboard'
import { Route as UsersRoute } from '@/routes/admin/user/index'
import { Route as OrganizationListRoute } from '@/routes/admin/organization/index'
import { Route as CoursesRoute } from '@/routes/admin/course/index'
import { Route as EnrollmentsRoute } from '@/routes/admin/course/enrollment'
import { Route as OrganizationTagListRoute } from '@/routes/admin/organization/tag'

const DashboardPage = (DashboardRoute as any).component!
const UsersPage = (UsersRoute as any).component!
const OrganizationListPage = (OrganizationListRoute as any).component!
const CoursesPage = (CoursesRoute as any).component!
const EnrollmentsPage = (EnrollmentsRoute as any).component!
const OrganizationTagListPage = (OrganizationTagListRoute as any).component!

describe('Admin Portal Smoke Tests', () => {
  it('Dashboard Page renders and loads stats', async () => {
    renderWithProviders(<DashboardPage />)

    // Verify initial mount
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()

    // Verify Date Pickers are present
    expect(screen.getByText(/Start Date/i)).toBeInTheDocument()
    expect(screen.getByText(/End Date/i)).toBeInTheDocument()

    // Wait for data load (Monitoring active text)
    await waitFor(() => {
      expect(screen.getByText(/data monitoring/i)).toBeInTheDocument()
    })
  })

  it('Users Management Page renders and loads table', async () => {
    renderWithProviders(<UsersPage />)

    // Check Header by role to avoid breadcrumb conflict
    expect(
      screen.getByRole('heading', { level: 2, name: /Users/i }),
    ).toBeInTheDocument()

    // Wait for data (Mock user name John Doe)
    await waitFor(() => {
      expect(screen.queryAllByText(/John Doe/i).length).toBeGreaterThan(0)
    })
  })

  it('Organizations Page renders and loads table', async () => {
    renderWithProviders(<OrganizationListPage />)

    expect(
      screen.getByRole('heading', { level: 2, name: /Organizations/i }),
    ).toBeInTheDocument()

    // Wait for dynamic data
    await waitFor(() => {
      expect(screen.queryAllByText(/Test Org/i).length).toBeGreaterThan(0)
    })
  })

  it('Organization Tags Management Page renders and loads table', async () => {
    renderWithProviders(<OrganizationTagListPage />)

    expect(
      screen.getByRole('heading', { level: 2, name: /Industry Tags/i }),
    ).toBeInTheDocument()

    // Wait for dynamic data
    await waitFor(() => {
      expect(screen.queryAllByText(/Technology/i).length).toBeGreaterThan(0)
    })
  })

  it('Courses Page renders and loads table', async () => {
    renderWithProviders(<CoursesPage />)

    expect(
      screen.getByRole('heading', { level: 2, name: /Courses/i }),
    ).toBeInTheDocument()

    // Wait for loaded data
    await waitFor(
      () => {
        expect(screen.queryAllByText(/Test Course/i).length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  })

  it('Enrollments Page renders and loads table', async () => {
    renderWithProviders(<EnrollmentsPage />)

    expect(
      screen.getByRole('heading', { level: 2, name: /Enrollments/i }),
    ).toBeInTheDocument()

    // Check for mocked enrollment user
    await waitFor(
      () => {
        expect(screen.queryAllByText(/John Doe/i).length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  })
})
