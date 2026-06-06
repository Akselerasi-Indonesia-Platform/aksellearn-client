'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

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

interface SearchableSelectProps {
  options: { label: string; value: string }[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  emptyMessage,
  className,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const { t } = useTranslation()

  const selectedLabel = React.useMemo(() => {
    if (value === undefined || value === null) return undefined
    const strVal = String(value)
    return options.find((option) => option.value === strVal)?.label
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          aria-expanded={open}
          className={cn(
            'w-full h-11 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50/50 transition-all bg-white shadow-sm justify-between font-normal px-3',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
          role="combobox"
          variant="outline"
        >
          <span className="truncate">
            {selectedLabel || placeholder || t('common.select', 'Select...')}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 admin-theme" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder || t('common.search', 'Search...')}
          />
          <CommandList>
            <CommandEmpty>
              {emptyMessage || t('common.noResults', 'No results found.')}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem
                  key={`${option.value}-${index}`}
                  value={`${option.label} ${option.value}`} // CMDK uses value for filtering
                  onSelect={() => {
                    // Find the option by comparing the normalized value or simply use the option from closure
                    // In cmdk 1.x, onSelect receives the value prop as argument
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      (value !== undefined && value !== null && String(value) === option.value) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
