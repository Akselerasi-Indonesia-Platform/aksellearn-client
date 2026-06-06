import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BannerForm } from '@/components/admin/banners/banner-form'
import { BannerTable } from '@/components/admin/banners/banner-table'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { DataHeader } from '@/components/admin/shared/data'
import { AdminPage, PageHeader } from '@/components/admin/shared/layout'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { adminBannerService } from '@/services/admin/banner.service'
import type { Banner, BannerPayload } from '@/types/banner'

export const Route = createFileRoute('/admin/banners')({
  component: AdminBannersPage,
})

function AdminBannersPage() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  const [banners, setBanners] = React.useState<Banner[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedBanner, setSelectedBanner] = React.useState<Banner | undefined>()

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminBannerService.getAll()
      setBanners(res.banners)
    } catch {
      toast.error('Failed to fetch banners')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    setMounted(true)
    fetchData()
  }, [fetchData])

  const handleCreate = () => {
    setSelectedBanner(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner)
    setIsFormOpen(true)
  }

  const handleDeleteClick = () => {
    setIsFormOpen(false)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBanner) return
    try {
      await adminBannerService.delete(selectedBanner.uuid)
      toast.success(t('common.deleteSuccess', 'Banner deleted successfully.'))
      setIsDeleteDialogOpen(false)
      fetchData()
    } catch {
      toast.error(t('common.deleteError', 'Failed to delete banner.'))
    }
  }

  const handleFormSubmit = async (payload: BannerPayload) => {
    try {
      if (selectedBanner) {
        await adminBannerService.update(selectedBanner.uuid, payload)
        toast.success(t('common.updateSuccess', 'Banner updated successfully.'))
      } else {
        await adminBannerService.create(payload)
        toast.success(t('common.createSuccess', 'Banner created successfully.'))
      }
      setIsFormOpen(false)
      fetchData()
    } catch {
      toast.error(
        selectedBanner
          ? t('common.updateError', 'Failed to update banner.')
          : t('common.createError', 'Failed to create banner.')
      )
    }
  }

  const filteredBanners = React.useMemo(() => {
    return banners.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [banners, searchQuery])

  if (!mounted) return null

  return (
    <AdminPage>
      <PageHeader
        title={t('banners.title', 'Homepage Banners')}
        description={t('banners.description', 'Manage promotional banners that appear at the top of the homepage.')}
        actions={
          <Button onClick={handleCreate} className="gap-2 font-bold shadow-md">
            <Plus className="size-4" />
            {t('banners.addBanner', 'Add Banner')}
          </Button>
        }
      />

      <div className="space-y-6">
        <DataHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearFilters={() => setSearchQuery('')}
          activeFiltersCount={0}
          resultsCount={filteredBanners.length}
          resultsLabel="banners found"
        />

        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <BannerTable
            banners={filteredBanners}
            onEdit={handleEdit}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedBanner
                ? t('banners.editBanner', 'Edit Banner')
                : t('banners.addBanner', 'Add Banner')}
            </DialogTitle>
            <DialogDescription>
              {t('common.updateDetails', 'Update the details below.')}
            </DialogDescription>
          </DialogHeader>

          <div className="pt-4">
            <BannerForm
              banner={selectedBanner}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              onDelete={selectedBanner ? handleDeleteClick : undefined}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.areYouSure', 'Are you sure?')}
        description={t('common.deleteConfirmation', 'This action cannot be undone.')}
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </AdminPage>
  )
}