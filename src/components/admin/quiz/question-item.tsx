'use client'

import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  Trash,
  Edit3,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { adminQuizService } from '@/services/admin/quiz.service'
import { QuizQuestion, QuizOption } from '@/types/course'
import { OptionModal } from '@/components/admin/quiz/option-modal'

interface QuestionItemProps {
  quizUuid: string
  question: QuizQuestion
  onEdit: (question: QuizQuestion) => void
  onDelete: (question: QuizQuestion) => void
}

export function QuestionItem({
  quizUuid,
  question,
  onEdit,
  onDelete,
}: QuestionItemProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [options, setOptions] = React.useState<QuizOption[]>(
    question.options || [],
  )
  const [isOptionModalOpen, setIsOptionModalOpen] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState<
    QuizOption | undefined
  >()

  const fetchOptions = React.useCallback(async () => {
    try {
      const data = await adminQuizService.getOptions(quizUuid, question.uuid)
      setOptions(data)
    } catch {
      toast.error('Failed to fetch options')
    }
  }, [quizUuid, question.uuid])

  const handleToggleCorrect = async (optionUuid: string) => {
    const isSingleChoice = ['single_choice', 'true_false'].includes(
      question.type,
    )

    // Optimistic Update
    const previousOptions = [...options]
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.uuid === optionUuid) {
          return { ...opt, is_correct: isSingleChoice ? true : !opt.is_correct }
        }
        return isSingleChoice ? { ...opt, is_correct: false } : opt
      }),
    )

    try {
      // Find the toggle target to get its current (new) state if needed,
      // but backend handles unmarking others for single choice anyway as per user's prompt
      const targetOption = options.find((o) => o.uuid === optionUuid)
      if (!targetOption) return

      await adminQuizService.updateOption(quizUuid, question.uuid, optionUuid, {
        is_correct: isSingleChoice ? true : !targetOption.is_correct,
      })

      // Fetch latest state to ensure sync with server
      fetchOptions()
    } catch {
      setOptions(previousOptions)
      toast.error('Failed to update option')
    }
  }

  const handleDeleteOption = async (option: QuizOption) => {
    try {
      await adminQuizService.destroyOption(quizUuid, question.uuid, option.uuid)
      toast.success(t('common.deleteSuccess', 'Option deleted successfully'))
      fetchOptions()
    } catch {
      toast.error('Failed to delete option')
    }
  }

  const handleEditOption = (option: QuizOption) => {
    setSelectedOption(option)
    setIsOptionModalOpen(true)
  }

  const handleAddOption = () => {
    setSelectedOption(undefined)
    setIsOptionModalOpen(true)
  }

  const typeLabel: Record<string, string> = {
    single_choice: t('quiz.singleChoice', 'Single Choice'),
    multiple_choice: t('quiz.multipleChoice', 'Multiple Choice'),
    true_false: t('quiz.trueFalse', 'True/False'),
    range: t('quiz.range', 'Range'),
  }

  return (
    <div className="group rounded-2xl border bg-card transition-all hover:border-primary/20">
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <HelpCircle className="size-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-lg">{question.question}</h4>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                {typeLabel[question.type]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                • {question.points} {t('quiz.points', 'Points')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEdit(question)}
                className="gap-2 cursor-pointer"
              >
                <Edit3 className="size-4" /> {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(question)}
                className="gap-2 text-destructive cursor-pointer"
              >
                <Trash className="size-4" /> {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            className="h-9 w-9 p-0 rounded-xl text-slate-400"
          >
            {isExpanded ? (
              <ChevronUp className="size-5" />
            ) : (
              <ChevronDown className="size-5" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t"
          >
            <div className="p-6 space-y-4 bg-slate-50/30">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-sm uppercase tracking-widest text-slate-400">
                  {t('quiz.options', 'Options')}
                </h5>
                {!['true_false', 'range'].includes(question.type) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-all"
                    onClick={handleAddOption}
                  >
                    <Plus className="size-4" />{' '}
                    {t('quiz.addOption', 'Add Option')}
                  </Button>
                )}
              </div>
              <div className="grid gap-2">
                {options.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
                    {t('quiz.noOptions', 'No options added yet.')}
                  </div>
                ) : (
                  options.map((option) => (
                    <div
                      key={option.uuid}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-primary/20 transition-all group/option"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          className={cn(
                            'focus:outline-none transition-transform active:scale-95',
                            question.type === 'range' &&
                              'cursor-default active:scale-100',
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (question.type !== 'range') {
                              handleToggleCorrect(option.uuid)
                            }
                          }}
                        >
                          {['single_choice', 'true_false'].includes(
                            question.type,
                          ) ? (
                            <div
                              className={cn(
                                'size-5 rounded-full border-2 flex items-center justify-center transition-all',
                                option.is_correct
                                  ? 'border-primary bg-primary'
                                  : 'border-slate-300',
                              )}
                            >
                              {option.is_correct && (
                                <div className="size-2 rounded-full bg-white" />
                              )}
                            </div>
                          ) : question.type === 'multiple_choice' ? (
                            <div
                              className={cn(
                                'size-5 rounded-md border-2 flex items-center justify-center transition-all',
                                option.is_correct
                                  ? 'border-primary bg-primary'
                                  : 'border-slate-300',
                              )}
                            >
                              {option.is_correct && (
                                <CheckCircle2 className="size-3.5 text-white" />
                              )}
                            </div>
                          ) : null}
                        </button>
                        <span
                          className={cn(
                            'text-sm transition-all',
                            option.is_correct
                              ? 'font-bold text-slate-900'
                              : 'text-slate-600',
                          )}
                        >
                          {option.option_text}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/option:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => handleEditOption(option)}
                        >
                          <Edit3 className="size-3.5" />
                        </Button>
                        {!['true_false', 'range'].includes(question.type) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive"
                            onClick={() => handleDeleteOption(option)}
                          >
                            <Trash className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        quizUuid={quizUuid}
        questionUuid={question.uuid}
        option={selectedOption}
        onSuccess={fetchOptions}
      />
    </div>
  )
}
