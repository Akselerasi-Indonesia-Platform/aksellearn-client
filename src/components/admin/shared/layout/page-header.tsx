import * as React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <div className="space-y-0.5">
        {/* Title Atom */}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

        {/* Description Atom */}
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Actions Molecule */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0 animate-in fade-in slide-in-from-right-2 duration-500">
          {actions}
        </div>
      )}
    </div>
  )
}
