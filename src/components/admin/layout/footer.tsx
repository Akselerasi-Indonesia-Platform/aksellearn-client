import * as React from 'react'

export function AdminFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex h-14 items-center justify-between px-6">
        <p className="text-sm text-muted-foreground transition-all hover:text-foreground/80">
          Copyright &copy; {currentYear}{' '}
          <span className="font-semibold text-foreground">Madacoda</span>,
          powered by{' '}
          <a
            target="_blank"
            href="https://madacoda.dev"
            className="font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent opacity-90 hover:opacity-100 transition-opacity cursor-default"
          >
            madacoda.dev
          </a>
        </p>
      </div>
    </footer>
  )
}
