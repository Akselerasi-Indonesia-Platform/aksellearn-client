import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { adminRoleService } from '@/services/admin/role.service'
import { Role } from '@/types/role'

interface AssignRolesFormProps {
  initialRoles?: string[]
  onSubmit: (roles: string[]) => Promise<void>
  onCancel: () => void
}

export function AssignRolesForm({
  initialRoles = [],
  onSubmit,
  onCancel,
}: AssignRolesFormProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles)
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { roles } = await adminRoleService.getAll({ limit: 100 })
        setAvailableRoles(roles)
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoles()
  }, [])

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(selectedRoles)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-11 bg-muted/30 border-none shadow-inner hover:bg-muted/50 transition-all font-normal"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                {selectedRoles.length > 0
                  ? `${selectedRoles.length} role(s) selected`
                  : 'Search and select roles...'}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Type role name..." />
              <CommandList>
                {isLoading ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>No role found.</CommandEmpty>
                    <CommandGroup>
                      {availableRoles.map((role) => (
                        <CommandItem
                          key={role.id}
                          className="cursor-pointer py-1"
                          onSelect={() => {
                            toggleRole(role.name)
                          }}
                        >
                          <div
                            className={cn(
                              'mr-2 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200',
                              selectedRoles.includes(role.name)
                                ? 'bg-primary border-primary scale-110 shadow-sm shadow-primary/20'
                                : 'border-muted-foreground/30 bg-background',
                            )}
                          >
                            {selectedRoles.includes(role.name) && (
                              <Check className="h-3.5 w-3.5 text-primary-foreground stroke-3" />
                            )}
                          </div>
                          {role.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap gap-2 min-h-[120px] p-4 border rounded-xl bg-card shadow-sm">
          {selectedRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full text-muted-foreground gap-2 py-6">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-5 w-5 opacity-40" />
              </div>
              <span className="text-sm font-medium">No roles assigned yet</span>
              <p className="text-xs opacity-70">
                Select roles from the dropdown above
              </p>
            </div>
          ) : (
            selectedRoles.map((role) => (
              <Badge
                key={role}
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 rounded-md hover:bg-primary/20 pr-1 group transition-colors cursor-default"
              >
                {role}
                <button
                  type="button"
                  onClick={() => toggleRole(role)}
                  className="ml-1 hover:bg-primary/30 rounded-full p-0.5 transition-colors outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
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
          disabled={isSubmitting || isLoading}
          className="shadow-filament transition-all active:scale-[0.98] min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Roles'
          )}
        </Button>
      </div>
    </form>
  )
}
