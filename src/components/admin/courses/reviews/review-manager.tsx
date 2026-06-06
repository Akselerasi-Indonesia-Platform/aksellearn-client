'use client'

import { Eye, EyeOff, Star, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { adminCourseReviewService } from '@/services/admin/course-review.service'
import { CourseReview } from '@/types/course'

interface ReviewManagerProps {
  courseUuid: string
}

export function ReviewManager({ courseUuid }: ReviewManagerProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const res = await adminCourseReviewService.getAll({
        course_uuid: courseUuid,
      })
      setReviews(res.data)
    } catch {
      toast.error('Failed to fetch reviews')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (courseUuid) {
      fetchReviews()
    }
  }, [courseUuid])

  const toggleStatus = async (reviewUuid: string) => {
    try {
      await adminCourseReviewService.toggleStatus(reviewUuid)
      toast.success(t('common.updateSuccess', 'Status updated successfully'))
      fetchReviews()
      // Invalidate the course cache to refresh the average_rating and total_reviews
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'course', courseUuid] })
    } catch {
      toast.error('Update failed')
    }
  }

  const deleteReview = async (reviewUuid: string) => {
    try {
      await adminCourseReviewService.delete(reviewUuid)
      toast.success(t('common.deleteSuccess', 'Review deleted successfully'))
      fetchReviews()
    } catch {
      toast.error('Delete failed')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-primary fill-primary" />
        <h3 className="text-lg font-semibold">
          {t('courses.reviews', 'Course Reviews')}
        </h3>
      </div>

      <div className="rounded-xl border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b bg-muted/30">
              <TableHead className="font-bold py-4">
                {t('common.user', 'User')}
              </TableHead>
              <TableHead className="font-bold py-4">
                {t('common.rating', 'Rating')}
              </TableHead>
              <TableHead className="font-bold py-4">
                {t('common.comment', 'Comment')}
              </TableHead>
              <TableHead className="font-bold py-4">
                {t('common.status')}
              </TableHead>
              <TableHead className="font-bold py-4">
                {t('common.createdAt')}
              </TableHead>
              <TableHead className="w-[100px] py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={6}>
                  {t('common.noResults', 'No reviews found.')}
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => {
                return (
                  <TableRow
                    key={review.uuid}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={(review.user as any)?.avatar_url || (review.user as any)?.profile?.avatar_url} />
                          <AvatarFallback>
                            {review.user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {review.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <p
                        className={`text-sm ${!review.is_active ? 'italic text-muted-foreground line-through' : ''}`}
                      >
                        {review.comment}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="rounded-full px-2"
                        variant={
                          review.is_active ? 'default' : 'secondary'
                        }
                      >
                        {review.is_active
                          ? t('common.visible', 'Visible')
                          : t('common.hidden', 'Hidden')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all shadow-none"
                          size="icon"
                          title={
                            review.is_active
                              ? t('common.hide', 'Hide')
                              : t('common.show', 'Show')
                          }
                          type="button"
                          variant="ghost"
                          onClick={() => toggleStatus(review.uuid)}
                        >
                          {review.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shadow-none"
                          size="icon"
                          title={t('common.delete')}
                          type="button"
                          variant="ghost"
                          onClick={() => deleteReview(review.uuid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
