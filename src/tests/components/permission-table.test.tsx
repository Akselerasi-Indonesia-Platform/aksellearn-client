/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { PermissionTable } from '@/components/admin/permissions/permission-table'
import type { Permission } from '@/types/permission'

describe('PermissionTable Component', () => {
  const mockPermissions: Permission[] = [
    {
      id: '1',
      name: 'user.create',
      createdAt: '2024-03-17T10:00:00Z',
    },
    {
      id: '2',
      name: 'user.delete',
      createdAt: '2024-03-17T11:00:00Z',
    },
  ]

  it('should render the permission table with data', () => {
    render(<PermissionTable permissions={mockPermissions} isLoading={false} />)

    // Check if table headers are present
    expect(screen.getByText('Permission Name')).toBeInTheDocument()
    expect(screen.getByText('Created At')).toBeInTheDocument()

    // Check if formatted permission names are present
    expect(screen.getByText('User Create')).toBeInTheDocument()
    expect(screen.getByText('User Delete')).toBeInTheDocument()
  })

  it('should render skeleton state when loading', () => {
    const { container } = render(
      <PermissionTable permissions={[]} isLoading={true} pageSize={5} />,
    )

    // Should have 5 skeleton rows
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should render empty state when no permissions', () => {
    render(<PermissionTable permissions={[]} isLoading={false} />)
    expect(screen.getByText('No permissions found.')).toBeInTheDocument()
  })
})
