import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  History, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  User, 
  Clock, 
  PlusCircle, 
  Edit, 
  Trash2, 
  ToggleLeft 
} from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import { adminAuditLogService, AuditLog } from '@/services/admin/audit-log.service'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AuditHistoryPanelProps {
  entityType: 'course' | 'user' | string
  entityId: number | undefined
  className?: string
}

export function AuditHistoryPanel({
  entityType,
  entityId,
  className
}: AuditHistoryPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'audit-logs', entityType, entityId],
    queryFn: () => adminAuditLogService.getLogs({
      entity_type: entityType,
      entity_id: entityId,
      limit: 50
    }),
    enabled: isOpen && !!entityId,
  })

  if (!entityId) {
    return null
  }

  const logs = data?.data || []

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <PlusCircle className="size-4 text-emerald-500" />
      case 'delete':
        return <Trash2 className="size-4 text-rose-500" />
      case 'toggle':
      case 'toggle-status':
        return <ToggleLeft className="size-4 text-amber-500" />
      default:
        return <Edit className="size-4 text-blue-500" />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'Created'
      case 'update':
        return 'Updated'
      case 'delete':
        return 'Deleted'
      case 'toggle':
      case 'toggle-status':
        return 'Status Toggled'
      default:
        return action.charAt(0).toUpperCase() + action.slice(1)
    }
  }

  const formatPayload = (payload: any) => {
    if (!payload) return null
    
    // If it's a string, try to parse as JSON
    let parsed = payload
    if (typeof payload === 'string') {
      try {
        parsed = JSON.parse(payload)
      } catch (e) {
        return <span className="text-xs text-muted-foreground">{payload}</span>
      }
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return <span className="text-xs text-muted-foreground">{String(parsed)}</span>
    }

    // Filter out internal / system fields to make change history cleaner
    const ignoredKeys = [
      'id', 'uuid', 'created_at', 'updated_at', 'deleted_at', 
      'created_by_id', 'updated_by_id', 'deleted_by_id',
      'password', 'remember_token'
    ]

    const entries = Object.entries(parsed).filter(
      ([key]) => !ignoredKeys.includes(key)
    )

    if (entries.length === 0) return null

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
        {entries.map(([key, value]) => {
          let displayValue = ''
          if (value === null || value === undefined) {
            displayValue = 'null'
          } else if (typeof value === 'object') {
            displayValue = JSON.stringify(value)
          } else {
            displayValue = String(value)
          }

          // Truncate long values
          if (displayValue.length > 60) {
            displayValue = displayValue.slice(0, 60) + '...'
          }

          // Clean key label (e.g. course_category_id -> Category ID)
          const cleanKey = key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          return (
            <div key={key} className="flex items-center gap-1.5 py-0.5 min-w-0">
              <span className="font-semibold text-muted-foreground shrink-0">{cleanKey}:</span>
              <span className="text-foreground truncate font-medium">{displayValue}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className={cn("border border-border/60 shadow-sm overflow-hidden", className)}>
      <CardHeader 
        className="p-4 bg-muted/20 hover:bg-muted/40 cursor-pointer flex flex-row items-center justify-between transition-colors select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <History className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              Change History
              {logs.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-extrabold">
                  {logs.length}
                </span>
              )}
            </CardTitle>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
              Entity audit trail
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted-foreground/10">
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="p-4 border-t border-border/50 animate-in fade-in duration-300">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="size-5 text-primary animate-spin" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Fetching History...
              </p>
            </div>
          ) : isError ? (
            <p className="text-xs font-semibold text-rose-500 text-center py-4">
              Failed to load change history logs.
            </p>
          ) : logs.length === 0 ? (
            <p className="text-xs font-semibold text-muted-foreground text-center py-6">
              No change history recorded for this entity yet.
            </p>
          ) : (
            <div className="relative pl-6 border-l border-border/60 ml-2.5 space-y-6 py-2">
              {logs.map((log) => (
                <div key={log.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border group-hover:scale-110 transition-transform">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/55 uppercase tracking-wider">
                          {log.actor_role || 'system'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                        <Clock className="size-3" />
                        {formatDateTime(log.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="size-3 shrink-0" />
                      <span>Performed by</span>
                      <span className="font-semibold text-foreground">
                        {log.actor_role === 'superadmin' ? 'Super Admin' : log.actor_role === 'admin' ? 'Admin' : log.actor_role === 'instructor' ? 'Instructor' : 'System'}
                      </span>
                      <span className="text-[10px] text-muted-foreground/75 font-mono">
                        (ID: {log.actor_id || 'system'})
                      </span>
                    </div>

                    {formatPayload(log.payload)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
