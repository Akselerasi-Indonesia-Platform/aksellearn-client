import * as React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGuideLang } from '@/hooks/use-guide-lang'

export function GuideFeedback({ className }: { className?: string }) {
  const [lang] = useGuideLang()
  const [feedback, setFeedback] = React.useState<'up' | 'down' | null>(null)

  return (
    <div className={cn('mt-12 py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      <p className="text-sm font-medium text-muted-foreground">
        {lang === 'id' ? 'Apakah panduan ini membantu Anda?' : 'Was this guide helpful?'}
      </p>
      {feedback ? (
        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {lang === 'id' ? 'Terima kasih atas masukannya!' : 'Thank you for your feedback!'}
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedback('up')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted text-sm font-medium transition-colors"
          >
            <ThumbsUp className="size-4" />
            {lang === 'id' ? 'Ya' : 'Yes'}
          </button>
          <button
            onClick={() => setFeedback('down')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted text-sm font-medium transition-colors"
          >
            <ThumbsDown className="size-4" />
            {lang === 'id' ? 'Tidak' : 'No'}
          </button>
        </div>
      )}
    </div>
  )
}
