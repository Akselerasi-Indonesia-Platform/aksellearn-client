import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormInput } from '@/components/admin/shared/form'
import type { Role } from '@/types/role'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
})

type FormValues = z.infer<typeof formSchema>

interface RoleFormProps {
  role?: Role
  onSubmit: (data: FormValues) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function RoleForm({ role, onSubmit, onCancel, onDelete }: RoleFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name || '',
    },
  })

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4 py-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormInput
          control={form.control}
          label="Role Name"
          name="name"
          placeholder="e.g. Moderator"
          required
        />

        <div className="flex justify-between items-center pt-4">
          <div>
            {role && onDelete && (
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
          <div className="flex gap-2">
            <Button
              className="hover:bg-accent transition-colors"
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="shadow-filament transition-all active:scale-[0.98]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? t('common.save') + '...'
                : role
                  ? t('common.update')
                  : t('common.create')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
