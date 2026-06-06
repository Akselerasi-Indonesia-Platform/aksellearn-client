'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormInput, FormTextarea } from '@/components/admin/shared/form'
import type { ArticleCategory } from '@/types/article-category'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  // slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  // status: z.enum(['active', 'inactive']),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  category?: ArticleCategory
  onSubmit: (data: Partial<CategoryFormValues>) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({
  category,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: category
      ? {
          name: category.name,
          // slug: category.slug,
          description: category.description || '',
          // status: category.status,
        }
      : {
          name: '',
          // slug: '',
          description: '',
          // status: 'active',
        },
  })

  // Auto-generate slug logic removed as it's not needed for now
  /*
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('name', e.target.value)
    if (!category) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      form.setValue('slug', slug)
    }
  }
  */

  const handleSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error: any) {
      console.error('Form submission error:', error)
      const responseData = error.response?.data

      if (responseData?.errors) {
        const serverErrors = responseData.errors
        Object.keys(serverErrors).forEach((key) => {
          const errorObj = serverErrors[key]
          const message =
            typeof errorObj === 'string'
              ? errorObj
              : (Object.values(errorObj)[0] as string)
          form.setError(key as any, { type: 'server', message })
        })
      } else if (responseData?.message) {
        form.setError('root', { message: responseData.message })
      } else if (responseData?.data && typeof responseData.data === 'object') {
        // Fallback for older format
        const serverErrors = responseData.data
        Object.keys(serverErrors).forEach((key) => {
          const errorObj = serverErrors[key]
          const message =
            typeof errorObj === 'string'
              ? errorObj
              : (Object.values(errorObj)[0] as string)
          form.setError(key as any, { type: 'server', message })
        })
      } else {
        form.setError('root', { message: 'An unexpected error occurred.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
        {form.formState.errors.root && (
          <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md font-medium">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormInput
          control={form.control}
          label="Name"
          name="name"
          placeholder="Category Name"
          required
        />

        <FormTextarea
          control={form.control}
          label="Description"
          name="description"
          placeholder="Short description..."
        />

        {/* <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.status')}</FormLabel>
              <Select
                defaultValue={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">{t('common.active')}</SelectItem>
                  <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <div className="flex justify-end gap-3 pt-6">
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
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
