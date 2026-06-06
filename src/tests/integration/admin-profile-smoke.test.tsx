import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders } from '@/tests/__utils__/test-utils'
import { ProfilePage } from '@/routes/admin/profile'

// Mock the Auth Store to have a user
vi.mock('@/hooks/use-auth', () => ({
  useAuthStore: () => ({
    user: {
      name: 'Test Admin',
      email: 'admin@test.com',
      avatar: '',
      roles: ['Super Admin'],
    },
    setAuth: vi.fn(),
  }),
}))

describe('Admin Profile Page Smoke Test', () => {
  it('Profile Page renders user information', async () => {
    renderWithProviders(<ProfilePage />)

    // Verify header
    expect(screen.getByText(/Profile Settings/i)).toBeInTheDocument()

    // Wait for mount and check data
    await waitFor(() => {
      // Check for name in header and card
      const nameElements = screen.queryAllByText(/Test Admin/i)
      expect(nameElements.length).toBeGreaterThan(0)

      // Check for email
      const emailInput = screen.getByLabelText(
        /Email Address/i,
      ) as HTMLInputElement
      expect(emailInput.value).toBe('admin@test.com')
    })
  })

  it('Profile Page has security section', async () => {
    renderWithProviders(<ProfilePage />)

    expect(screen.getByText(/Security & Privacy/i)).toBeInTheDocument()
    expect(screen.getByText(/Change Password/i)).toBeInTheDocument()
  })
})
