'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FieldHint,
  FormSectionHint,
} from '@/components/admin/shared/form'
import { Button } from '@/components/ui/button'
import { QuizQuestion } from '@/types/course'
import { adminQuizService } from '@/services/admin/quiz.service'
import {
  Check,
  Loader2,
  Plus,
  Edit,
  HelpCircle,
  LayoutGrid,
} from 'lucide-react'
import { toast } from 'sonner'

const RANGE_PRESETS = [
  { label: 'Numeric (1-5)', value: 'numeric_5' },
  { label: 'Numeric (1-10)', value: 'numeric_10' },
  { label: 'Likert (Agreement)', value: 'likert_agreement' },
  { label: 'Likert (Satisfaction)', value: 'likert_satisfaction' },
  { label: 'Custom Labels', value: 'custom' },
]

const RANGE_PRESET_OPTIONS = {
  numeric_5: Array.from({ length: 5 }, (_, i) => ({
    option_text: (i + 1).toString(),
    is_correct: true,
  })),
  numeric_10: Array.from({ length: 10 }, (_, i) => ({
    option_text: (i + 1).toString(),
    is_correct: true,
  })),
  likert_agreement: [
    { option_text: 'Strongly Agree', is_correct: true },
    { option_text: 'Agree', is_correct: true },
    { option_text: 'Neutral', is_correct: true },
    { option_text: 'Disagree', is_correct: true },
    { option_text: 'Strongly Disagree', is_correct: true },
  ],
  likert_satisfaction: [
    { option_text: 'Very Satisfied', is_correct: true },
    { option_text: 'Satisfied', is_correct: true },
    { option_text: 'Neutral', is_correct: true },
    { option_text: 'Dissatisfied', is_correct: true },
    { option_text: 'Very Dissatisfied', is_correct: true },
  ],
}

const questionSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters'),
  type: z.enum(['multiple_choice', 'single_choice', 'true_false', 'range']),
  points: z.number().int().min(1).max(500),
  explanation: z.string().optional(),
  range_preset: z.string().optional(),
  options: z
    .array(
      z.object({
        uuid: z.string().optional(),
        option_text: z.string().min(1, 'Option text is required'),
        is_correct: z.boolean(),
      }),
    )
    .optional(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

interface QuestionFormProps {
  quizUuid: string
  question: QuizQuestion | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (question: QuizQuestion) => void
}

import { OptionEditorRow } from './option-editor-row'
import { QuizIconBadge } from './quiz-icon-badge'

export function QuestionForm({
  quizUuid,
  question,
  isOpen,
  onClose,
  onSuccess,
}: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema) as any,
    defaultValues: {
      question: '',
      type: 'multiple_choice',
      points: 10,
      explanation: '',
      options: [
        { option_text: 'Option A', is_correct: true },
        { option_text: 'Option B', is_correct: false },
      ],
      range_preset: 'numeric_10' as any,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  })

  useEffect(() => {
    if (isOpen) {
      if (question) {
        form.reset({
          question: question.question,
          type: question.type as any,
          points: question.points,
          explanation: question.explanation || '',
          options: (question.options || []).map((opt) => ({
            uuid: opt.uuid,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
          })),
          range_preset: 'custom',
        })
      } else {
        const defaultOptions = {
          single_choice: [
            { option_text: 'Option A', is_correct: true },
            { option_text: 'Option B', is_correct: false },
          ],
          multiple_choice: [
            { option_text: 'Option A', is_correct: true },
            { option_text: 'Option B', is_correct: false },
          ],
          true_false: [
            { option_text: 'True', is_correct: true },
            { option_text: 'False', is_correct: false },
          ],
          range: Array.from({ length: 10 }, (_, i) => ({
            option_text: (i + 1).toString(),
            is_correct: true,
          })),
        }

        form.reset({
          question: '',
          type: 'single_choice',
          points: 10,
          explanation: '',
          options: defaultOptions['single_choice'],
        })
      }
    }
  }, [isOpen, question, form])

  const questionType = form.watch('type')

  // Auto-switch options when type changes for new questions
  useEffect(() => {
    if (!question) {
      const defaultOptions = {
        true_false: [
          { option_text: 'True', is_correct: true },
          { option_text: 'False', is_correct: false },
        ],
        range: RANGE_PRESET_OPTIONS.numeric_10,
        single_choice: [
          { option_text: 'Option A', is_correct: true },
          { option_text: 'Option B', is_correct: false },
        ],
        multiple_choice: [
          { option_text: 'Option A', is_correct: true },
          { option_text: 'Option B', is_correct: false },
        ],
      }
      form.setValue(
        'options',
        defaultOptions[questionType as keyof typeof defaultOptions] || [],
      )
      if (questionType === 'range') {
        form.setValue('range_preset' as any, 'numeric_10')
      }
    }
  }, [questionType, question, form])

  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') return
    const presetOptions =
      RANGE_PRESET_OPTIONS[preset as keyof typeof RANGE_PRESET_OPTIONS]
    if (presetOptions) {
      form.setValue('options', presetOptions)
    }
  }

  const onSubmit = async (values: QuestionFormValues) => {
    setIsSubmitting(true)
    try {
      let result: QuizQuestion
      const { options, range_preset, ...questionData } = values

      // 1. Save/Update Question foundation
      if (question) {
        result = await adminQuizService.updateQuestion(
          quizUuid,
          question.uuid,
          questionData as any,
        )
      } else {
        result = await adminQuizService.storeQuestion(
          quizUuid,
          questionData as any,
        )
      }

      // 2. Synchronize Options individually (Compatibility mode for non-nested API)
      if (options && options.length > 0) {
        const optionPromises = options.map(async (opt) => {
          if (opt.uuid) {
            return adminQuizService.updateOption(
              quizUuid,
              result.uuid,
              opt.uuid,
              {
                option_text: opt.option_text,
                is_correct: opt.is_correct,
              },
            )
          } else {
            return adminQuizService.storeOption(quizUuid, result.uuid, {
              option_text: opt.option_text,
              is_correct: opt.is_correct,
            })
          }
        })
        await Promise.all(optionPromises)

        // Fetch fresh question with newly created/updated options to ensure state sync
        result = await adminQuizService.findQuestion(quizUuid, result.uuid)
      }

      toast.success(question ? 'Question updated' : 'Question created')
      onSuccess(result)
    } catch (error) {
      console.error('Quiz Save Error:', error)
      toast.error(
        'Failed to synchronize all assessment data. Please check field connectivity.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCorrect = (index: number) => {
    const currentOptions = form.getValues('options') || []

    if (questionType === 'single_choice' || questionType === 'true_false') {
      // For single choice, we must uncheck everything else
      currentOptions.forEach((_, i) => {
        form.setValue(`options.${i}.is_correct`, i === index)
      })
    } else {
      // For multiple choice, just toggle the specific index
      form.setValue(
        `options.${index}.is_correct`,
        !currentOptions[index].is_correct,
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] gap-0 p-0 overflow-hidden rounded-3xl border border-border bg-card shadow-lg admin-theme">
        <DialogHeader className="p-8 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-4">
            <QuizIconBadge icon={question ? Edit : Plus} size="lg" />
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                {question ? 'Edit Question' : 'Add Question'}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Configure assessment item
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation()
              form.handleSubmit(onSubmit)(e)
            }}
            className="flex flex-col"
          >
            <div className="p-8 gap-8 flex flex-col max-h-[65vh] overflow-y-auto bg-card custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                <div className="md:col-span-3">
                  <FormSelect
                    control={form.control as any}
                    label={
                      <div className="flex items-center">
                        Question Type
                        <FieldHint>
                          Multiple Choice: student picks 1+ correct answers. Single Choice: exactly 1. True/False: binary. Range: rating scale for surveys.
                        </FieldHint>
                      </div>
                    }
                    name="type"
                    placeholder="Select evaluation type..."
                    options={[
                      {
                        label: 'Single Choice (Radio Button)',
                        value: 'single_choice',
                      },
                      {
                        label: 'Multiple Choice (Checkboxes)',
                        value: 'multiple_choice',
                      },
                      { label: 'True/False', value: 'true_false' },
                      { label: 'Range / Likert (Scale 1-10)', value: 'range' },
                    ]}
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <FormInput
                    control={form.control as any}
                    label="Points"
                    name="points"
                    type="number"
                    placeholder="0"
                    description="Points earned if answered correctly. All question points sum to calculate the quiz score percentage."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground pl-1">
                  Question Text
                </label>
                <FormTextarea
                  control={form.control as any}
                  name="question"
                  placeholder="Enter the question here..."
                  className="min-h-[100px] text-base font-bold bg-muted/40 border border-border rounded-2xl focus-visible:ring-primary/20 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Explanation
                  </label>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {form.watch('explanation')?.length || 0}/1000
                  </span>
                </div>
                <FormTextarea
                  control={form.control as any}
                  name="explanation"
                  placeholder="Explain why the correct answer is right..."
                  className="min-h-[80px] text-sm bg-muted/40 border border-border rounded-xl focus-visible:ring-primary/20 transition-all"
                />
                <p className="text-[10px] text-muted-foreground pl-1 mt-1">
                  Shown to students after they submit the quiz. Leave blank if no explanation is needed.
                </p>
              </div>
              {questionType === 'range' && (
                <div className="bg-muted/30 p-6 rounded-2xl border border-border animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <LayoutGrid className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Scale Configuration
                      </h4>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        Select a preset or customize
                      </p>
                    </div>
                  </div>
                  <FormSelect
                    control={form.control as any}
                    label="Scale Preset"
                    name="range_preset"
                    placeholder="Choose a scale..."
                    options={RANGE_PRESETS}
                    onValueChange={handlePresetChange}
                  />
                </div>
              )}

              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Response Configuration
                  </label>
                  {questionType !== 'true_false' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-xl gap-2 font-bold text-[10px] uppercase bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all px-4 shadow-sm"
                      onClick={() => {
                        append({
                          option_text: '',
                          is_correct: questionType === 'range',
                        })
                        form.setValue('range_preset' as any, 'custom')
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add Choice
                    </Button>
                  )}
                </div>

                <FormSectionHint title="Correct Answer Rules" collapsible defaultOpen={false}>
                  For <strong>Multiple Choice</strong>: check ALL correct options. 
                  For <strong>Single Choice</strong>: check exactly one. 
                  For <strong>Range</strong>: all options are valid automatically.
                </FormSectionHint>

                <div className="grid gap-3">
                  {fields.map((field, index) => (
                    <OptionEditorRow
                      key={field.id}
                      index={index}
                      isCorrect={!!form.watch(`options.${index}.is_correct`)}
                      register={form.register(
                        `options.${index}.option_text` as const,
                      )}
                      onToggleCorrect={() => toggleCorrect(index)}
                      onDelete={() => {
                        remove(index)
                        form.setValue('range_preset' as any, 'custom')
                      }}
                      canDelete={fields.length > 2}
                      hideCheck={questionType === 'range'}
                      hideDelete={questionType === 'true_false'}
                    />
                  ))}
                </div>
                <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 flex items-start gap-4 shadow-sm">
                  <div className="p-1 rounded-full bg-primary text-primary-foreground mt-0.5 shadow-sm">
                    <HelpCircle className="size-3" />
                  </div>
                  <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                    {questionType === 'range'
                      ? 'Range questions are completion-based. All responses are considered valid for progress calculation.'
                      : questionType === 'single_choice' ||
                          questionType === 'true_false'
                        ? 'The system will ensure only one choice is marked as correct.'
                        : 'Multiple correct responses are permitted for this evaluation type.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="rounded-xl font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground h-10 px-6"
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                className="rounded-xl font-bold text-xs uppercase tracking-widest h-10 px-6 shadow-sm bg-primary hover:bg-primary/90 transition-all active:scale-95 group text-primary-foreground"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Check className="size-4 mr-2 group-hover:scale-110 transition-transform" />
                )}
                {question ? 'Update Question' : 'Save Question'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
