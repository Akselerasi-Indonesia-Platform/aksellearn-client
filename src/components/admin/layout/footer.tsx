import * as React from 'react'
import { useState, useEffect } from 'react'
import { APP_CONFIG } from '@/config/app'
import { usePlatformStore } from '@/hooks/use-platform'

export function AdminFooter() {
  const currentYear = new Date().getFullYear()
  const { profile } = usePlatformStore()
  
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const name = (isMounted && profile?.name) || APP_CONFIG.name

  return (
    <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex h-14 items-center justify-between px-6">
        <p className="text-sm text-muted-foreground transition-all hover:text-foreground/80">
          &copy; {currentYear}{' '}
          <span className="font-semibold text-foreground">{name}</span>.
          Powered by{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.akselerasiindonesia.com"
            className="font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
          >
            Akselerasi Indonesia
          </a>
        </p>
      </div>
    </footer>
  )
}
