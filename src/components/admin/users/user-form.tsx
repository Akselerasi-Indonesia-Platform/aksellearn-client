'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormInput, FormSelect } from '@/components/admin/shared/form'
import { Input } from '@/components/ui/input'
import type { User } from '@/types/user'

const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    roles: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive']),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is provided, validation requires confirmation to match
      if (data.password && data.password !== data.password_confirmation) {
        return false
      }
      return true
    },
    {
      message: "Passwords don't match",
      path: ['password_confirmation'],
    },
  )

type UserFormValues = z.infer<typeof formSchema>

interface UserFormProps {
  user?: User
  onSubmit: (data: Partial<UserFormValues>) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function UserForm({ user, onSubmit, onCancel, onDelete }: UserFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          roles: user.roles || (user.role ? [user.role] : []),
          status: user.status,
          password: '',
          password_confirmation: '',
        }
      : {
          name: '',
          email: '',
          roles: [],
          status: 'active',
          password: '',
          password_confirmation: '',
        },
  })

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true)
    try {
      // Filter out empty password fields if not set, to avoid sending empty strings
      const payload = { ...values }
      if (!payload.password) delete payload.password
      if (!payload.password_confirmation) delete payload.password_confirmation

      await onSubmit(payload)
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

  // Calculate spacing based on errors directly in the className logic or use a helper,
  // but here we'll just use a consistent spacious layout that accommodates errors gracefully.
  // We can use 'space-y-6' on the form to give more room.

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
          label={t('common.name', 'Name')}
          name="name"
          placeholder="John Doe"
          required
        />
        <FormInput
          control={form.control}
          label={t('common.email')}
          name="email"
          placeholder="john@example.com"
          type="email"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.password', 'Password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      className="pr-10"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={
                        user ? 'Leave blank to keep current' : 'Enter password'
                      }
                      {...field}
                    />
                    <Button
                      className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        Toggle password visibility
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('common.confirmPassword', 'Confirm Password')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      className="pr-10"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={
                        user
                          ? 'Leave blank to keep current'
                          : 'Confirm password'
                      }
                      {...field}
                    />
                    <Button
                      className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        Toggle password visibility
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormSelect
            control={form.control}
            label={t('common.status')}
            name="status"
            options={[
              { label: t('common.active'), value: 'active' },
              { label: t('common.inactive'), value: 'inactive' },
            ]}
            placeholder={t('common.selectStatus', 'Select status')}
            required
          />
        </div>

        <div className="flex justify-between items-center pt-6">
          <div>
            {user && onDelete && (
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
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
