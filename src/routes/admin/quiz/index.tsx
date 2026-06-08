import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

import { QuizTable } from '@/components/admin/quiz/quiz-table'
import { QuizModal } from '@/components/admin/quiz/quiz-modal'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { PageHeader } from '@/components/admin/shared/layout'
import { DataHeader } from '@/components/admin/shared/data'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { AddActionButton } from '@/components/admin/shared/button/add-action-button'
import { adminQuizService } from '@/services/admin/quiz.service'
import { Quiz } from '@/types/course'
import { useAuthStore } from '@/hooks/use-auth'

export const Route = createFileRoute('/admin/quiz/')({
  head: () => ({
    meta: [
      {
        title: 'Aksellearn | Quizzes',
      },
    ],
  }),
  component: QuizIndexPage,
})

function QuizIndexPage() {
  const { t } = useTranslation()
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([])

  const { user: authUser } = useAuthStore()
  const isInstructorOnly = React.useMemo(() => {
    if (!authUser) return false
    const roleNames = authUser.roles?.map((role: any) => typeof role === 'string' ? role : role.name) || []
    return (roleNames.includes('Teacher') || roleNames.includes('Instructor')) && 
           !roleNames.includes('Super Admin') && 
           !roleNames.includes('Admin')
  }, [authUser])

  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedQuiz, setSelectedQuiz] = React.useState<Quiz | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const fetchQuizzes = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await adminQuizService.getAll()
      setQuizzes(data)
    } catch (error) {
      toast.error(t('quiz.fetchFailed', 'Failed to fetch quizzes'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  React.useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreate = () => {
    setSelectedQuiz(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setIsModalOpen(true)
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedQuiz) return
    try {
      await adminQuizService.destroy(selectedQuiz.uuid)
      toast.success(t('common.deleteSuccess', 'Quiz deleted successfully'))
      setIsDeleteDialogOpen(false)
      setIsModalOpen(false)
      fetchQuizzes()
    } catch (error) {
      toast.error('Failed to delete quiz')
    }
  }

  const clearFilters = () => setSearchQuery('')

  const actions = (
    <AddActionButton
      label={t('quiz.addQuiz', 'Create New Quiz')}
      onClick={handleCreate}
    />
  )

  return (
    <AdminPage>
      <PageHeader
        title={isInstructorOnly ? t('quiz.myTitle', 'My Quizzes') : t('quiz.title', 'All Quizzes')}
        description={t('quiz.description', 'Create and manage assessments for your courses.')}
        actions={actions}
      />

      <DataHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
        activeFiltersCount={0}
        resultsCount={filteredQuizzes.length}
        resultsLabel="quizzes found"
      />

      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        {isLoading ? (
          <div className="flex items-center justify-center p-20 bg-card rounded-xl border border-border">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          </div>
        ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <QuizTable
                quizzes={filteredQuizzes}
                onEdit={handleEdit}
                isLoading={isLoading}
              />
            </motion.div>
        )}
      </div>

      <QuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quiz={selectedQuiz}
        onSuccess={fetchQuizzes}
        onDelete={handleDeleteClick}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('common.areYouSure', 'Are you absolutely sure?')}
        description={`${t('common.deleteConfirmation', 'This action cannot be undone. This will permanently delete')} ${selectedQuiz?.title}.`}
        confirmText={t('common.delete')}
        onConfirm={confirmDelete}
      />
    </AdminPage>
  )
}
