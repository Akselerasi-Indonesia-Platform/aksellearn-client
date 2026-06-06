import { MoreHorizontal, Pencil, ListChecks } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, Column } from '@/components/admin/shared/data'
import { Quiz } from '@/types/course'
import { Badge } from '@/components/ui/badge'

interface QuizTableProps {
  quizzes: Quiz[]
  onEdit: (quiz: Quiz) => void
  isLoading?: boolean
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSortChange?: (key: string, dir: 'asc' | 'desc') => void
  visibleColumns?: string[]
}

export function QuizTable({
  quizzes,
  onEdit,
  isLoading,
  pageSize = 10,
  sortBy,
  sortDir,
  onSortChange,
  visibleColumns,
}: QuizTableProps) {
  const { t } = useTranslation()

  const columns: Column<Quiz>[] = [
    {
      header: t('quiz.title', 'Title'),
      sortable: true,
      sortKey: 'title',
      cell: (quiz: Quiz) => (
        <div className="flex flex-col">
          <span className="font-medium">{quiz.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {quiz.description}
          </span>
        </div>
      ),
    },
    {
      header: t('quiz.passingPercentage', 'Passing %'),
      sortable: true,
      sortKey: 'passing_percentage',
      cell: (quiz: Quiz) => (
        <Badge variant="secondary">{quiz.passing_percentage}%</Badge>
      ),
    },
    {
      header: t('quiz.timeLimit', 'Time Limit'),
      sortable: true,
      sortKey: 'time_limit_minutes',
      cell: (quiz: Quiz) =>
        quiz.time_limit_minutes ? (
          <span className="text-sm">
            {quiz.time_limit_minutes} {t('common.minutes', 'minutes')}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            {t('common.unlimited', 'Unlimited')}
          </span>
        ),
    },
    {
      header: t('common.actions', 'Actions'),
      headerClassName: 'text-center',
      cell: (quiz: Quiz) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" title="More Actions">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="admin-theme">
              <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  to={`/admin/quiz/${quiz.uuid}` as any}
                  className="cursor-pointer"
                >
                  <ListChecks className="mr-2 h-4 w-4" />
                  {t('quiz.manageQuestions', 'Manage Questions')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(quiz)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t('common.edit')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ].filter((col) => !visibleColumns || visibleColumns.includes(col.header))

  return (
    <DataTable
      data={quizzes}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage={t('common.noResults', 'No results.')}
      sortBy={sortBy}
      sortDir={sortDir}
      onSortChange={onSortChange}
    />
  )
}
