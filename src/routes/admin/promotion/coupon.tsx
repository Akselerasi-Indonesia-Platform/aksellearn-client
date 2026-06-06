import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { PageHeader } from '@/components/admin/shared/layout'
import { AddActionButton } from '@/components/admin/shared/button/add-action-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { DataHeader, DataFooter } from '@/components/admin/shared/data'

import { adminPromotionService } from '@/services/admin/promotion.service'
import { CouponTable } from '@/components/admin/promotions/coupon-table'
import { CouponForm } from '@/components/admin/promotions/coupon-form'

const couponSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
  search: z.string().default('').catch(''),
})

export const Route = createFileRoute('/admin/promotion/coupon')({
  validateSearch: couponSearchSchema,
  head: () => ({
    meta: [{ title: 'Clara | Coupons' }],
  }),
  component: CouponsPage,
})

function CouponsPage() {
  const { t } = useTranslation()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const searchParams = Route.useSearch()
  
  const { page, limit, search } = searchParams
  
  const [isCouponModalOpen, setIsCouponModalOpen] = React.useState(false)
  const [deleteCouponId, setDeleteCouponId] = React.useState<number | null>(null)

  // Fetch Coupons
  const { data: coupData, isLoading: isCoupsLoading, isFetching } = useQuery({
    queryKey: ['admin', 'coupons', searchParams],
    queryFn: () => adminPromotionService.getAllCoupons({ page, limit, search }),
    placeholderData: keepPreviousData,
  })
  const coupons = coupData?.data || []

  // Fetch Promotions (needed for dropdown)
  const { data: promData } = useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: () => adminPromotionService.getAll(),
  })
  const promotions = promData?.data || []

  // Coupon mutations
  const createCouponMutation = useMutation({
    mutationFn: (payload: any) => adminPromotionService.createCoupon(payload),
    onSuccess: () => {
      toast.success(t('common.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      setIsCouponModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('common.createError'))
    }
  })

  const deleteCouponMutation = useMutation({
    mutationFn: (id: number) => adminPromotionService.deleteCoupon(id),
    onSuccess: () => {
      toast.success(t('common.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      setDeleteCouponId(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('common.deleteError'))
    }
  })

  const handleCouponSubmit = (payload: any) => {
    createCouponMutation.mutate(payload)
  }

  const handleSearchChange = (newSearch: string) => {
    navigate({ search: (prev) => ({ ...prev, search: newSearch, page: 1 }) })
  }

  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) })
  }

  const clearFilters = () => {
    navigate({ search: (prev) => ({ ...prev, search: '', page: 1 }) })
  }

  return (
    <AdminPage>
      <PageHeader
        title={t('promotions.coupons')}
        description={t('promotions.couponsDescription')}
        actions={
          <AddActionButton
            label={t('promotions.addCoupon')}
            onClick={() => navigate({ to: '/admin/promotion/create-voucher' })}
          />
        }
      />

      <DataHeader
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onClearFilters={clearFilters}
        activeFiltersCount={0}
        resultsCount={coupData?.meta?.total || coupons.length}
        resultsLabel={t('promotions.couponsFound')}
      />

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <CouponTable
          coupons={coupons}
          isLoading={isCoupsLoading || isFetching}
          onDelete={setDeleteCouponId}
        />
      </div>

      <DataFooter
        page={page}
        total={coupData?.meta?.total || 0}
        limit={limit}
        onPageChange={handlePageChange}
      />

      {/* Coupon Form Dialog */}
      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="sm:max-w-[500px] admin-theme shadow-lg border border-slate-100 rounded-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t('promotions.addCoupon')}</DialogTitle>
            <DialogDescription>
              Create a custom coupon code tied to an existing Promotion rule.
            </DialogDescription>
          </DialogHeader>

          <CouponForm
            promotions={promotions}
            isPending={createCouponMutation.isPending}
            onSubmit={handleCouponSubmit}
            onCancel={() => setIsCouponModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Coupon Confirm */}
      <ConfirmDialog
        open={deleteCouponId !== null}
        onOpenChange={(open) => !open && setDeleteCouponId(null)}
        title={t('promotions.deleteCoupon')}
        description={t('promotions.deleteCouponConfirm')}
        onConfirm={() => deleteCouponId !== null && deleteCouponMutation.mutate(deleteCouponId)}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
    </AdminPage>
  )
}
