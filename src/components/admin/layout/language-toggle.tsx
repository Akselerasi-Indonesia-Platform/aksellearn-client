import { Globe } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageToggle() {
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
        <Button className="h-9 w-9" size="icon" variant="ghost">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={
              mounted && i18n.language === lang.code
                ? 'bg-accent font-medium my-1 mb-1'
                : 'my-1 mb-1'
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
