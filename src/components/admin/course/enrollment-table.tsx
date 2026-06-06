import * as React from 'react'
import { Button } from '@/components/ui/button'
import { DataTable, Column } from '@/components/admin/shared/data'
import { formatDate, safeParseDate } from '@/lib/utils'
import { Enrollment } from '@/services/admin/enrollment.service'
import { Trash2, Lock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'

interface EnrollmentTableProps {
  enrollments: Enrollment[]
  isLoading: boolean
  pageSize: number
  onRevoke: (uuid: string) => void
  isRevoking?: boolean
}

export function EnrollmentTable({
  enrollments,
  isLoading,
  pageSize,
  onRevoke,
  isRevoking,
}: EnrollmentTableProps) {
  const [revokeItem, setRevokeItem] = React.useState<Enrollment | null>(null)

  const columns: Column<Enrollment>[] = [
    {
      header: 'Course',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground">
            {item.course?.title || 'Unknown Course'}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            {item.course?.uuid?.substring(0, 8) || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Student',
      cell: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm">
              {item.user?.name || 'Unknown User'}
            </span>
            {item.organization && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold border border-primary/20 uppercase">
                {item.organization.name}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {item.user?.email || 'No Email'}
          </span>
        </div>
      ),
    },
    {
      header: 'Date',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">
            {formatDate(item.created_at)}
          </span>
          {item.expired_at && (
            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
              Expires: {formatDate(item.expired_at)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (item) => {
        const createdAt = safeParseDate(item.created_at)
        const diffMs = Date.now() - createdAt.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        const isExpired = diffHours > 24

        // Check if corporate (org-scoped) or order-based
        const isOrderOrCorporate = !!item.organization_id || 
                                   !!item.organization || 
                                   !!(item as any).order_id || 
                                   !!(item as any).order_uuid || 
                                   (item as any).source === 'order' || 
                                   (item as any).source === 'corporate' || 
                                   (item as any).source === 'bulk' || 
                                   (item as any).price_at_purchase !== undefined

        if (isOrderOrCorporate) {
          return (
            <div className="flex justify-end items-center px-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground/60 cursor-help p-1 hover:text-slate-500 transition-colors">
                    <Lock className="size-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Cannot revoke order-based enrollments
                </TooltipContent>
              </Tooltip>
            </div>
          )
        }

        if (isExpired) {
          return (
            <div className="flex justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-slate-300 h-8 font-bold gap-1 rounded-lg px-2"
                    >
                      <Trash2 className="size-3.5" />
                      Revoke
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Revocation window expired (24h limit)
                </TooltipContent>
              </Tooltip>
            </div>
          )
        }

        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setRevokeItem(item)
              }}
              disabled={isRevoking}
              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 font-bold gap-1 rounded-lg px-2"
            >
              <Trash2 className="size-3.5" />
              Revoke
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        data={enrollments}
        columns={columns}
        isLoading={isLoading}
        pageSize={pageSize}
        emptyMessage="No enrollments found."
        rowKey="uuid"
      />

      <ConfirmDialog
        open={!!revokeItem}
        onOpenChange={(open) => !open && setRevokeItem(null)}
        title="Revoke Enrollment Access"
        description={`Are you sure you want to revoke access for student ${revokeItem?.user?.name || ''} from the course "${revokeItem?.course?.title || ''}"? This action cannot be undone and will terminate access immediately.`}
        onConfirm={() => {
          if (revokeItem) {
            onRevoke(revokeItem.uuid)
            setRevokeItem(null)
          }
        }}
        confirmText="Revoke Access"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  )
}
