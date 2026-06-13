import { Edit2, Image as ImageIcon } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, Column } from '@/components/admin/shared/data'
import { StatusBadge } from '@/components/admin/shared/status/status-badge'
import { formatDate } from '@/lib/utils'
import type { Banner } from '@/types/banner'

interface BannerTableProps {
  banners: Banner[]
  onEdit: (banner: Banner) => void
  isLoading?: boolean
  pageSize?: number
}

export function BannerTable({
  banners,
  onEdit,
  isLoading,
  pageSize = 10,
}: BannerTableProps) {
  const { t } = useTranslation()

  const columns: Column<Banner>[] = [
    {
      id: 'Image',
      header: t('common.thumbnail', 'Image'),
      cell: (item: Banner) => (
        <div className="relative size-16 rounded-lg overflow-hidden border bg-muted flex items-center justify-center shrink-0">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
          {item.mobile_image_url && (
            <div className="absolute top-1 right-1 bg-black/60 text-white text-[8px] font-bold px-1 rounded">
              M
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'Title',
      header: t('banners.titleField', 'Banner Title'),
      accessorKey: 'title',
      className: 'font-medium max-w-[240px]',
      cell: (item: Banner) => (
        <div className="flex items-center h-full">
          <p className="font-bold text-sm text-slate-800 line-clamp-1">{item.title}</p>
        </div>
      ),
    },

    {
      id: 'Order',
      header: t('banners.sortOrder', 'Order'),
      accessorKey: 'sort_order',
      className: 'text-center font-mono text-xs font-bold',
    },
    {
      id: 'Schedule',
      header: 'Active Schedule',
      cell: (item: Banner) => {
        if (!item.start_at && !item.end_at) {
          return <span className="text-xs text-slate-400 font-medium">Always Active</span>
        }
        return (
          <div className="text-[10px] text-muted-foreground space-y-0.5 font-medium">
            {item.start_at && (
              <p>Start: {formatDate(item.start_at)}</p>
            )}
            {item.end_at && (
              <p>End: {formatDate(item.end_at)}</p>
            )}
          </div>
        )
      },
    },
    {
      id: 'Status',
      header: t('common.status', 'Status'),
      cell: (item: Banner) => (
        <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      id: 'Actions',
      header: t('common.actions', 'Actions'),
      headerClassName: 'text-center',
      cell: (item: Banner) => (
        <div className="flex justify-center gap-1">
          <Button
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            size="icon"
            variant="ghost"
            onClick={() => onEdit(item)}
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={banners}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage={t('banners.noBanners', 'No banners found.')}
    />
  )
}
