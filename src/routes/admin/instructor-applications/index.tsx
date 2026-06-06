import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ApplicationTable } from '@/components/admin/instructor-applications/application-table'
import { instructorApplicationService } from '@/services/instructor-application.service'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPage, PageHeader } from '@/components/admin/shared/layout'
import { DataHeader, DataFooter, useColumnVisibility, DataColumnToggle } from '@/components/admin/shared/data'

import { z } from 'zod'

const applicationSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
  status: z.string().optional().catch(undefined),
  search: z.string().default('').catch(''),
})

export const Route = createFileRoute('/admin/instructor-applications/')({
  validateSearch: applicationSearchSchema,
  component: AdminInstructorApplicationsPage,
})

const APP_COLUMNS = ['Name', 'Headline', 'Expertise', 'Submitted', 'Status', 'Actions']

function AdminInstructorApplicationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const searchParams = Route.useSearch()

  const { limit, status, search, page } = searchParams

  const { visibleColumns, toggleColumn } = useColumnVisibility(
    'admin_instructor_applications_col_visibility',
    APP_COLUMNS
  )

  const { data, isLoading } = useQuery({
    queryKey: ['admin-instructor-applications', searchParams],
    queryFn: () => instructorApplicationService.adminIndex({
      search: search || undefined,
      status: status || undefined,
      page,
      limit,
    }),
  })

  const applications = data?.data || []
  const meta = data?.meta

  const setUrlSearch = (updater: (prev: typeof searchParams) => typeof searchParams) => {
    navigate({ search: updater as any })
  }

  const handlePageChange = (newPage: number) => {
    setUrlSearch((prev) => ({ ...prev, page: newPage }))
  }

  const handleSearchChange = (newSearch: string) => {
    setUrlSearch((prev) => ({ ...prev, search: newSearch, page: 1 }))
  }

  const toggleStatus = (val: string) => {
    const currentStatuses = status ? status.split(',') : []
    const newStatuses = currentStatuses.includes(val)
      ? currentStatuses.filter((s) => s !== val)
      : [...currentStatuses, val]

    setUrlSearch((prev) => ({
      ...prev,
      status: newStatuses.length > 0 ? newStatuses.join(',') : undefined,
      page: 1,
    }))
  }

  const clearFilters = () => {
    setUrlSearch((prev) => ({
      ...prev,
      search: '',
      status: undefined,
      page: 1
    }))
  }

  const activeFiltersCount = status ? status.split(',').length : 0

  const filterTrigger = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-10 gap-2 border-border font-semibold shadow-sm"
          variant="outline"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          {t('common.filters')}
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 rounded-sm px-1 font-bold h-5 bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] admin-theme">
        <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pt-3">
          Application Status
        </DropdownMenuLabel>
        {['pending', 'under_review', 'accepted', 'rejected'].map(
          (statusItem) => (
            <DropdownMenuCheckboxItem
              key={statusItem}
              checked={status?.split(',').includes(statusItem) ?? false}
              onCheckedChange={() => toggleStatus(statusItem)}
              className="capitalize text-xs py-2"
            >
              {statusItem.replace('_', ' ')}
            </DropdownMenuCheckboxItem>
          ),
        )}
        {activeFiltersCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              className="w-full justify-start px-2 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
              variant="ghost"
              onClick={clearFilters}
            >
              <X className="mr-2 h-4 w-4" />
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
        title="Instructor Applications"
        description="Review and manage requests from users who want to become instructors."
      />

      <DataHeader
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        filterTrigger={filterTrigger}
        columnToggle={
          <DataColumnToggle
            columns={APP_COLUMNS}
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
          />
        }
        resultsCount={meta?.total}
        resultsLabel="applications found"
      />

      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <ApplicationTable 
            applications={applications} 
            onView={(app) => {
              navigate({ to: `/admin/instructor-applications/${app.uuid}` })
            }} 
            isLoading={isLoading} 
            pageSize={limit || 10}
            visibleColumns={visibleColumns}
          />
        </div>

        {meta && (
          <DataFooter
            page={meta.page || page}
            total={meta.total || 0}
            limit={meta.limit || limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </AdminPage>
  )
}
