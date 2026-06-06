import { useState } from 'react'
import { Star, Loader2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CourseReviewTabProps {
  existingReview: any
  postReviewMutation: any
}

export function CourseReviewTab({
  existingReview,
  postReviewMutation,
}: CourseReviewTabProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [isEditing, setIsEditing] = useState(!existingReview)

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    setIsConfirmOpen(true)
  }

  const handleConfirmSubmit = () => {
    setIsConfirmOpen(false)
    postReviewMutation.mutate(
      { rating, comment },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
      }
    )
  }

  const ratingLabels: Record<number, string> = {
    1: 'Needs Improvement',
    2: 'Below Average',
    3: 'Average',
    4: 'Very Good',
    5: 'Excellent',
  }

  if (existingReview && !isEditing) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center max-w-2xl mx-auto space-y-6">
        <div className="size-20 bg-[#70C942]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#70C942]">
          <Star className="size-10 fill-current" />
        </div>
        <div>
          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">
            Thank you for your feedback!
          </h4>
          <p className="text-slate-500 font-medium mt-2">
            Your review helps other students discover this curriculum.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8 text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#70C942]" />
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-5 ${
                  star <= existingReview.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          {existingReview.comment && (
            <p className="text-slate-700 font-medium leading-relaxed">
              "{existingReview.comment}"
            </p>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="mt-6 font-bold text-[#056FAE] border-[#056FAE]/20 hover:bg-[#056FAE]/5 uppercase tracking-widest text-xs"
        >
          <Edit className="size-4 mr-2" />
          Edit Review
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">
          Rate your experience
        </h4>
        <p className="text-slate-500 font-medium mt-2">
          How would you rate this curriculum?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-2 hover:scale-110 transition-transform active:scale-95 focus:outline-none"
              >
                <Star
                  className={`size-12 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                      : 'text-slate-200 stroke-[1.5px]'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="h-6">
            <p className="text-sm font-bold text-amber-500 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-1">
              {(hoveredRating || rating) > 0 ? ratingLabels[hoveredRating || rating] : ''}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex justify-between">
            <span>Written Review (Optional)</span>
            <span className="text-slate-400 font-normal normal-case tracking-normal">
              {comment.length}/500
            </span>
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="What did you like? What could be improved? Share your thoughts..."
            className="min-h-[140px] resize-none bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-base"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          {existingReview && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditing(false)
                setRating(existingReview.rating)
                setComment(existingReview.comment)
              }}
              className="font-bold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={rating === 0 || postReviewMutation.isPending}
            className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            {postReviewMutation.isPending && (
              <Loader2 className="size-4 animate-spin mr-2" />
            )}
            Submit Review
          </Button>
        </div>
      </form>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this review? It cannot be edited after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
