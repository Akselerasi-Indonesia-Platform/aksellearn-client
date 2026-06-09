import { Languages } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function PublicLanguageToggle() {
  const { i18n } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesia' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full p-0 ring-2 ring-primary/10 hover:ring-primary/30 transition-all text-white hover:bg-white/10 hover:text-white"
          aria-label="Toggle language"
        >
          <Languages className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 mt-2 rounded-2xl p-2 shadow-2xl">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={
              mounted && i18n.language === lang.code
                ? 'bg-accent font-bold my-1 rounded-xl px-3 py-2.5 cursor-pointer'
                : 'my-1 rounded-xl px-3 py-2.5 cursor-pointer font-medium text-slate-600'
            }
            onClick={() => i18n.changeLanguage(lang.code)}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
