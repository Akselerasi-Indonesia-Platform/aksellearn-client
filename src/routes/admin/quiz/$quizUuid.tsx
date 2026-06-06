import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Plus,
  ChevronLeft,
  HelpCircle,
  LayoutList,
  AlertCircle,
} from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminQuizService } from '@/services/admin/quiz.service'
import { Quiz, QuizQuestion } from '@/types/course'
import { QuestionList } from '@/components/admin/quiz/builder/question-list'
import { QuestionForm } from '@/components/admin/quiz/builder/question-form'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { AddActionButton } from '@/components/admin/shared/button/add-action-button'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'

export const Route = createFileRoute('/admin/quiz/$quizUuid')({
  head: () => ({
    meta: [
      {
        title: `Clara | Quiz Management`,
      },
    ],
  }),
  component: QuizQuestionPage,
})

function QuizQuestionPage() {
  const { quizUuid } = Route.useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Modal states
  const [isQuestionModalOpen, setIsQuestionModalOpen] = React.useState(false)
  const [selectedQuestion, setSelectedQuestion] = React.useState<
    QuizQuestion | undefined
  >()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  // 1. Fetching logic using TanStack Query
  const { data: quizResponse, isLoading: isQuizLoading } = useQuery({
    queryKey: ['admin-quiz', quizUuid],
    queryFn: () => adminQuizService.getOne(quizUuid),
  })

  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['admin-quiz-questions', quizUuid],
    queryFn: () => adminQuizService.getQuestions(quizUuid),
  })

  // 2. Mutation for deletion
  const deleteMutation = useMutation({
    mutationFn: (questionUuid: string) =>
      adminQuizService.destroyQuestion(quizUuid, questionUuid),
    onSuccess: () => {
      toast.success(t('common.deleteSuccess', 'Question deleted successfully'))
      queryClient.invalidateQueries({
        queryKey: ['admin-quiz-questions', quizUuid],
      })
      setIsDeleteDialogOpen(false)
    },
    onError: () => {
      toast.error('Failed to delete question')
    },
  })

  const handleAddQuestion = () => {
    setSelectedQuestion(undefined)
    setIsQuestionModalOpen(true)
  }

  const handleEditQuestion = (question: QuizQuestion) => {
    setSelectedQuestion(question)
    setIsQuestionModalOpen(true)
  }

  const handleDeleteClick = (question: QuizQuestion) => {
    setSelectedQuestion(question)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedQuestion) return
    deleteMutation.mutate(selectedQuestion.uuid)
  }

  const isLoading = isQuizLoading || isQuestionsLoading
  const quiz = quizResponse as Quiz

  if (isLoading) {
    return (
      <AdminPage>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </AdminPage>
    )
  }

  if (!quiz) {
    return (
      <AdminPage>
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <div className="p-4 rounded-full bg-slate-100 text-slate-400">
          <AlertCircle className="size-12" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Quiz Not Found</h3>
          <p className="text-muted-foreground">
            The quiz you are looking for does not exist or has been removed.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/admin/quiz">Go Back to Quizzes</Link>
        </Button>
        </div>
      </AdminPage>
    )
  }

  return (
    <AdminPage>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl shrink-0 group"
          >
            <Link to="/admin/quiz">
              <ChevronLeft className="size-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <HelpCircle className="size-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {t('quiz.management', 'Quiz Management')}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{quiz.title}</h2>
            <p className="text-slate-500 max-w-2xl">{quiz.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AddActionButton
            label={t('quiz.addQuestion', 'Add New Question')}
            onClick={handleAddQuestion}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LayoutList className="size-5 text-primary" />
            <h4 className="font-bold text-slate-700">
              {t('quiz.questionsCount', `Questions (${questions.length})`, {
                count: questions.length,
              })}
            </h4>
          </div>
        </div>

        <QuestionList
          questions={questions}
          onEdit={handleEditQuestion}
          onDelete={(uuid) => handleDeleteClick(questions.find((q) => q.uuid === uuid)!)}
        />
      </div>

      <QuestionForm
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        quizUuid={quizUuid}
        question={selectedQuestion || null}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['admin-quiz-questions', quizUuid],
          })
          setIsQuestionModalOpen(false)
        }}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.areYouSure', 'Are you absolutely sure?')}
        description={`${t('common.deleteConfirmation', 'This action cannot be undone. This will permanently delete this question and all its options.')}`}
        confirmText={t('common.delete')}
        onConfirm={confirmDelete}
      />
    </AdminPage>
  )
}
