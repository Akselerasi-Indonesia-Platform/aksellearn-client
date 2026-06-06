import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Course, CourseReview } from '@/types/course'
import { Badge } from '@/components/ui/badge'
import { Eye, Users, Star, MessageSquare, Trash2, EyeOff } from 'lucide-react'
import { adminCourseReviewService } from '@/services/admin/course-review.service'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'

interface CourseInsightsDrawerProps {
  course?: Course
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CourseInsightsDrawer({
  course,
  open,
  onOpenChange,
}: CourseInsightsDrawerProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Fetch reviews for this course
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['admin', 'course', 'reviews', course?.id],
    queryFn: () =>
      adminCourseReviewService.getAll({ course_uuid: course!.id, limit: 5 }),
    enabled: !!course?.id && open,
  })

  const reviews = reviewsData?.data || []

  // Toggle Status Mutation
  const toggleMutation = useMutation({
    mutationFn: (uuid: string) => adminCourseReviewService.toggleStatus(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'course', 'reviews', course?.id],
      })
      toast.success('Review status updated')
    },
    onError: () => toast.error('Failed to update review status'),
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => adminCourseReviewService.delete(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'course', 'reviews', course?.id],
      })
      toast.success('Review deleted')
    },
    onError: () => toast.error('Failed to delete review'),
  })

  if (!course) return null

  const totalViews = (course as any).total_views || 0
  const totalEnrolled = course.summary?.stats?.total_students || 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md admin-theme p-0 border-l border-slate-100">
        <div className="p-8 space-y-10 h-full flex flex-col justify-center">
          <SheetHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black uppercase text-[10px] tracking-widest px-4 py-1 rounded-full"
              >
                {t('courses.courseSnapshot')}
              </Badge>
            </div>
            <SheetTitle className="text-3xl font-black text-slate-900 leading-tight">
              {course.title}
            </SheetTitle>
            <SheetDescription className="text-slate-500 font-medium text-sm">
              {t('courses.descriptionPlaceholder')}
            </SheetDescription>
          </SheetHeader>

          {/* Core Metrics Stack */}
          <div className="space-y-4">
            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center justify-between group hover:bg-slate-100 transition-all duration-500">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t('courses.totalViews')}
                </span>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">
                  {totalViews.toLocaleString()}
                </div>
              </div>
              <div className="size-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors">
                <Eye className="size-6" />
              </div>
            </div>

            <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex items-center justify-between group hover:bg-indigo-100 transition-all duration-500">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  {t('courses.activeEnrollments')}
                </span>
                <div className="text-4xl font-black text-indigo-900 tracking-tighter">
                  {totalEnrolled.toLocaleString()}
                </div>
              </div>
              <div className="size-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-400 group-hover:text-indigo-600 transition-colors">
                <Users className="size-6" />
              </div>
            </div>
          </div>

          {/* HIDING FOR NOW */}
          {false && (
            <div className="pt-2">
              <Button
                className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-12 font-bold gap-2"
                onClick={() => {
                  onOpenChange(false)
                  if (course?.id) {
                    navigate({ to: `/admin/course/gradebook/${course.id}` as any })
                  }
                }}
              >
                <Users className="size-4" />
                Open Full Gradebook
              </Button>
            </div>
          )}

          {/* Student Feedback Section - HIDING FOR NOW */}
          {false && (
            <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="size-4 text-slate-400" />
                {t('courses.latestFeedback')}
              </h3>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-500 font-bold"
              >
                {reviews.length} {t('common.active')}
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {isReviewsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-slate-50 rounded-3xl animate-pulse"
                  />
                ))
              ) : reviews.length === 0 ? (
                <div className="h-40 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-slate-300 gap-2">
                  <Star className="size-8 opacity-20" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {t('courses.noReviews')}
                  </span>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.uuid}
                    className={`p-6 rounded-[32px] border transition-all duration-300 group ${!review.is_active ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                          {review.created_at
                            ? format(
                                new Date(review.created_at),
                                'MMM dd'
                              )
                            : '-'}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-full hover:bg-slate-100"
                          onClick={() => toggleMutation.mutate(review.uuid)}
                          title={
                            !review.is_active
                              ? t('common.show')
                              : t('common.hide')
                          }
                        >
                          {!review.is_active ? (
                            <Eye className="size-3.5" />
                          ) : (
                            <EyeOff className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-full hover:bg-destructive/10 text-destructive"
                          onClick={() => deleteMutation.mutate(review.uuid)}
                          title={t('common.delete')}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed">
                      "{review.comment}"
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="size-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                        {review.user?.name?.charAt(0)}
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                        {review.user?.name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          )}

          <div className="text-center pt-4 shrink-0">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              Real-time Data Active
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
