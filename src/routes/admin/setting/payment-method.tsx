import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminPaymentMethodService } from '@/services/admin/payment-method.service'
import { toast } from 'sonner'
import * as React from 'react'
import { PageHeader } from '@/components/admin/shared/layout'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { DataHeader } from '@/components/admin/shared/data'
import { PaymentMethodTable } from '@/components/admin/setting/payment-method-table'
import { ShieldCheck, Filter, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/admin/setting/payment-method')({
  component: PaymentMethodsPage,
})

function PaymentMethodsPage() {
  const queryClient = useQueryClient()
  const [mounted, setMounted] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [driverFilter, setDriverFilter] = React.useState<string[]>([])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const { data: methodsData, isLoading } = useQuery({
    queryKey: ['admin', 'payment-methods'],
    queryFn: () => adminPaymentMethodService.getAll(),
    enabled: mounted,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: { is_active?: boolean; priority?: number }
    }) => adminPaymentMethodService.update(id, data),
    onSuccess: () => {
      toast.success('Payment method updated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] })
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || 'Failed to update payment method',
      )
    },
  })

  const handleUpdate = (
    id: number,
    data: { is_active?: boolean; priority?: number },
  ) => {
    updateMutation.mutate({ id, data })
  }

  const allDrivers = React.useMemo(() => {
    if (!methodsData?.data) return []
    const drivers = new Set(methodsData.data.map((m: any) => m.driver))
    return Array.from(drivers)
  }, [methodsData])

  const filteredMethods = React.useMemo(() => {
    if (!methodsData?.data) return []
    return methodsData.data.filter((m: any) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDriver =
        driverFilter.length === 0 || driverFilter.includes(m.driver)
      return matchesSearch && matchesDriver
    })
  }, [methodsData, searchQuery, driverFilter])

  const toggleDriver = (driver: string) => {
    setDriverFilter((prev) =>
      prev.includes(driver)
        ? prev.filter((d) => d !== driver)
        : [...prev, driver],
    )
  }

  if (!mounted) return null

  const filterTrigger = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 gap-2 border-border font-semibold shadow-sm overflow-hidden"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          {driverFilter.length > 0
            ? `Drivers (${driverFilter.length})`
            : 'All Drivers'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Filter by Driver</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allDrivers.map((driver) => (
          <DropdownMenuCheckboxItem
            key={driver as string}
            checked={driverFilter.includes(driver as string)}
            onCheckedChange={() => toggleDriver(driver as string)}
            className="capitalize"
          >
            {driver as string}
          </DropdownMenuCheckboxItem>
        ))}
        {driverFilter.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDriverFilter([])}
              className="justify-center text-xs text-red-500 font-bold focus:text-red-500"
            >
              Clear Filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <AdminPage className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Payment Methods"
        description="Configure available payment gateways and their display priority."
      />

      <div className="grid gap-6">
        <div className="rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 mb-2">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            Active payment methods will be visible to students during checkout.
            Use priority to control the sorting order.
          </p>
        </div>

        <DataHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearFilters={() => {
            setSearchQuery('')
            setDriverFilter([])
          }}
          activeFiltersCount={driverFilter.length}
          filterTrigger={filterTrigger}
          resultsCount={filteredMethods.length}
          resultsLabel="gateways found"
        />

        <PaymentMethodTable
          isLoading={isLoading}
          methods={filteredMethods}
          onUpdate={handleUpdate}
        />
      </div>
    </AdminPage>
  )
}
