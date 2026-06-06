import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminOrderService } from '@/services/admin/order.service'
import { Filter, RefreshCcw, X } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
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
import { OrderTable } from '@/components/admin/revenue/order-table'
import { RefundModal } from '@/components/admin/revenue/refund-modal'
import { CancelOrderModal } from '@/components/admin/revenue/cancel-order-modal'
import { PageHeader } from '@/components/admin/shared/layout'
import { DataHeader, DataFooter, useColumnVisibility, DataColumnToggle, BulkActionBar } from '@/components/admin/shared/data'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { getUser, isAdmin } from '@/lib/auth'

import { z } from 'zod'

const orderSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
  status: z.string().optional().catch(undefined),
  search: z.string().default('').catch(''),
  sortBy: z.string().optional().catch(undefined),
  sortDir: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/admin/order/')({
  validateSearch: orderSearchSchema,
  component: OrdersPage,
})

function OrdersPage() {
  const { t } = useTranslation()
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  
  const { limit, status, search, sortBy, sortDir } = searchParams

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'orders', searchParams],
    queryFn: () => adminOrderService.getAll(searchParams),
  })

  // Mutations
  const refreshMutation = useMutation({
    mutationFn: (uuid: string) => adminOrderService.refresh(uuid),
    onSuccess: () => {
      toast.success('Order status synchronized')
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
    onError: () => toast.error('Failed to sync status'),
  })

  // Modal states
  const [selectedOrderUuid, setSelectedOrderUuid] = React.useState<
    string | null
  >(null)
  const [isRefundOpen, setIsRefundOpen] = React.useState(false)
  const [isCancelOpen, setIsCancelOpen] = React.useState(false)
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set())

  const ORDER_COLUMNS = ['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date', 'Actions']
  const { visibleColumns, toggleColumn } = useColumnVisibility(
    'admin_orders_col_visibility',
    ORDER_COLUMNS
  )

  const setUrlSearch = (updater: (prev: typeof searchParams) => typeof searchParams) => {
    navigate({ search: updater })
  }

  const handlePageChange = (newPage: number) => {
    setUrlSearch((prev) => ({ ...prev, page: newPage }))
  }

  const handleSearchChange = (newSearch: string) => {
    setUrlSearch((prev) => ({ ...prev, search: newSearch, page: 1 }))
  }

  const handleSortChange = (key: string, dir: 'asc' | 'desc') => {
    setUrlSearch((prev) => ({ ...prev, sortBy: key, sortDir: dir, page: 1 }))
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
    setSelectedKeys(new Set())
    setUrlSearch((prev) => ({
      ...prev,
      search: '',
      status: undefined,
      page: 1
    }))
  }

  const activeFiltersCount = status ? status.split(',').length : 0

  const user = getUser()
  const isUserAdmin = user ? isAdmin(user) : false

  const actions = isUserAdmin ? (
    <Button
      variant="outline"
      size="sm"
      onClick={() => refetch()}
      disabled={isLoading}
      className="h-10 shadow-sm border-border font-bold"
    >
      <RefreshCcw
        className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`}
      />
      Sync Ledger
    </Button>
  ) : undefined

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
          Transaction Status
        </DropdownMenuLabel>
        {['paid', 'pending', 'processing', 'cancelled', 'refunded'].map(
          (statusItem) => (
            <DropdownMenuCheckboxItem
              key={statusItem}
              checked={status?.split(',').includes(statusItem) ?? false}
              onCheckedChange={() => toggleStatus(statusItem)}
              className="capitalize text-xs py-2"
            >
              {statusItem}
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
        title="Orders"
        description="Monitor student transactions and billing status."
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
            columns={ORDER_COLUMNS}
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
          />
        }
        resultsCount={ordersData?.meta?.total}
        resultsLabel="orders found"
      />

      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <OrderTable
          isLoading={isLoading}
          orders={ordersData?.orders || []}
          pageSize={limit || 10}
          onRefresh={(uuid) => refreshMutation.mutate(uuid)}
          onRefund={(uuid) => {
            setSelectedOrderUuid(uuid)
            setIsRefundOpen(true)
          }}
          onCancel={(uuid) => {
            setSelectedOrderUuid(uuid)
            setIsCancelOpen(true)
          }}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          visibleColumns={visibleColumns}
          selectable={isUserAdmin}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        />

        {ordersData?.meta && (
          <DataFooter
            page={ordersData.meta.page}
            total={ordersData.meta.total}
            limit={ordersData.meta.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      
      {isUserAdmin && (
        <BulkActionBar
          selectedCount={selectedKeys.size}
          onClearSelection={() => setSelectedKeys(new Set())}
        />
      )}

      {selectedOrderUuid && (
        <>
          <RefundModal
            uuid={selectedOrderUuid}
            open={isRefundOpen}
            onOpenChange={setIsRefundOpen}
          />
          <CancelOrderModal
            uuid={selectedOrderUuid}
            open={isCancelOpen}
            onOpenChange={setIsCancelOpen}
          />
        </>
      )}
    </AdminPage>
  )
}
