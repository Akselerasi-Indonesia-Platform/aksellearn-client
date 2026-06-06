import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { OrganizationTagForm } from '@/components/admin/organization-tags/organization-tag-form'
import { OrganizationTagTable } from '@/components/admin/organization-tags/organization-tag-table'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/admin/shared/layout'
import { DataHeader, DataFooter } from '@/components/admin/shared/data'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { adminOrganizationTagService } from '@/services/admin/organization-tag.service'
import type { OrganizationTag } from '@/types/organization'

export const Route = createFileRoute('/admin/organization/tag')({
  component: OrganizationTagsPage,
})

function OrganizationTagsPage() {
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  const [tags, setTags] = React.useState<OrganizationTag[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [selectedTag, setSelectedTag] = React.useState<OrganizationTag | undefined>()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminOrganizationTagService.getAll({
        search: searchQuery,
        page: pagination.page,
        limit: pagination.limit,
      })
      setTags(res.tags)
      setPagination((prev) => ({
        ...prev,
        total: res.meta.total,
      }))
    } catch {
      toast.error('Failed to fetch industry tags')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, pagination.page, pagination.limit])

  React.useEffect(() => {
    setMounted(true)
    fetchData()
  }, [fetchData])

  const handleCreate = () => {
    setSelectedTag(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (tag: OrganizationTag) => {
    setSelectedTag(tag)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: { name: string; description?: string }) => {
    try {
      if (selectedTag) {
        await adminOrganizationTagService.update(selectedTag.uuid, data)
        toast.success('Industry tag updated successfully')
      } else {
        await adminOrganizationTagService.create(data)
        toast.success('Industry tag created successfully')
      }
      setIsFormOpen(false)
      fetchData()
    } catch {
      toast.error('Failed to save industry tag')
    }
  }

  const handleDeleteClick = () => {
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedTag) {
      setDeleteError(null)
      try {
        await adminOrganizationTagService.delete(selectedTag.uuid)
        toast.success('Industry tag deleted successfully')
        setIsDeleteDialogOpen(false)
        setIsFormOpen(false)
        setSelectedTag(undefined)
        fetchData()
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Failed to delete industry tag'
        setDeleteError(msg)
        toast.error(msg)
      }
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
  }

  if (!mounted) return null

  return (
    <AdminPage>
      <PageHeader
        title="Industry Tags"
        description="Manage industry tags to classify organization domains."
        actions={
          <Button
            className="shadow-lg shadow-primary/20 font-bold px-6"
            onClick={handleCreate}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Tag
          </Button>
        }
      />

      <DataHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
        activeFiltersCount={0}
        resultsCount={pagination.total}
        resultsLabel="tags found"
      />

      <div className="flex flex-col gap-4">
        <OrganizationTagTable
          tags={tags}
          isLoading={isLoading}
          onEdit={handleEdit}
          pageSize={pagination.limit}
        />

        {pagination.total > pagination.limit && (
          <DataFooter
            page={pagination.page}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, page }))
            }
          />
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] admin-theme">
          <DialogHeader>
            <DialogTitle>
              {selectedTag ? 'Edit Industry Tag' : 'Add Industry Tag'}
            </DialogTitle>
            <DialogDescription>
              {selectedTag
                ? 'Update industry details here.'
                : 'Enter details to classify organizations.'}
            </DialogDescription>
          </DialogHeader>
          <OrganizationTagForm
            tag={selectedTag}
            onCancel={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            onDelete={handleDeleteClick}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.areYouSure', 'Are you absolutely sure?')}
        description={`This action cannot be undone. This will permanently delete the tag ${selectedTag?.name}.`}
        confirmText={t('common.delete')}
        onConfirm={confirmDelete}
        error={deleteError}
      />
    </AdminPage>
  )
}
