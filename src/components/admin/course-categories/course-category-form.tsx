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
import type { CourseCategory } from '@/types/course'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, numbers, and dashes only'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CourseCategoryFormProps {
  category?: CourseCategory
  onSubmit: (data: FormValues) => void
  onCancel: () => void
  onDelete?: () => void
}

export function CourseCategoryForm({
  category,
  onSubmit,
  onCancel,
  onDelete,
}: CourseCategoryFormProps) {
  const { t } = useTranslation()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
    },
  })

  const name = form.watch('name')
  
  React.useEffect(() => {
    if (!category && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      form.setValue('slug', generatedSlug, { shouldValidate: true })
    }
  }, [name, category, form])

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput
          control={form.control}
          label={t('common.name')}
          name="name"
          placeholder="e.g. Programming"
          required
        />
        <FormInput
          control={form.control}
          label="Slug"
          name="slug"
          placeholder="e.g. programming-basics"
          required
        />
        <FormTextarea
          control={form.control}
          label={t('common.description')}
          name="description"
          placeholder={t(
            'courseCategories.descriptionPlaceholder',
            'Enter category description...',
          )}
        />
        <div className="flex justify-between items-center pt-6">
          <div>
            {category && onDelete && (
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
              {category ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
