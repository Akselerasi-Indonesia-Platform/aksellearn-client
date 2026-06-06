import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminEnrollmentService } from '@/services/admin/enrollment.service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/admin/shared/searchable-select'
import { adminCourseService } from '@/services/admin/course.service'
import { adminCourseCategoryService } from '@/services/admin/course-category.service'
import { adminOrganizationService } from '@/services/admin/organization.service'
import { cn, formatDate } from '@/lib/utils'
import {
  Plus,
  Filter,
  Tag,
  LayoutGrid,
  CheckCircle2,
  Building2,
  Calendar as CalendarIcon,
  Upload,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { toast } from 'sonner'
import * as React from 'react'
import { GrantAccessForm } from '@/components/admin/course/grant-access-form'
import { BulkImportForm } from '@/components/admin/course/bulk-import-form'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { PageHeader } from '@/components/admin/shared/layout'
import { DataHeader, DataFooter } from '@/components/admin/shared/data'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { AddActionButton } from '@/components/admin/shared/button/add-action-button'
import { EnrollmentTable } from '@/components/admin/course/enrollment-table'
import { useAuthStore } from '@/hooks/use-auth'

function CategoryFilterSelect({
  value,
  onValueChange,
}: {
  value?: string
  onValueChange: (val: string) => void
}) {
  const [categories, setCategories] = React.useState<
    { label: string; value: string }[]
  >([])

  React.useEffect(() => {
    adminCourseCategoryService.getOptions().then((options) => {
      setCategories([{ label: 'All Categories', value: 'all' }, ...options])
    })
  }, [])

  return (
    <SearchableSelect
      placeholder="Select category..."
      options={categories}
      onValueChange={(val) => onValueChange(val === 'all' ? '' : val)}
      value={value || 'all'}
    />
  )
}

function OrganizationFilterSelect({
  value,
  onValueChange,
}: {
  value?: string
  onValueChange: (val: string) => void
}) {
  const [organizations, setOrganizations] = React.useState<
    { label: string; value: string }[]
  >([])

  React.useEffect(() => {
    adminOrganizationService
      .getAll({ limit: 100 })
      .then(({ organizations }) => {
        setOrganizations([
          { label: 'All Organizations', value: 'all' },
          ...organizations.map((o) => ({ label: o.name, value: String(o.id) })),
        ])
      })
  }, [])

  return (
    <SearchableSelect
      placeholder="Select organization..."
      options={organizations}
      onValueChange={(val) => onValueChange(val === 'all' ? '' : val)}
      value={value || 'all'}
    />
  )
}

function StandaloneDatePicker({
  value,
  onChange,
  placeholder,
}: {
  value?: string
  onChange: (val: string | undefined) => void
  placeholder?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full pl-3 text-left font-normal h-10 rounded-xl border-border hover:border-primary/50 transition-all',
            !value && 'text-muted-foreground',
          )}
        >
          {value ? (
            format(new Date(value), 'PPP')
          ) : (
            <span>{placeholder || 'Pick a date'}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-2xl shadow-2xl border-primary/10"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => onChange(date?.toISOString())}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export const Route = createFileRoute('/admin/course/enrollment')({
  component: EnrollmentsPage,
})

function CourseFilterSelect({
  value,
  onValueChange,
}: {
  value?: string
  onValueChange: (val: string) => void
}) {
  const [courses, setCourses] = React.useState<
    { label: string; value: string }[]
  >([])

  React.useEffect(() => {
    adminCourseService.getAll({ limit: 100 }).then(({ courses }) => {
      setCourses([
        { label: 'All Courses', value: 'all' },
        ...courses.map((c) => ({ label: c.title, value: c.id })),
      ])
    })
  }, [])

  return (
    <SearchableSelect
      placeholder="Select course..."
      options={courses}
      onValueChange={(val) => onValueChange(val === 'all' ? '' : val)}
      value={value || 'all'}
    />
  )
}

function EnrollmentsPage() {
  const queryClient = useQueryClient()
  const [mounted, setMounted] = React.useState(false)

  const { user: authUser } = useAuthStore()
  const isInstructorOnly = React.useMemo(() => {
    if (!authUser) return false
    const roleNames = authUser.roles?.map((role: any) => typeof role === 'string' ? role : role.name) || []
    return (roleNames.includes('Teacher') || roleNames.includes('Instructor')) && 
           !roleNames.includes('Super Admin') && 
           !roleNames.includes('Admin')
  }, [authUser])

  const [searchQuery, setSearchQuery] = React.useState('')
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  })
  const [courseUuid, setCourseUuid] = React.useState<string | undefined>()
  const [categoryUuid, setCategoryUuid] = React.useState<string | undefined>()
  const [organizationUuid, setOrganizationUuid] = React.useState<
    string | undefined
  >()
  const [status, setStatus] = React.useState<string | undefined>()
  const [createdFrom, setCreatedFrom] = React.useState<string | undefined>()
  const [createdTo, setCreatedTo] = React.useState<string | undefined>()
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: [
      'admin',
      'enrollments',
      searchQuery,
      pagination.page,
      pagination.limit,
      courseUuid,
      categoryUuid,
      organizationUuid,
      status,
      createdFrom,
      createdTo,
    ],
    queryFn: async () => {
      const response = await adminEnrollmentService.getAll({
        search: searchQuery,
        page: pagination.page,
        limit: pagination.limit,
        course_uuid: courseUuid,
        category_uuid: categoryUuid,
        organization_uuid: organizationUuid,
        status: status,
        created_from: createdFrom,
        created_to: createdTo,
      })

      if (response.meta) {
        setPagination((prev) => ({ ...prev, total: response.meta.total }))
      }
      return response
    },
    enabled: mounted,
  })

  const revokeMutation = useMutation({
    mutationFn: (uuid: string) => adminEnrollmentService.revokeAccess(uuid),
    onSuccess: () => {
      toast.success('Access Revoked Successfully', {
        description: 'The student access to the course content has been revoked.',
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'enrollments'] })
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to revoke access'
      toast.error(msg)
    },
  })

  const [isBulkImportOpen, setIsBulkImportOpen] = React.useState(false)
  const [isGrantAccessOpen, setIsGrantAccessOpen] = React.useState(false)

  if (!mounted) return null

  const actions = (
    <div className="flex items-center gap-2">
      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-dashed border-primary/30 text-primary font-bold hover:bg-primary/5 transition-all"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] admin-theme">
          <DialogHeader>
            <DialogTitle>Bulk Enrollment</DialogTitle>
            <DialogDescription>
              Onboard multiple students via CSV file.
            </DialogDescription>
          </DialogHeader>
          <BulkImportForm
            onSuccess={() => {
              setIsBulkImportOpen(false)
              setPagination((prev) => ({ ...prev, page: 1 }))
              queryClient.invalidateQueries({
                queryKey: ['admin', 'enrollments'],
              })
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isGrantAccessOpen} onOpenChange={setIsGrantAccessOpen}>
        <DialogTrigger asChild>
          <AddActionButton label="Grant Access" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] admin-theme">
          <DialogHeader>
            <DialogTitle>Grant Access</DialogTitle>
            <DialogDescription>
              Manually enroll a student in a course.
            </DialogDescription>
          </DialogHeader>
          <GrantAccessForm
            onSuccess={() => {
              setIsGrantAccessOpen(false)
              setPagination((prev) => ({ ...prev, page: 1 }))
              queryClient.invalidateQueries({
                queryKey: ['admin', 'enrollments'],
              })
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )

  const filterTrigger = (
    <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-10 border-border font-semibold shadow-sm',
            (courseUuid ||
              categoryUuid ||
              organizationUuid ||
              status ||
              createdFrom ||
              createdTo) &&
              'bg-primary/5 border-primary text-primary',
          )}
        >
          <Filter className="w-4 h-4 mr-2" />
          {courseUuid ||
          categoryUuid ||
          organizationUuid ||
          status ||
          createdFrom ||
          createdTo
            ? 'Filters Active'
            : 'Filter'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] admin-theme">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Filter enrollments by specific criteria.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Tag className="size-3" /> Course
            </Label>
            <CourseFilterSelect
              value={courseUuid}
              onValueChange={(val) => {
                setCourseUuid(val || undefined)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <LayoutGrid className="size-3" /> Category
            </Label>
            <CategoryFilterSelect
              value={categoryUuid}
              onValueChange={(val) => {
                setCategoryUuid(val || undefined)

                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="size-3" /> Organization
            </Label>
            <OrganizationFilterSelect
              value={organizationUuid}
              onValueChange={(val) => {
                setOrganizationUuid(val || undefined)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="size-3" /> Status
            </Label>
            <Select
              value={status || 'all'}
              onValueChange={(val) =>
                setStatus(val === 'all' ? undefined : val)
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="admin-theme rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="size-3" /> From
              </Label>
              <StandaloneDatePicker
                value={createdFrom}
                onChange={(val) => setCreatedFrom(val)}
                placeholder="Start Date"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="size-3" /> To
              </Label>
              <StandaloneDatePicker
                value={createdTo}
                onChange={(val) => setCreatedTo(val)}
                placeholder="End Date"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => {
              setCourseUuid(undefined)
              setCategoryUuid(undefined)
              setOrganizationUuid(undefined)
              setStatus(undefined)
              setCreatedFrom(undefined)
              setCreatedTo(undefined)
            }}
            className="text-xs font-bold text-muted-foreground"
          >
            Reset All
          </Button>
          <Button
            onClick={() => setIsFilterOpen(false)}
            className="h-9 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <AdminPage>
      <PageHeader
        title={isInstructorOnly ? 'My Course Enrollments' : 'All Enrollments'}
        description="Manage student course access and manual enrollments."
        actions={actions}
      />

      <DataHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={() => {
          setSearchQuery('')
          setCourseUuid(undefined)
          setCategoryUuid(undefined)
          setOrganizationUuid(undefined)
          setStatus(undefined)
          setCreatedFrom(undefined)
          setCreatedTo(undefined)
        }}
        activeFiltersCount={
          (courseUuid ? 1 : 0) +
          (categoryUuid ? 1 : 0) +
          (organizationUuid ? 1 : 0) +
          (status ? 1 : 0) +
          (createdFrom ? 1 : 0) +
          (createdTo ? 1 : 0)
        }
        filterTrigger={filterTrigger}
        resultsCount={pagination.total}
        resultsLabel="enrollments found"
      />

      <EnrollmentTable
        isLoading={isLoading}
        enrollments={enrollmentsData?.data || []}
        pageSize={pagination.limit}
        onRevoke={(uuid) => revokeMutation.mutate(uuid)}
        isRevoking={revokeMutation.isPending}
      />

      <DataFooter
        page={pagination.page}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />

    </AdminPage>
  )
}
