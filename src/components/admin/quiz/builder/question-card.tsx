import { Edit, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuizQuestion } from '@/types/course'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { OptionPill } from './option-pill'

interface QuestionCardProps {
  question: QuizQuestion
  index: number
  onEdit: (question: QuizQuestion) => void
  onDelete: (uuid: string) => void
  getTypeIcon: (type: string) => React.ReactNode
  getTypeLabel: (type: string) => string
}

export function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
  getTypeIcon,
  getTypeLabel,
}: QuestionCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group relative flex flex-col p-6 gap-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-none ring-1 ring-primary/20 text-[9px] font-bold uppercase tracking-widest px-2.5 h-5 flex items-center gap-1.5 shadow-sm">
                {getTypeIcon(question.type)}
                {getTypeLabel(question.type)}
              </Badge>
              <Badge
                variant="outline"
                className="text-[9px] font-bold uppercase tracking-widest bg-slate-100/50 border-none ring-1 ring-slate-200 h-5 px-2.5 shadow-sm"
              >
                {question.points} Points
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mr-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 hover:bg-primary/10 hover:text-primary transition-all rounded-xl active:scale-90"
            onClick={() => onEdit(question)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            title="Delete Assessment"
            description="Permanently remove this question and all options."
            onConfirm={() => onDelete(question.uuid)}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-9 hover:bg-destructive/10 hover:text-destructive transition-all rounded-xl active:scale-90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>

      <div className="pl-1 mr-4">
        <p className="text-base font-bold text-slate-800 leading-tight tracking-tight">
          {question.question}
        </p>
        {question.options && question.options.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {question.options.map((opt, j) => (
              <OptionPill
                key={j}
                text={opt.option_text}
                isCorrect={!!opt.is_correct}
              />
            ))}
          </div>
        )}
        {question.explanation && question.explanation.trim() !== '' && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                💡 Explanation
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs whitespace-pre-wrap break-words">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
