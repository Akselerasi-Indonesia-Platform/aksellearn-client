import * as React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGuideLang } from '@/hooks/use-guide-lang'

export function GuideFeedback({ className }: { className?: string }) {
  const [lang] = useGuideLang()
  const [feedback, setFeedback] = React.useState<'up' | 'down' | null>(null)

  // Hidden for now since there is no backend implementation
  return null
}
