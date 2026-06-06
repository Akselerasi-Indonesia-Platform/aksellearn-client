import { createFileRoute } from '@tanstack/react-router'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { z } from 'zod'
import { adminOrganizationService } from '@/services/admin/organization.service'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import * as React from 'react'
import { OrganizationTable } from '@/components/admin/organizations/organization-table'
import { DataHeader, DataFooter } from '@/components/admin/shared/data'
import { PageHeader } from '@/components/admin/shared/layout'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

import { AddActionButton } from '@/components/admin/shared/button/add-action-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { OrganizationForm } from '@/components/admin/organizations/organization-form'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { toast } from 'sonner'
import type { Organization } from '@/types/organization'

const orgSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
  search: z.string().default('').catch(''),
})

export const Route = createFileRoute('/admin/organization/')({
  validateSearch: orgSearchSchema,
  component: OrganizationListPage,
})

function OrganizationListPage() {
  const { t } = useTranslation()
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()
  
  const { page, limit, search } = searchParams

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'organizations', searchParams],
    queryFn: () =>
      adminOrganizationService.getAll({
        search,
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
  })

  // CRUD States
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedOrg, setSelectedOrg] = React.useState<
    Organization | undefined
  >()

  const handleCreate = () => {
    setSelectedOrg(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (org: Organization) => {
    setSelectedOrg(org)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedOrg) {
        await adminOrganizationService.update(selectedOrg.uuid, values)
        toast.success('Organization updated successfully')
      } else {
        await adminOrganizationService.create(values)
        toast.success('Organization created successfully')
      }
      refetch()
      setIsFormOpen(false)
    } catch (error) {
      toast.error('Failed to save organization')
    }
  }

  const confirmDelete = async () => {
    if (!selectedOrg) return
    try {
      await adminOrganizationService.delete(selectedOrg.uuid)
      toast.success('Organization deleted successfully')
      refetch()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error('Failed to delete organization')
    }
  }

  const setUrlSearch = (updater: (prev: typeof searchParams) => typeof searchParams) => {
    navigate({ search: updater })
  }

  const handlePageChange = (newPage: number) => {
    setUrlSearch((prev) => ({ ...prev, page: newPage }))
  }

  const handleSearchChange = (newSearch: string) => {
    setUrlSearch((prev) => ({ ...prev, search: newSearch, page: 1 }))
  }

  const clearFilters = () => {
    setUrlSearch((prev) => ({
      ...prev,
      search: '',
      page: 1
    }))
  }

  const actions = (
    <AddActionButton label="Add Organization" onClick={handleCreate} />
  )

  return (
    <AdminPage>
      <PageHeader
        title="Organizations"
        description="Manage B2B partners and corporate clients."
        actions={actions}
      />

      <DataHeader
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onClearFilters={clearFilters}
        activeFiltersCount={0}
        resultsCount={data?.meta.total || 0}
        resultsLabel="organizations found"
      />

      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <OrganizationTable
          organizations={data?.organizations || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          pageSize={limit || 10}
        />

        <DataFooter
          page={page}
          total={data?.meta.total || 0}
          limit={limit || 10}
          onPageChange={handlePageChange}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] admin-theme">
          <DialogHeader>
            <DialogTitle>
              {selectedOrg ? 'Edit Organization' : 'Add Organization'}
            </DialogTitle>
            <DialogDescription>
              {selectedOrg
                ? 'Update organization details here.'
                : 'Enter details to create a new organization partner.'}
            </DialogDescription>
          </DialogHeader>
          <OrganizationForm
            organization={selectedOrg}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Organization"
        description={`Are you sure you want to delete ${selectedOrg?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
      />
    </AdminPage>
  )
}
