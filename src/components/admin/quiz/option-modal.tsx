'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { FormSwitch } from '@/components/admin/shared/form/form-switch'
import { adminQuizService } from '@/services/admin/quiz.service'
import { QuizOption } from '@/types/course'

const optionSchema = z.object({
  option_text: z.string().min(1, 'Option text is required'),
  is_correct: z.boolean().default(false),
})

type OptionFormValues = z.infer<typeof optionSchema>

interface OptionModalProps {
  quizUuid: string
  questionUuid: string
  isOpen: boolean
  onClose: () => void
  option?: QuizOption
  onSuccess: () => void
}

export function OptionModal({
  quizUuid,
  questionUuid,
  isOpen,
  onClose,
  option,
  onSuccess,
}: OptionModalProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<OptionFormValues>({
    resolver: zodResolver(optionSchema) as any,
    defaultValues: {
      option_text: '',
      is_correct: false,
    },
  })

  React.useEffect(() => {
    if (option) {
      form.reset({
        option_text: option.option_text,
        is_correct: option.is_correct,
      })
    } else {
      form.reset({
        option_text: '',
        is_correct: false,
      })
    }
  }, [option, form, isOpen])

  const onSubmit = async (values: OptionFormValues) => {
    setIsSubmitting(true)
    try {
      if (option) {
        await adminQuizService.updateOption(
          quizUuid,
          questionUuid,
          option.uuid,
          values,
        )
        toast.success(t('common.updateSuccess', 'Option updated successfully'))
      } else {
        await adminQuizService.storeOption(quizUuid, questionUuid, values)
        toast.success(t('common.createSuccess', 'Option created successfully'))
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors
        Object.keys(serverErrors).forEach((key) => {
          const fieldError = serverErrors[key]
          const message =
            typeof fieldError === 'object' && !Array.isArray(fieldError)
              ? (Object.values(fieldError)[0] as string)
              : Array.isArray(fieldError)
                ? fieldError[0]
                : fieldError

          // Long messages shift the layout; show as toast instead
          if (message.length > 40) {
            toast.error(message)
            form.setError(key as any, {
              type: 'server',
              message: t('common.invalidChoice', 'Invalid selection'),
            })
          } else {
            form.setError(key as any, {
              type: 'server',
              message: message,
            })
          }
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
      <DialogContent className="sm:max-w-[400px] admin-theme shadow-lg border border-slate-100 rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {option
              ? t('quiz.editOption', 'Edit Option')
              : t('quiz.addOption', 'Add Option')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/90">
            {t(
              'quiz.optionModalDesc',
              'Enter the option text and specify if it is the correct answer.',
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            <FormInput
              control={form.control as any}
              name="option_text"
              label={t('quiz.optionText', 'Option Text')}
              placeholder="Enter answer option"
              required
            />
            <FormSwitch
              control={form.control as any}
              name="is_correct"
              label={t('quiz.isCorrect', 'Correct Answer')}
              description={t(
                'quiz.isCorrectDesc',
                'Mark this as the correct response.'
              )}
            />
            <DialogFooter>
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
                {option ? t('common.save') : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
