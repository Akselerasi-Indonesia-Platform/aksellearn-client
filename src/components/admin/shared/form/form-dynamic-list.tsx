'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Control, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface FormDynamicListProps {
  control: Control<any>
  name: string
  label: string
  placeholder?: string
  required?: boolean
}

export function FormDynamicList({
  control,
  name,
  label,
  placeholder,
  required,
}: FormDynamicListProps) {
  const { t } = useTranslation()
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  })

  // Ensure there is at least one field if required and empty
  // Actually, we can let it be empty and just show a message or a button to add.

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel
          className={
            required
              ? 'after:content-["*"] after:ml-0.5 after:text-destructive'
              : ''
          }
        >
          {label}
        </FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 rounded-lg text-xs"
          onClick={() => append('')}
        >
          <Plus className="h-3 w-3" />
          {t('common.add', 'Add Item')}
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={control}
            name={`${name}.${index}`}
            render={({ field: inputField }) => (
              <FormItem>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...inputField}
                      placeholder={
                        placeholder ||
                        t('common.itemPlaceholder', 'Enter item...')
                      }
                      className="rounded-xl"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {fields.length === 0 && (
          <div className="text-center py-4 border border-dashed rounded-xl bg-muted/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold opacity-60">
              No items added yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
