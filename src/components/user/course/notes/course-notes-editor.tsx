import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userNoteService } from '@/services/user/note.service'
import { RichEditor } from '@/components/ui/rich-editor'
import { Loader2, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CourseNotesEditorProps {
  courseUuid: string
  moduleUuid?: string | null
  noteUuid?: string | null
  initialContent?: string
  initialTimestamp?: number | null
  className?: string
  onSave?: () => void
  onCancel?: () => void
}

export function CourseNotesEditor({
  courseUuid,
  moduleUuid,
  noteUuid,
  initialContent = '',
  initialTimestamp = null,
  className,
  onSave,
  onCancel,
}: CourseNotesEditorProps) {
  const [content, setContent] = React.useState(initialContent)
  const [currentNoteUuid, setCurrentNoteUuid] = React.useState(noteUuid)
  const queryClient = useQueryClient()

  React.useEffect(() => {
    setCurrentNoteUuid(noteUuid)
  }, [noteUuid])

  const saveMutation = useMutation({
    mutationFn: (newContent: string) => {
      const isUpdate = !!currentNoteUuid

      if (isUpdate) {
        return userNoteService.update(currentNoteUuid as string, {
          content: newContent,
        })
      } else {
        const payload: any = {
          course_uuid: courseUuid,
          module_uuid: moduleUuid,
          content: newContent,
        }
        
        if (initialTimestamp !== null && initialTimestamp !== undefined) {
          const floored = Math.floor(initialTimestamp)
          if (floored > 0) {
            payload.video_timestamp = floored
          }
        }
        
        return userNoteService.create(payload)
      }
    },
    onSuccess: (data: any) => {
      if (data?.uuid) {
        setCurrentNoteUuid(data.uuid)
      }
      queryClient.invalidateQueries({ queryKey: ['user', 'notes', courseUuid] })
      onSave?.()
    },
    onError: (error: any) => {
      import('sonner').then(({ toast }) => {
        if (error?.response?.status === 403) {
          toast.error("Time limit exceeded", {
            description: "Notes can only be edited within 5 minutes of posting.",
          })
        } else if (error?.response?.status === 422) {
          const errors = error.response.data?.errors
          const firstError = Object.values(errors)?.[0] as string[]
          toast.error("Validation failed", {
            description: firstError?.[0] || 'Please check your input.',
          })
        } else {
          toast.error("Failed to save note")
        }
      })
    }
  })

  const handleSave = () => {
    if (!content.trim() || content === '<p></p>') {
      import('sonner').then(({ toast }) => {
        toast.error("Validation failed", {
          description: "Note cannot be empty",
        })
      })
      return
    }
    saveMutation.mutate(content)
  }

  return (
    <div className={cn('space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm', className)}>
      <div className="flex items-center gap-2 px-1 mb-2">
        <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          <StickyNote className="size-4" />
        </div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
          {currentNoteUuid ? 'Edit Note' : 'New Note'}
        </h4>
        {initialTimestamp !== null && initialTimestamp > 0 && !currentNoteUuid && (
          <span className="ml-auto bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest">
            {Math.floor(initialTimestamp / 60).toString().padStart(2, '0')}:
            {Math.floor(initialTimestamp % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="relative">
        <RichEditor
          value={content}
          onChange={setContent}
          placeholder="Jot down your key takeaways, formulas, or reminders here..."
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={saveMutation.isPending}
            className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || !content.trim() || content === '<p></p>'}
          className="h-9 px-6 bg-primary text-white hover:bg-primary/90 text-xs font-bold uppercase tracking-wider"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-2" /> Saving...
            </>
          ) : (
            'Save Note'
          )}
        </Button>
      </div>
    </div>
  )
}
