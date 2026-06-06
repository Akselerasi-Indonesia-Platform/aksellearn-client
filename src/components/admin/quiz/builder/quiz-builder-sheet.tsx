'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { adminQuizService } from '@/services/admin/quiz.service'
import { Quiz, QuizQuestion } from '@/types/course'
import { HelpCircle, Loader2, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { QuestionList } from '@/components/admin/quiz/builder/question-list'
import { QuestionForm } from '@/components/admin/quiz/builder/question-form'
import { QuizIconBadge } from './quiz-icon-badge'

interface QuizBuilderSheetProps {
  quizUuid: string | null
  isOpen: boolean
  onClose: () => void
}

export function QuizBuilderSheet({
  quizUuid,
  isOpen,
  onClose,
}: QuizBuilderSheetProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(
    null,
  )
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchData = useCallback(async () => {
    if (!quizUuid) return
    setIsLoading(true)
    try {
      const quizData = await adminQuizService.getOne(quizUuid)
      setQuiz(quizData)
      const questionData = await adminQuizService.getQuestions(quizUuid)
      setQuestions(questionData)
    } catch {
      toast.error('Failed to load assessment data')
    } finally {
      setIsLoading(false)
    }
  }, [quizUuid])

  useEffect(() => {
    if (isOpen && quizUuid) {
      fetchData()
    }
  }, [isOpen, quizUuid, fetchData])

  const handleAddQuestion = () => {
    setActiveQuestion(null)
    setIsFormOpen(true)
  }

  const handleEditQuestion = (question: QuizQuestion) => {
    setActiveQuestion(question)
    setIsFormOpen(true)
  }

  const handleDeleteQuestion = async (questionUuid: string) => {
    if (!quizUuid) return
    try {
      await adminQuizService.destroyQuestion(quizUuid, questionUuid)
      setQuestions((prev) => prev.filter((q) => q.uuid !== questionUuid))
      toast.success('Assessment item removed')
    } catch {
      toast.error('Failed to eliminate question')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl w-full p-0 flex flex-col gap-0 border-l border-border shadow-2xl admin-theme bg-card"
      >
        <SheetHeader className="p-8 border-b border-border bg-background/90 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <QuizIconBadge icon={HelpCircle} size="lg" />
              <div className="space-y-0.5">
                <SheetTitle className="text-3xl font-bold tracking-tight text-foreground">
                  {quiz?.title || 'Quiz Questions'}
                </SheetTitle>
                <SheetDescription className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.25em]">
                  Manage assessment questions
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchData}
                className="size-11 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
              >
                <RefreshCw
                  className={
                    isLoading
                      ? 'h-5 w-5 animate-spin text-primary'
                      : 'h-5 w-5 text-muted-foreground'
                  }
                />
              </Button>
              <Button
                className="rounded-xl gap-2 font-bold shadow-sm h-10 px-5 bg-primary hover:bg-primary/90 transition-all active:scale-95 group text-xs uppercase tracking-widest text-primary-foreground"
                size="sm"
                onClick={handleAddQuestion}
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                New Question
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-10 bg-muted/20 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest">
                Loading questions...
              </p>
            </div>
          ) : (
            <QuestionList
              questions={questions}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
            />
          )}
        </div>

        {quizUuid && (
          <QuestionForm
            quizUuid={quizUuid}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            question={activeQuestion}
            onSuccess={(newQuestion: QuizQuestion) => {
              if (activeQuestion) {
                setQuestions((prev) =>
                  prev.map((q) =>
                    q.uuid === newQuestion.uuid ? newQuestion : q,
                  ),
                )
              } else {
                setQuestions((prev) => [...prev, newQuestion])
                setIsFormOpen(false)
              }
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
