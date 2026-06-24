import * as React from 'react'
import { useGuideLang } from '@/hooks/use-guide-lang'
import { cn } from '@/lib/utils'

export function GuideLanguageToggle({ className }: { className?: string }) {
  const [lang, setLang] = useGuideLang()

  return (
    <div className={cn('flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1', className)}>
      <button
        onClick={() => setLang('id')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all',
          lang === 'id'
            ? 'bg-white text-foreground shadow-sm dark:bg-zinc-800'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        🇮🇩 Indonesia
      </button>
      <button
        onClick={() => setLang('en')}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all',
          lang === 'en'
            ? 'bg-white text-foreground shadow-sm dark:bg-zinc-800'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        🇬🇧 English
      </button>
    </div>
  )
}
