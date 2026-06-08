import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'

import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { PageHeader } from '@/components/admin/shared/layout'
import { AddActionButton } from '@/components/admin/shared/button/add-action-button'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { DataHeader, DataFooter } from '@/components/admin/shared/data'

import { adminPromotionService, Promotion } from '@/services/admin/promotion.service'
import { useAuthStore } from '@/hooks/use-auth'

import { PromotionTable } from '@/components/admin/promotions/promotion-table'
import { PromotionUsageModal } from '@/components/admin/promotions/promotion-usage-modal'

const promotionSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
  search: z.string().default('').catch(''),
})

export const Route = createFileRoute('/admin/promotion/')({
  validateSearch: promotionSearchSchema,
  head: () => ({
    meta: [{ title: 'Aksellearn | Promotions' }],
  }),
  component: PromotionsPage,
})

function PromotionsPage() {
  const { t } = useTranslation()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const searchParams = Route.useSearch()
  
  const { user: authUser } = useAuthStore()
  const isInstructorOnly = React.useMemo(() => {
    if (!authUser) return false
    const roleNames = authUser.roles?.map((role: any) => typeof role === 'string' ? role : role.name) || []
    return (roleNames.includes('Teacher') || roleNames.includes('Instructor')) && 
           !roleNames.includes('Super Admin') && 
           !roleNames.includes('Admin')
  }, [authUser])
  
  const { page, limit, search } = searchParams
  
  const [deletePromId, setDeletePromId] = React.useState<string | null>(null)
  const [usageModalOpen, setUsageModalOpen] = React.useState(false)
  const [usagePromotion, setUsagePromotion] = React.useState<Promotion | null>(null)

  const { data: promData, isLoading: isPromsLoading, isFetching } = useQuery({
    queryKey: ['admin', 'promotions', searchParams],
    queryFn: () => adminPromotionService.getAll({ page, limit, search }),
    placeholderData: keepPreviousData,
  })
  const promotions = promData?.data || []

  const deletePromMutation = useMutation({
    mutationFn: (id: string) => adminPromotionService.delete(id),
    onSuccess: () => {
      toast.success(t('common.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] })
      setDeletePromId(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('common.deleteError'))
    }
  })

  const handleEditProm = (p: Promotion) => {
    navigate({ to: '/admin/promotion/$promotionId/edit', params: { promotionId: p.uuid } })
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
        title={isInstructorOnly ? t('promotions.myPromotions', 'My Promotions') : t('promotions.title')}
        description={t('promotions.description')}
        actions={
          <AddActionButton
            label={t('promotions.addPromotion')}
            onClick={() => navigate({ to: '/admin/promotion/create' })}
          />
        }
      />

      <DataHeader
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onClearFilters={clearFilters}
        activeFiltersCount={0}
        resultsCount={promData?.meta?.total || promotions.length}
        resultsLabel={t('promotions.promotionsFound')}
      />

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <PromotionTable
          promotions={promotions}
          isLoading={isPromsLoading || isFetching}
          onEdit={handleEditProm}
          onDelete={setDeletePromId}
          onViewUsage={(p) => {
            setUsagePromotion(p)
            setUsageModalOpen(true)
          }}
        />
      </div>

      <DataFooter
        page={page}
        total={promData?.meta?.total || 0}
        limit={limit}
        onPageChange={handlePageChange}
      />

      {/* Delete Promotion Confirm */}
      <ConfirmDialog
        open={deletePromId !== null}
        onOpenChange={(open) => !open && setDeletePromId(null)}
        title={t('promotions.deletePromotion')}
        description={t('promotions.deleteConfirm')}
        onConfirm={() => deletePromId !== null && deletePromMutation.mutate(deletePromId)}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />

      <PromotionUsageModal
        open={usageModalOpen}
        onOpenChange={setUsageModalOpen}
        promotionId={usagePromotion?.uuid || null}
        promotionTitle={usagePromotion?.title || ''}
        role={isInstructorOnly ? 'instructor' : 'admin'}
      />
    </AdminPage>
  )
}
