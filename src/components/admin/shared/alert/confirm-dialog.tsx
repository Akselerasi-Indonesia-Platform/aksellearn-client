'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'

interface ConfirmDialogProps {
  trigger?: React.ReactNode
  title?: string
  description?: string
  cancelText?: string
  confirmText?: string
  variant?: 'default' | 'destructive'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void
  verifyText?: string
  error?: string | null
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  cancelText,
  confirmText,
  variant = 'destructive',
  open,
  onOpenChange,
  onConfirm,
  verifyText,
  error,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const [userInput, setUserInput] = React.useState('')

  React.useEffect(() => {
    if (!open) {
      setUserInput('')
    }
  }, [open])

  const isConfirmDisabled = verifyText ? userInput.trim() !== verifyText.trim() : false

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent
        className="shadow-2xl border-destructive/10 admin-theme"
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">
            {title || t('common.areYouSure', 'Are you absolutely sure?')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground/90">
            {description ||
              t(
                'common.deleteDescription',
                'This action cannot be undone. This will permanently remove the data from our servers.',
              )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {verifyText && (
          <div className="space-y-2 my-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              Type <span className="font-mono text-destructive select-all bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{verifyText}</span> to confirm
            </label>
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={verifyText}
              autoComplete="off"
            />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive font-medium border border-destructive/20 text-center animate-in slide-in-from-top-2 my-2">
            {error}
          </div>
        )}

        <AlertDialogFooter className="pt-4 mt-2 border-t">
          <AlertDialogCancel
            className="hover:bg-accent transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {cancelText || t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              'transition-all duration-200 active:scale-[0.98] font-semibold px-6',
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
              isConfirmDisabled && 'opacity-50 pointer-events-none cursor-not-allowed'
            )}
            disabled={isConfirmDisabled}
            onClick={(e) => {
              e.stopPropagation()
              onConfirm()
            }}
          >
            {confirmText ||
              (variant === 'destructive'
                ? t('common.delete')
                : t('common.confirm'))}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
