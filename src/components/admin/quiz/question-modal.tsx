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
import { FormSelect } from '@/components/admin/shared/form/form-select'
import { FormTextarea } from '@/components/admin/shared/form/form-textarea'
import { adminQuizService } from '@/services/admin/quiz.service'
import { QuizQuestion } from '@/types/course'

const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  type: z
    .enum(['single_choice', 'multiple_choice', 'true_false', 'range', 'multiple_response'])
    .default('single_choice'),
  points: z.coerce.number().min(1).default(1),
  explanation: z.string().optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

interface QuestionModalProps {
  quizUuid: string
  isOpen: boolean
  onClose: () => void
  question?: QuizQuestion
  onSuccess: () => void
}

export function QuestionModal({
  quizUuid,
  isOpen,
  onClose,
  question,
  onSuccess,
}: QuestionModalProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema) as any,
    defaultValues: {
      question: '',
      type: 'single_choice',
      points: 1,
      explanation: '',
    },
  })

  React.useEffect(() => {
    if (question) {
      form.reset({
        question: question.question,
        type: question.type,
        points: question.points,
        explanation: question.explanation || '',
      })
    } else {
      form.reset({
        question: '',
        type: 'single_choice',
        points: 1,
        explanation: '',
      })
    }
  }, [question, form, isOpen])

  const onSubmit = async (values: QuestionFormValues) => {
    setIsSubmitting(true)
    try {
      let savedQuestion: QuizQuestion
      if (question) {
        savedQuestion = await adminQuizService.updateQuestion(
          quizUuid,
          question.uuid,
          values,
        )
        toast.success(
          t('common.updateSuccess', 'Question updated successfully'),
        )

        // If changed to true_false and had no options before
        if (
          values.type === 'true_false' &&
          (!question.options || question.options.length === 0)
        ) {
          await Promise.all([
            adminQuizService.addOption(quizUuid, savedQuestion.uuid, {
              option_text: 'True',
              is_correct: true,
            }),
            adminQuizService.addOption(quizUuid, savedQuestion.uuid, {
              option_text: 'False',
              is_correct: false,
            }),
          ])
        }
      } else {
        savedQuestion = await adminQuizService.addQuestion(quizUuid, values)
        toast.success(
          t('common.createSuccess', 'Question created successfully'),
        )

        // Auto-fill True/False options for new questions
        if (values.type === 'true_false') {
          await Promise.all([
            adminQuizService.addOption(quizUuid, savedQuestion.uuid, {
              option_text: 'True',
              is_correct: true,
            }),
            adminQuizService.addOption(quizUuid, savedQuestion.uuid, {
              option_text: 'False',
              is_correct: false,
            }),
          ])
        }

        // Auto-fill Range options (1-10)
        if (values.type === 'range') {
          const rangeOptions = Array.from({ length: 10 }, (_, i) => ({
            option_text: (i + 1).toString(),
            is_correct: true,
          }))
          await Promise.all(
            rangeOptions.map((opt) =>
              adminQuizService.addOption(quizUuid, savedQuestion.uuid, opt),
            ),
          )
        }
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

          // If the error message is long, it will break the layout.
          // Show it as a toast instead and keep a short marker on the field.
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

  const typeOptions = [
    { label: t('quiz.singleChoice', 'Single Choice'), value: 'single_choice' },
    {
      label: t('quiz.multipleChoice', 'Multiple Choice'),
      value: 'multiple_choice',
    },
    {
      label: t('quiz.multipleResponse', 'Multiple Response'),
      value: 'multiple_response',
    },
    { label: t('quiz.trueFalse', 'True / False'), value: 'true_false' },
    { label: t('quiz.range', 'Range (1-10)'), value: 'range' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] admin-theme shadow-lg border border-slate-100 rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {question
              ? t('quiz.editQuestion', 'Edit Question')
              : t('quiz.addQuestion', 'Add Question')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/90">
            {t(
              'quiz.questionModalDesc',
              'Define the question text and its type.',
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
              name="question"
              label={t('quiz.questionText', 'Question Text')}
              placeholder="What is the capital of...?"
              required
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 pb-4">
              <FormSelect
                control={form.control as any}
                name="type"
                label={t('quiz.type', 'Question Type')}
                options={typeOptions}
                required
              />
              <FormInput
                control={form.control as any}
                name="points"
                label={t('quiz.points', 'Points')}
                type="number"
                required
              />
            </div>
            <FormTextarea
              control={form.control as any}
              name="explanation"
              label={t('quiz.explanation', 'Answer Explanation')}
              placeholder={t(
                'quiz.explanationPlaceholder',
                'Explain why the correct answer is right...',
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
                {question ? t('common.save') : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
