import { createFileRoute } from '@tanstack/react-router'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { z } from 'zod'
import { Filter, X } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AdminDrawer } from '@/components/admin/shared/layout/admin-drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserForm } from '@/components/admin/users/user-form'
import { UserTable } from '@/components/admin/users/user-table'
import { AssignRolesForm } from '@/components/admin/users/assign-roles-form'
import { PageHeader } from '@/components/admin/shared/layout'
import { DataHeader, DataFooter, BulkActionBar, useColumnVisibility, DataColumnToggle } from '@/components/admin/shared/data'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { AddActionButton } from '@/components/admin/shared/button/add-action-button'
import { AuditHistoryPanel } from '@/components/admin/shared/audit-history-panel'
import { adminUserService } from '@/services/admin/user.service'
import { adminRoleService } from '@/services/admin/role.service'
import type { User } from '@/types/user'

const userSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
  search: z.string().default('').catch(''),
  role: z.string().optional().catch(undefined),
  status: z.string().optional().catch(undefined),
  sortBy: z.string().optional().catch(undefined),
  sortDir: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/admin/user/')({
  validateSearch: userSearchSchema,
  component: UsersPage,
})

function UsersPage() {
  const { t } = useTranslation()
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()
  const { page, limit, search, role, status, sortBy, sortDir } = searchParams

  const { data: roleOptions } = useQuery({
    queryKey: ['admin', 'roles', 'options'],
    queryFn: () => adminRoleService.getOptions(),
    staleTime: 5 * 60 * 1000,
  })
  const roles = roleOptions || []

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'users', searchParams],
    queryFn: () => adminUserService.getAll({
        page,
        limit,
        search,
        role_uuid: role,
        status,
        sort_by: sortBy,
        sort_dir: sortDir,
    }),
    placeholderData: keepPreviousData,
  })

  const users = data?.users || []
  const pagination = data?.meta || { page: 1, limit: 10, total: 0 }

  const setUrlSearch = (updater: (prev: typeof searchParams) => typeof searchParams) => {
    navigate({ search: updater })
  }

  const handleSearchChange = (newSearch: string) => {
    setUrlSearch((prev) => ({ ...prev, search: newSearch, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setUrlSearch((prev) => ({ ...prev, page: newPage }))
  }

  const handleSortChange = (key: string, dir: 'asc' | 'desc') => {
    setUrlSearch((prev) => ({ ...prev, sortBy: key, sortDir: dir, page: 1 }))
  }

  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isRolesOpen, setIsRolesOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | undefined>()
  
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set())

  const USER_COLUMNS = ['Name', 'Email', 'Role', 'Status', 'Created At', 'Actions']
  const { visibleColumns, toggleColumn } = useColumnVisibility(
    'admin_users_col_visibility',
    USER_COLUMNS
  )

  const handleCreate = () => {
    setSelectedUser(undefined)
    setIsFormOpen(true)
  }

  const handleAssignRolesClick = async (user: User) => {
    try {
      const userData = await adminUserService.getOne(user.id)
      setSelectedUser(userData)
      setIsRolesOpen(true)
    } catch (error) {
      console.error('Failed to fetch user roles:', error)
    }
  }

  const handleEdit = async (user: User) => {
    try {
      // Fetch fresh data for the user
      const userData = await adminUserService.getOne(user.id)
      setSelectedUser(userData)
      setIsFormOpen(true)
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    }
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: Partial<User>) => {
    try {
      if (selectedUser) {
        await adminUserService.update(selectedUser.id, data)
        toast.success('User updated successfully')
      } else {
        await adminUserService.create(data)
        toast.success('User created successfully')
      }
      // Refresh the list
      refetch()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error('Failed to save user')
      throw error // Re-throw to allow form to handle validation errors
    }
  }

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await adminUserService.delete(selectedUser.id)
        toast.success('User deleted successfully')
        // Refresh users
        refetch()
        setIsDeleteDialogOpen(false)
        setIsFormOpen(false)
        setSelectedKeys((prev) => {
          const next = new Set(prev)
          next.delete(selectedUser.id)
          return next
        })
        setSelectedUser(undefined)
      } catch (error) {
        console.error('Failed to delete user:', error)
        toast.error('Failed to delete user')
      }
    }
  }



  const handleRolesSubmit = async (tags: string[]) => {
    if (!selectedUser) return
    try {
      await adminUserService.assignRoles(selectedUser.id, tags)
      toast.success('Roles assigned successfully')
      refetch()
      setIsRolesOpen(false)
    } catch (error) {
      console.error('Failed to assign roles:', error)
      toast.error('Failed to assign roles')
      throw error
    }
  }

  const toggleRole = (val: string) => {
    const currentRoles = role ? role.split(',') : []
    const newRoles = currentRoles.includes(val)
      ? currentRoles.filter((r) => r !== val)
      : [...currentRoles, val]
      
    setSelectedKeys(new Set())
    setUrlSearch((prev) => ({
      ...prev,
      role: newRoles.length > 0 ? newRoles.join(',') : undefined,
      page: 1
    }))
  }

  const toggleStatus = (val: string) => {
    const currentStatuses = status ? status.split(',') : []
    const newStatuses = currentStatuses.includes(val)
      ? currentStatuses.filter((s) => s !== val)
      : [...currentStatuses, val]
      
    setSelectedKeys(new Set())
    setUrlSearch((prev) => ({
      ...prev,
      status: newStatuses.length > 0 ? newStatuses.join(',') : undefined,
      page: 1
    }))
  }

  const clearFilters = () => {
    setSelectedKeys(new Set())
    setUrlSearch((prev) => ({
      ...prev,
      search: '',
      role: undefined,
      status: undefined,
      page: 1
    }))
  }

  const activeFiltersCount = (role ? role.split(',').length : 0) + (status ? status.split(',').length : 0)

  const actions = (
    <AddActionButton label={t('users.addUser')} onClick={handleCreate} />
  )

  const filterTrigger = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-10 gap-2 border-border font-semibold shadow-sm overflow-hidden"
          variant="outline"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          {t('common.filters')}
          {activeFiltersCount > 0 && (
            <div className="flex items-center">
              <span className="mx-2 h-4 w-px bg-border group-hover:bg-primary/20 transition-colors" />
              <Badge
                className="rounded-sm px-1.5 font-bold h-5 min-w-[20px] justify-center bg-primary text-primary-foreground"
                variant="secondary"
              >
                {activeFiltersCount}
              </Badge>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] admin-theme animate-in zoom-in-95 duration-200"
      >
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-3">
          Role Filter
        </DropdownMenuLabel>
        {roles.map((roleItem) => (
          <DropdownMenuCheckboxItem
            key={roleItem.value}
            checked={role?.split(',').includes(roleItem.value) ?? false}
            onCheckedChange={() => toggleRole(roleItem.value)}
            className="text-xs py-2"
          >
            {roleItem.label}
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-1">
          Account Status
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={status?.split(',').includes('active') ?? false}
          onCheckedChange={() => toggleStatus('active')}
          className="text-xs py-2"
        >
          {t('common.active')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={status?.split(',').includes('inactive') ?? false}
          onCheckedChange={() => toggleStatus('inactive')}
          className="text-xs py-2"
        >
          {t('common.inactive')}
        </DropdownMenuCheckboxItem>

        {activeFiltersCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              className="w-full justify-start px-2 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
              variant="ghost"
              onClick={clearFilters}
            >
              <X className="mr-2 h-3.5 w-3.5" />
              {t('common.clearFilters')}
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <AdminPage>
      <PageHeader
        title={t('users.title')}
        description={t('users.description')}
        actions={actions}
      />

      <DataHeader
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        filterTrigger={filterTrigger}
        columnToggle={
          <DataColumnToggle
            columns={USER_COLUMNS}
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
          />
        }
        resultsCount={pagination.total}
        resultsLabel="users found"
      />

      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <UserTable
          isLoading={isLoading || isFetching}
          pageSize={pagination.limit}
          users={users}
          onEdit={handleEdit}
          onAssignRoles={handleAssignRolesClick}
          visibleColumns={visibleColumns}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          selectable={true}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        />

        <DataFooter
          page={pagination.page}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={handlePageChange}
        />
      </div>

      {/* User Form — Dialog (primary CRUD, ≤6 fields) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[520px] admin-theme rounded-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-border bg-muted/30">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {selectedUser ? t('common.edit') : t('users.addUser')}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              {selectedUser
                ? t('common.updateDetails', 'Update details here.')
                : t('common.enterDetails', 'Enter details to create a new one.')}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6 space-y-0 max-h-[70vh] overflow-y-auto">
            <UserForm
              user={selectedUser}
              onCancel={() => setIsFormOpen(false)}
              onSubmit={handleFormSubmit}
              onDelete={handleDeleteClick}
            />
            {selectedUser && selectedUser.db_id && (
              <div className="pt-6 border-t border-border/50">
                <AuditHistoryPanel entityType="user" entityId={selectedUser.db_id} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Roles Drawer */}
      <AdminDrawer
        open={isRolesOpen}
        onOpenChange={setIsRolesOpen}
        title="Assign Roles"
        description={`Assign roles to ${selectedUser?.name}.`}
      >
        <AssignRolesForm
          initialRoles={
            selectedUser?.roles ||
            (selectedUser?.role && selectedUser.role !== 'user'
              ? [selectedUser.role]
              : [])
          }
          onSubmit={handleRolesSubmit}
          onCancel={() => setIsRolesOpen(false)}
        />
      </AdminDrawer>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.areYouSure', 'Are you absolutely sure?')}
        description={`${t('common.deleteConfirmation', 'This action cannot be undone. This will permanently delete the account for')} ${selectedUser?.name}.`}
        confirmText={t('common.delete')}
        onConfirm={confirmDelete}
      />

      <BulkActionBar
        selectedCount={selectedKeys.size}
        onClearSelection={() => setSelectedKeys(new Set())}
      />
    </AdminPage>
  )
}
