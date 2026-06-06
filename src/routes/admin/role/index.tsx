import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoleForm } from '@/components/admin/roles/role-form'
import { RoleTable } from '@/components/admin/roles/role-table'
import { AssignPermissionsForm } from '@/components/admin/roles/assign-permissions-form'
import { PermissionTable } from '@/components/admin/permissions/permission-table'
import { PageHeader } from '@/components/admin/shared/layout'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { AdminDrawer } from '@/components/admin/shared/layout/admin-drawer'
import { adminRoleService } from '@/services/admin/role.service'
import { adminPermissionService } from '@/services/admin/permission.service'
import type { Role } from '@/types/role'
import type { Permission } from '@/types/permission'

const roleSearchSchema = z.object({
  tab: z.enum(['roles', 'permissions']).default('roles').catch('roles'),
  page: z.number().default(1).catch(1),
})

export const Route = createFileRoute('/admin/role/')({
  validateSearch: roleSearchSchema,
  component: RolesPermissionsPage,
})

function RolesPermissionsPage() {
  const navigate = Route.useNavigate()
  const { tab, page } = Route.useSearch()
  const queryClient = useQueryClient()

  const { data: rolesData, isLoading: isRolesLoading, refetch: fetchRoles } = useQuery({
    queryKey: ['admin', 'roles', { page }],
    queryFn: () => adminRoleService.getAll({ page, limit: 50 }),
    placeholderData: keepPreviousData,
  })

  const { data: permissionsData, isLoading: isPermissionsLoading, refetch: fetchPermissions } = useQuery({
    queryKey: ['admin', 'permissions', { page }],
    queryFn: () => adminPermissionService.getAll({ page, limit: 100 }),
    placeholderData: keepPreviousData,
  })

  // To fetch all permissions for assignment form
  const { data: allPermissionsData } = useQuery({
    queryKey: ['admin', 'permissions', 'all'],
    queryFn: () => adminPermissionService.getAll({ page: 1, limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  })

  const roles = rolesData?.roles || []
  const rolesPagination = rolesData?.meta || { page: 1, limit: 50, total: 0 }
  const permissions = permissionsData?.permissions || []
  const permissionsPagination = permissionsData?.meta || { page: 1, limit: 100, total: 0 }
  const allPermissions = allPermissionsData?.permissions || []

  const setTab = (newTab: string) => {
    navigate({ search: (prev) => ({ ...prev, tab: newTab as any, page: 1 }) })
  }

  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isAssignPermissionsOpen, setIsAssignPermissionsOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<Role | undefined>()

  const handleCreateRole = () => {
    setSelectedRole(undefined)
    setIsFormOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setIsFormOpen(true)
  }

  const handleDeleteRoleClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleAssignPermissionsClick = async (role: Role) => {
    try {
      const roleData = await adminRoleService.getOne(role.id)
      setSelectedRole(roleData)
      setIsAssignPermissionsOpen(true)
    } catch (error) {
      console.error('Failed to fetch role details', error)
    }
  }

  const handleRoleFormSubmit = async (data: any) => {
    try {
      if (selectedRole) {
        await adminRoleService.update(selectedRole.id, data)
        toast.success('Role updated successfully')
      } else {
        await adminRoleService.create(data)
        toast.success('Role created successfully')
      }
      fetchRoles()
      setIsFormOpen(false)
    } catch (error) {
      toast.error('Failed to save role')
      throw error
    }
  }

  const confirmDeleteRole = async () => {
    if (selectedRole) {
      try {
        await adminRoleService.delete(selectedRole.id)
        toast.success('Role deleted successfully')
        fetchRoles()
      } catch {
        toast.error('Failed to delete role')
      } finally {
        setIsDeleteDialogOpen(false)
        setIsFormOpen(false)
        setSelectedRole(undefined)
      }
    }
  }

  const handleAssignPermissionsSubmit = async (tags: string[]) => {
    if (!selectedRole) return
    try {
      await adminRoleService.assignPermissions(selectedRole.id, tags)
      toast.success('Permissions assigned successfully')
      fetchRoles()
      setIsAssignPermissionsOpen(false)
    } catch (error) {
      toast.error('Failed to assign permissions')
      throw error
    }
  }

  return (
    <AdminPage>
      <PageHeader
        title="Roles & Permissions"
        description="Manage roles, map permissions, and configure access levels."
        actions={
          tab === 'roles' && (
            <Button
              className="shadow-lg shadow-primary/20 font-bold px-6"
              onClick={handleCreateRole}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Role
            </Button>
          )
        }
      />

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full mt-6"
      >
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="roles" className="px-6 font-bold">
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="px-6 font-bold">
            Available Permissions
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="roles"
          className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-400"
        >
          <RoleTable
            roles={roles}
            isLoading={isRolesLoading}
            pageSize={rolesPagination.limit}
            onEdit={handleEditRole}
            onAssignPermissions={handleAssignPermissionsClick}
          />
        </TabsContent>
        <TabsContent
          value="permissions"
          className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-400"
        >
          <PermissionTable
            permissions={permissions}
            isLoading={isPermissionsLoading}
            pageSize={permissionsPagination.limit}
          />
        </TabsContent>
      </Tabs>

      {/* Role Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] admin-theme">
          <DialogHeader>
            <DialogTitle>{selectedRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
            <DialogDescription>
              {selectedRole
                ? 'Update role details below.'
                : 'Enter details to create a new role.'}
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            role={selectedRole}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={handleRoleFormSubmit}
            onDelete={handleDeleteRoleClick}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Permissions — Sheet (wide auxiliary action, benefits from side-panel) */}
      <AdminDrawer
        open={isAssignPermissionsOpen}
        onOpenChange={setIsAssignPermissionsOpen}
        title={`Assign Permissions — ${selectedRole?.name || ''}`}
        description="Toggle permissions on/off. Changes are applied immediately on save."
      >
        <AssignPermissionsForm
          initialPermissions={selectedRole?.permissions || []}
          availablePermissions={allPermissions}
          onSubmit={handleAssignPermissionsSubmit}
          onCancel={() => setIsAssignPermissionsOpen(false)}
        />
      </AdminDrawer>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Role"
        description={`This action cannot be undone. This will permanently delete the role "${selectedRole?.name}".`}
        confirmText="Delete Role"
        onConfirm={confirmDeleteRole}
      />
    </AdminPage>
  )
}
