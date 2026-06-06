import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, BookOpen, Link2, Layers, AlignLeft } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as z from 'zod'

import { adminCourseService } from '@/services/admin/course.service'
import { invalidateDiscoveryCache } from '@/lib/cache-utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect } from '@/components/admin/shared/searchable-select'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  course_category_uuid: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string(),
  is_active: z.number(),
})

type FormValues = z.infer<typeof formSchema>

interface QuickAddCourseModalProps {
  isOpen: boolean
  onClose: () => void
  categories: { label: string; value: string }[]
}

export function CourseDrawer({
  isOpen,
  onClose,
  categories,
}: QuickAddCourseModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      course_category_uuid: '',
      description: '',
      content: '<p></p>',
      is_active: 0,
    },
  })

  React.useEffect(() => {
    if (isOpen) {
      form.reset()
    }
  }, [isOpen, form])

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      const newCourse = await adminCourseService.create(values)
      invalidateDiscoveryCache()
      toast.success(t('common.createSuccess', 'Course created successfully'))
      onClose()
      navigate({ to: `/admin/course/${newCourse.slug || newCourse.uuid || newCourse.id}` })
    } catch (error: any) {
      console.error(error)
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors
        Object.keys(serverErrors).forEach((key) => {
          const fieldError = serverErrors[key]
          const message =
            typeof fieldError === 'object'
              ? (Object.values(fieldError)[0] as string)
              : fieldError
          form.setError(key as any, { type: 'server', message })
        })
        toast.error(
          error.response.data.message ||
            t('common.validationError', 'Validation failed'),
        )
      } else {
        toast.error(
          error.response?.data?.message ||
            t('common.createFailed', 'Failed to create course'),
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] admin-theme shadow-lg border border-slate-100 rounded-3xl">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription className="text-muted-foreground/90">
            Let's get the foundation set up first, then we'll fine-tune the details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-6 pt-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                      <BookOpen className="w-3 h-3" /> Course Title
                      <span className="text-destructive ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 rounded-xl"
                        placeholder="E.g., Master React in 30 Days"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course_category_uuid"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                      <Layers className="w-3 h-3" /> Category
                      <span className="text-destructive ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchableSelect
                        className="w-full"
                        options={categories}
                        placeholder="Select a category"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-[11px] text-muted-foreground leading-tight -mt-1">
                      Used for catalog filtering and promotion scope targeting.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                      <AlignLeft className="w-3 h-3" /> Brief Description
                      <span className="text-destructive ml-0.5">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="resize-none rounded-xl"
                        placeholder="A short summary of what students will learn..."
                        rows={3}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end items-center pt-2 gap-2">
              <Button
                className="hover:bg-accent/50 transition-all duration-200 rounded-xl h-11 px-4"
                disabled={isSubmitting}
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 w-full md:w-auto rounded-xl h-11"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save & Continue
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
