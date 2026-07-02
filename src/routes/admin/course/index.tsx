import { createFileRoute } from '@tanstack/react-router'
import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Filter, Plus, X } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CourseTable } from '@/components/admin/courses/course-table'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/admin/shared/layout'
import { DataHeader, DataFooter, BulkActionBar, useColumnVisibility, DataColumnToggle } from '@/components/admin/shared/data'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { AddActionButton } from '@/components/admin/shared/button/add-action-button'
import { adminCourseService } from '@/services/admin/course.service'
import { adminCourseCategoryService } from '@/services/admin/course-category.service'
import { invalidateDiscoveryCache } from '@/lib/cache-utils'
import type { Course } from '@/types/course'
import { CourseDrawer } from '@/components/admin/courses/quick-add-course-modal'

const courseSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
  search: z.string().default('').catch(''),
  status: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  sortBy: z.string().optional().catch(undefined),
  sortDir: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/admin/course/')({
  validateSearch: courseSearchSchema,
  head: () => ({
    meta: [{ title: 'Aksellearn | Courses' }],
  }),
  component: CoursesPage,
})

function CoursesPage() {
  const { t } = useTranslation()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const searchParams = Route.useSearch()
  
  const { page, limit, search, status, category, sortBy, sortDir } = searchParams

  const { data: catData } = useQuery({
    queryKey: ['admin', 'course-categories', 'options'],
    queryFn: () => adminCourseCategoryService.getOptions(),
    staleTime: 5 * 60 * 1000,
  })
  const categories = catData || []

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'courses', searchParams],
    queryFn: () => adminCourseService.getAll({
        page,
        limit,
        search,
        is_active: status,
        category_uuid: category,
        sort_by: sortBy,
        sort_dir: sortDir,
    }),
    placeholderData: keepPreviousData,
  })

  const courses = data?.courses || []
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

  const [selectedCourse, setSelectedCourse] = React.useState<
    Course | undefined
  >()
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false)

  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set())

  const COURSE_COLUMNS = ['Title', 'Category', 'Status', 'Price', 'Published At', 'Created At', 'Actions']
  const { visibleColumns, toggleColumn } = useColumnVisibility(
    'admin_courses_col_visibility',
    COURSE_COLUMNS
  )

  const handleCreate = () => setIsQuickAddOpen(true)
  const handleEdit = (course: Course) =>
    navigate({ to: `/admin/course/${course.uuid}` })

  const handleShowInsights = (course: Course) => {
    navigate({ to: `/admin/course/gradebook/${course.uuid}` })
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

  const toggleCategory = (id: string) => {
    const currentCategories = category ? category.split(',') : []
    const newCategories = currentCategories.includes(id)
      ? currentCategories.filter((c) => c !== id)
      : [...currentCategories, id]
      
    setSelectedKeys(new Set())
    setUrlSearch((prev) => ({ 
      ...prev, 
      category: newCategories.length > 0 ? newCategories.join(',') : undefined,
      page: 1 
    }))
  }

  const clearFilters = () => {
    setSelectedKeys(new Set())
    setUrlSearch((prev) => ({
      ...prev,
      search: '',
      status: undefined,
      category: undefined,
      page: 1,
    }))
  }

  const activeFiltersCount = (status ? status.split(',').length : 0) + (category ? category.split(',').length : 0)

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
            <div className="flex items-center">
              <span className="mx-2 h-4 w-px bg-border" />
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
          {t('common.status', 'Status')}
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={status?.split(',').includes('1') ?? false}
          onCheckedChange={() => toggleStatus('1')}
        >
          {t('common.active', 'Active')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={status?.split(',').includes('0') ?? false}
          onCheckedChange={() => toggleStatus('0')}
        >
          {t('common.inactive', 'Inactive')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-1">
          Categories
        </DropdownMenuLabel>
        {categories.map((cat) => (
          <DropdownMenuCheckboxItem
            key={cat.value}
            checked={category?.split(',').includes(cat.value) ?? false}
            onCheckedChange={() => toggleCategory(cat.value)}
          >
            {cat.label}
          </DropdownMenuCheckboxItem>
        ))}
        {activeFiltersCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              className="w-full justify-start px-2 text-xs font-bold text-destructive hover:bg-destructive/10 h-8"
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
        title={t('courses.title')}
        description={t('courses.description')}
        actions={
          <AddActionButton
            label={t('courses.addCourse')}
            onClick={handleCreate}
          />
        }
      />

      <DataHeader
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        filterTrigger={filterTrigger}
        columnToggle={
          <DataColumnToggle
            columns={COURSE_COLUMNS}
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
          />
        }
        resultsCount={pagination.total}
        resultsLabel="courses found"
      />

      <div className="flex flex-col gap-4">
        <CourseTable
          categories={categories}
          courses={courses}
          isLoading={isLoading || isFetching}
          pageSize={pagination.limit}
          onEdit={handleEdit}
          onShowInsights={handleShowInsights}
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


      <CourseDrawer
        categories={categories}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />


    </AdminPage>
  )
}
