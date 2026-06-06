import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, ChevronDown, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn, formatPermission } from '@/lib/utils'
import { FormSectionHint } from '@/components/admin/shared/form'
import type { Permission } from '@/types/permission'

interface AssignPermissionsFormProps {
  initialPermissions?: string[]
  availablePermissions: Permission[]
  onSubmit: (permissions: string[]) => Promise<void>
  onCancel: () => void
}

type GroupedPermissions = Record<string, Permission[]>

export function AssignPermissionsForm({
  initialPermissions = [],
  availablePermissions,
  onSubmit,
  onCancel,
}: AssignPermissionsFormProps) {
  const [selectedPermissions, setSelectedPermissions] =
    useState<string[]>(initialPermissions)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setSelectedPermissions(initialPermissions)
  }, [initialPermissions])

  const formatGroupName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/Management/i, '')
      .trim()
  }

  const filteredPermissions = useMemo(() => {
    if (!searchQuery) return availablePermissions
    const query = searchQuery.toLowerCase()
    return availablePermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        formatPermission(p.name).toLowerCase().includes(query) ||
        (p.groupName && p.groupName.toLowerCase().includes(query)),
    )
  }, [availablePermissions, searchQuery])

  const grouped = useMemo(() => {
    return filteredPermissions.reduce((acc, p) => {
      const group = p.groupName || 'Other'
      if (!acc[group]) acc[group] = []
      acc[group].push(p)
      return acc
    }, {} as GroupedPermissions)
  }, [filteredPermissions])

  // Sort groups alphabetically by formatted name
  const groupKeys = useMemo(() => {
    return Object.keys(grouped).sort((a, b) =>
      formatGroupName(a).localeCompare(formatGroupName(b)),
    )
  }, [grouped])

  // Automatically expand groups that have results when searching
  useEffect(() => {
    if (searchQuery && groupKeys.length > 0) {
      setExpandedGroups(groupKeys)
    }
  }, [searchQuery, groupKeys])

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName],
    )
  }

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((f) => f !== group) : [...prev, group],
    )
  }

  const isGroupFullySelected = (group: string) => {
    return grouped[group].every((p) => selectedPermissions.includes(p.name))
  }

  const isGroupPartiallySelected = (group: string) => {
    const selectedInGroup = grouped[group].filter((p) =>
      selectedPermissions.includes(p.name),
    )
    return (
      selectedInGroup.length > 0 &&
      selectedInGroup.length < grouped[group].length
    )
  }

  const toggleGroupSelection = (group: string) => {
    const groupPermissionNames = grouped[group].map((p) => p.name)
    const allSelected = isGroupFullySelected(group)

    if (allSelected) {
      // Remove all in group
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermissionNames.includes(p)),
      )
    } else {
      // Add all in group that aren't already there
      const toAdd = groupPermissionNames.filter(
        (p) => !selectedPermissions.includes(p),
      )
      setSelectedPermissions((prev) => [...prev, ...toAdd])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(selectedPermissions)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSectionHint title="Permission Scopes & Role Hierarchy" className="mb-2">
        Permissions are grouped by resource. Granting a permission allows all users with this role to perform that action globally. Roles do not have inherent hierarchy—access is determined strictly by the assigned permissions.
      </FormSectionHint>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions (e.g. 'course', 'delete')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9 h-11 bg-muted/30 border-none shadow-inner focus-visible:ring-1 focus-visible:ring-orange-500 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
        {groupKeys.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed rounded-xl">
            <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No permissions found matching your search.
            </p>
          </div>
        ) : (
          groupKeys.map((group) => {
            const isExpanded = expandedGroups.includes(group)
            const isFull = isGroupFullySelected(group)
            const isPartial = isGroupPartiallySelected(group)

            return (
              <div
                key={group}
                className="border rounded-lg overflow-hidden bg-card"
              >
                <div
                  className={cn(
                    'flex items-center justify-between p-3 cursor-pointer select-none transition-colors border-b bg-muted/30',
                    isExpanded ? 'border-border' : 'border-transparent',
                  )}
                  onClick={() => toggleGroup(group)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded border-2 transition-all active:scale-90',
                        isFull || isPartial
                          ? 'bg-orange-500 border-orange-500 shadow-sm shadow-orange-200'
                          : 'border-muted-foreground/30 bg-background group-hover:border-orange-400',
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleGroupSelection(group)
                      }}
                    >
                      {isFull && (
                        <svg
                          className="h-3 w-3 text-white animate-in zoom-in duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={4}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {isPartial && (
                        <div className="h-0.5 w-2.5 bg-white rounded-full animate-in zoom-in duration-200" />
                      )}
                    </div>
                    <span className="font-semibold text-sm">
                      {formatGroupName(group)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px] py-0 px-1.5 h-4 transition-colors',
                        isFull &&
                          'bg-orange-500 text-white hover:bg-orange-600 border-none',
                        isPartial &&
                          'bg-orange-100 text-orange-700 border-orange-200',
                      )}
                    >
                      {
                        grouped[group].filter((p) =>
                          selectedPermissions.includes(p.name),
                        ).length
                      }{' '}
                      / {grouped[group].length}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {isExpanded && (
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {grouped[group].map((permission) => {
                      const isSelected = selectedPermissions.includes(
                        permission.name,
                      )
                      return (
                        <label
                          key={permission.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group relative overflow-hidden',
                            isSelected
                              ? 'bg-orange-50 border-orange-200 shadow-sm'
                              : 'hover:bg-muted/50 border-transparent bg-background/50',
                          )}
                        >
                          <div className="relative flex items-center justify-center mt-0.5">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={isSelected}
                              onChange={() => togglePermission(permission.name)}
                            />
                            <div
                              className={cn(
                                'h-5 w-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center',
                                isSelected
                                  ? 'bg-orange-500 border-orange-500 scale-110 shadow-orange-200 shadow-lg'
                                  : 'border-muted-foreground/30 bg-background group-hover:border-orange-400',
                              )}
                            >
                              {isSelected && (
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={4}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className={cn(
                                'text-sm font-semibold leading-tight wrap-break-word transition-colors',
                                isSelected
                                  ? 'text-orange-700'
                                  : 'text-muted-foreground group-hover:text-foreground',
                              )}
                            >
                              {formatPermission(permission.name)}
                            </span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="hover:bg-accent transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="shadow-filament transition-all active:scale-[0.98]"
        >
          {isSubmitting ? 'Saving...' : 'Save Permissions'}
        </Button>
      </div>
    </form>
  )
}
