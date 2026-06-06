import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userCourseService } from '@/services/user/course.service'
import { userCartService } from '@/services/user/cart.service'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

export function useCourseMutations(courseUuid: string, urlCourseId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const postCommentMutation = useMutation({
    mutationFn: (data: { content: string; videoTimestamp?: number; parentUuid?: string }) =>
      userCourseService.postComment(courseUuid, data.content, data.videoTimestamp, data.parentUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', 'course', courseUuid, 'comments'],
      })
      toast.success('Discussion message posted')
    },
    onError: () => {
      toast.error('Failed to post comment')
    },
  })

  const postReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      userCourseService.postReview(courseUuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', 'course', 'learn', urlCourseId],
      })
      toast.success('Review submitted', {
        description: 'Thank you for your valuable feedback!',
      })
    },
    onError: () => {
      toast.error('Failed to submit review')
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentUuid: string) =>
      userCourseService.deleteComment(courseUuid, commentUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', 'course', courseUuid, 'comments'],
      })
      toast.success('Comment removed')
    },
    onError: () => {
      toast.error('Failed to remove comment')
    },
  })

  const updateCommentMutation = useMutation({
    mutationFn: (data: { commentUuid: string; content: string }) =>
      userCourseService.updateComment(courseUuid, data.commentUuid, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'course', courseUuid, 'comments'] })
      toast.success('Comment updated successfully')
    },
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        toast.error('Time limit exceeded', {
          description: 'You can only edit a comment within 5 minutes of posting.',
        })
      } else {
        toast.error('Failed to update comment')
      }
    },
  })

  const toggleCommentLikeMutation = useMutation({
    mutationFn: (commentUuid: string) =>
      userCourseService.toggleCommentLike(courseUuid, commentUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'course', courseUuid, 'comments'] })
    },
  })

  const extendMutation = useMutation({
    mutationFn: () =>
      userCartService.addItem({ id: courseUuid, type: 'course' }),
    onSuccess: () => {
      toast.success('Course added to cart', {
        description: 'Redirecting to secure checkout...',
      })
      navigate({ to: '/checkout' })
    },
    onError: () => {
      toast.error('Failed to initiate extension', {
        description: 'Please try again or contact support.',
      })
    },
  })

  return {
    postCommentMutation,
    postReviewMutation,
    deleteCommentMutation,
    updateCommentMutation,
    toggleCommentLikeMutation,
    extendMutation,
  }
}
