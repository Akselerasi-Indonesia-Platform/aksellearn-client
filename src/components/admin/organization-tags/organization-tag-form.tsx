'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import React from 'react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormInput, FormTextarea } from '@/components/admin/shared/form'
import type { OrganizationTag } from '@/types/organization'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface OrganizationTagFormProps {
  tag?: OrganizationTag
  onSubmit: (data: FormValues) => void
  onCancel: () => void
  onDelete?: () => void
}

export function OrganizationTagForm({
  tag,
  onSubmit,
  onCancel,
  onDelete,
}: OrganizationTagFormProps) {
  const { t } = useTranslation()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tag?.name || '',
      description: tag?.description || '',
    },
  })

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput
          control={form.control}
          label="Tag Name"
          name="name"
          placeholder="e.g. Technology"
          required
        />
        <FormTextarea
          control={form.control}
          label="Description"
          name="description"
          placeholder="Enter tag description..."
        />
        <div className="flex justify-between items-center pt-6">
          <div>
            {tag && onDelete && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10 p-0"
                onClick={onDelete}
                title={t('common.delete')}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              className="hover:bg-accent/50 transition-all duration-200"
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 shadow-filament hover:shadow-filament-hover active:scale-[0.98] transition-all duration-200 px-8"
              type="submit"
            >
              {tag ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
