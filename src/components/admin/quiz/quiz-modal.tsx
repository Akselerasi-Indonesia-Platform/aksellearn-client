import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2 } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { FormInput } from '@/components/admin/shared/form/form-input'
import { FormTextarea } from '@/components/admin/shared/form/form-textarea'
import { adminQuizService } from '@/services/admin/quiz.service'
import { Quiz } from '@/types/course'

const quizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  passing_percentage: z.preprocess(
    (val) => (val === '' ? 70 : parseInt(String(val), 10)),
    z.number().int().min(0).max(100),
  ),
  time_limit_minutes: z.preprocess(
    (val) =>
      val === '' || val === '0' || val === 0 ? null : parseInt(String(val), 10),
    z.number().int().min(1).nullable().default(null),
  ),
})

type QuizFormValues = z.infer<typeof quizSchema>

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  quiz?: Quiz
  onSuccess: (quiz: Quiz) => void
  onDelete?: () => void
}

export function QuizModal({
  isOpen,
  onClose,
  quiz,
  onSuccess,
  onDelete,
}: QuizModalProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      passing_percentage: 70,
      time_limit_minutes: 0 as any, // Cast to any to handle null/0/string lifecycle in form
    },
  })

  React.useEffect(() => {
    if (quiz) {
      form.reset({
        title: quiz.title,
        description: quiz.description || '',
        passing_percentage: quiz.passing_percentage,
        time_limit_minutes: quiz.time_limit_minutes || 0,
      })
    } else {
      form.reset({
        title: '',
        description: '',
        passing_percentage: 70,
        time_limit_minutes: 0,
      })
    }
  }, [quiz, form, isOpen])

  const onSubmit = async (values: QuizFormValues) => {
    setIsSubmitting(true)
    try {
      // Final sanitization to ensure pure types for Go/strict-typed backends
      const payload = {
        ...values,
        passing_percentage: Number(values.passing_percentage),
        time_limit_minutes: values.time_limit_minutes
          ? Number(values.time_limit_minutes)
          : null,
      }

      let result: Quiz
      if (quiz) {
        result = await adminQuizService.update(quiz.uuid, payload)
        toast.success(t('common.updateSuccess', 'Quiz updated successfully'))
      } else {
        result = await adminQuizService.create(payload)
        toast.success(t('common.createSuccess', 'Quiz created successfully'))
      }
      onSuccess(result)
      onClose()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors
        Object.keys(serverErrors).forEach((key) => {
          const fieldError = serverErrors[key]
          const message =
            typeof fieldError === 'object'
              ? (Object.values(fieldError)[0] as string)
              : fieldError

          form.setError(key as any, {
            type: 'server',
            message: message,
          })
        })
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] admin-theme shadow-lg border border-slate-100 rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {quiz
              ? t('quiz.editTitle', 'Edit Quiz')
              : t('quiz.addTitle', 'Create New Quiz')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/90">
            {t(
              'quiz.modalDescription',
              'Fill in the details for the quiz foundation.',
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation()
              form.handleSubmit(onSubmit as any)(e)
            }}
            className="space-y-4"
          >
            <FormInput
              control={form.control as any}
              name="title"
              label={t('quiz.title', 'Title')}
              placeholder="Enter quiz title"
              required
            />
            <FormTextarea
              control={form.control as any}
              name="description"
              label={t('quiz.description', 'Description')}
              placeholder="Enter quiz description"
            />
            <div className="grid grid-cols-2 gap-4 items-start">
              <FormInput
                control={form.control as any}
                name="passing_percentage"
                label={t('quiz.passingPercentage', 'Passing %')}
                type="number"
                required
              />
              <FormInput
                control={form.control as any}
                name="time_limit_minutes"
                label={t('quiz.timeLimit', 'Time Limit')}
                type="number"
                placeholder="0 for unlimited"
                description={
                  <span className="block -mt-1 leading-none text-muted-foreground text-xs">
                    {t('quiz.timeLimitDesc', '0 for unlimited')}
                  </span>
                }
              />
            </div>
            <div className="flex justify-between items-center pt-4">
              <div>
                {quiz && onDelete && (
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
                  variant="outline"
                  type="button"
                  onClick={onClose}
                  className="hover:bg-accent/50 transition-all duration-200 rounded-xl"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 shadow-filament hover:shadow-filament-hover active:scale-[0.98] transition-all duration-200 px-8 rounded-xl font-bold"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {quiz ? t('common.save') : t('common.create')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
