import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Toaster as Sonner } from 'sonner'
import * as React from 'react'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:items-start',
          description:
            'group-[.toast]:text-slate-500 group-[.toast]:text-xs group-[.toast]:mt-1 font-medium',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-bold rounded-lg',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 font-bold rounded-lg',
          success:
            'group-[.toaster]:border-emerald-100 group-[.toaster]:bg-emerald-50/50 group-[.toaster]:text-emerald-900 [&_svg]:text-emerald-500',
          error:
            'group-[.toaster]:border-rose-100 group-[.toaster]:bg-rose-50/50 group-[.toaster]:text-rose-900 [&_svg]:text-rose-500',
          warning:
            'group-[.toaster]:border-amber-100 group-[.toaster]:bg-amber-50/50 group-[.toaster]:text-amber-900 [&_svg]:text-amber-500',
          info: 'group-[.toaster]:border-sky-100 group-[.toaster]:bg-sky-50/50 group-[.toaster]:text-sky-900 [&_svg]:text-sky-500',
        },
      }}
      icons={{
        success: <CheckCircle2 className="size-5" />,
        error: <AlertCircle className="size-5" />,
        info: <Info className="size-5" />,
        warning: <AlertTriangle className="size-5" />,
      }}
      closeButton={true}
      {...props}
    />
  )
}

export { Toaster }
