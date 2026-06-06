import * as React from 'react'
import { useAuthStore } from '@/hooks/use-auth'

interface PermissionGuardProps {
  permission?: string | string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Atomic component to toggle UI visibility based on permissions.
 * Wraps children and only renders them if the user has the required permission(s).
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { user, can } = useAuthStore()

  if (!user) return <>{fallback}</>
  if (!permission) return <>{children}</>

  const permissions = Array.isArray(permission) ? permission : [permission]

  const hasPermission = requireAll
    ? permissions.every((p) => can(p))
    : permissions.some((p) => can(p))

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Specialized guard for admin-portal access.
 */
export const AdminGuard: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ children, fallback }) => {
  const { isAdmin } = useAuthStore()

  if (!isAdmin()) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
