'use client'

import {
  LucideIcon,
  GraduationCap,
  FileQuestion,
  Type,
  ListChecks,
  HelpCircle,
} from 'lucide-react'
import { QuizQuestion } from '@/types/course'
import { AnimatePresence } from 'framer-motion'
import { QuestionCard } from './question-card'

interface QuestionListProps {
  questions: QuizQuestion[]
  onEdit: (question: QuizQuestion) => void
  onDelete: (uuid: string) => void
}

export function QuestionList({
  questions,
  onEdit,
  onDelete,
}: QuestionListProps) {
  const getTypeIcon = (type: string): React.ReactNode => {
    const icons: Record<string, LucideIcon> = {
      multiple_choice: ListChecks,
      single_choice: FileQuestion,
      true_false: Type,
      multiple_response: GraduationCap,
      essay: HelpCircle,
    }
    const Icon = icons[type] || HelpCircle
    return <Icon className="size-3" />
  }

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      multiple_choice: 'Multiple Choice',
      single_choice: 'Single Choice',
      true_false: 'True / False',
      multiple_response: 'Multiple Response',
      essay: 'Essay',
    }
    return labels[type] || type
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-dashed border-slate-200 rounded-3xl mt-4">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          <HelpCircle className="size-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          No Questions Yet
        </h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
          Start building your assessment bank
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <AnimatePresence mode="popLayout" initial={false}>
        {questions.map((question, i) => (
          <QuestionCard
            key={question.uuid}
            question={question}
            index={i}
            onEdit={onEdit}
            onDelete={onDelete}
            getTypeIcon={getTypeIcon}
            getTypeLabel={getTypeLabel}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
