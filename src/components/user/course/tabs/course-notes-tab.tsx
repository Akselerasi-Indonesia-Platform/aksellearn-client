import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CourseNotesEditor } from '@/components/user/course/notes/course-notes-editor'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/public/ui/empty-state'
import { StickyNote, Play, Edit, Trash2, Plus } from 'lucide-react'
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns'
import { HtmlContent } from '@/components/ui/html-content'
import { userNoteService } from '@/services/user/note.service'

interface CourseNotesTabProps {
  courseUuid: string
  activeModuleUuid: string | null
  playerController: any
  course: any
  queryClient: any
}

const safeDate = (dateStr: string | undefined) => {
  if (!dateStr) return new Date()
  let s = dateStr
  if (s.includes(' ') && !s.includes('T')) {
    s = s.replace(' ', 'T') + 'Z'
  } else if (!s.endsWith('Z') && !s.includes('+') && s.includes('T')) {
    s += 'Z'
  }
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date() : d
}

export function CourseNotesTab({
  courseUuid,
  activeModuleUuid,
  playerController,
  course,
}: CourseNotesTabProps) {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingNoteUuid, setEditingNoteUuid] = React.useState<string | null>(null)
  const [initialTimestamp, setInitialTimestamp] = React.useState<number | null>(null)

  // Fetch notes for the active module
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['user', 'notes', courseUuid, activeModuleUuid],
    queryFn: () => userNoteService.getAll(courseUuid, activeModuleUuid || undefined),
    enabled: !!courseUuid,
  })

  const deleteNoteMutation = useMutation({
    mutationFn: userNoteService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notes', courseUuid] })
      import('sonner').then(({ toast }) => toast.success('Note deleted'))
    },
    onError: () => {
      import('sonner').then(({ toast }) => toast.error('Failed to delete note'))
    }
  })

  const handleAddNote = () => {
    if (playerController) {
      playerController.pause()
      const time = playerController.getCurrentTime()
      setInitialTimestamp(time > 0 ? time : null)
    } else {
      setInitialTimestamp(null)
    }
    setIsCreating(true)
    setEditingNoteUuid(null)
  }

  const handleEditNote = (note: any) => {
    setEditingNoteUuid(note.uuid)
    setIsCreating(false)
  }

  const handleDeleteNote = (uuid: string) => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteNoteMutation.mutate(uuid)
    }
  }

  const handleSaveDone = () => {
    setIsCreating(false)
    setEditingNoteUuid(null)
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingNoteUuid(null)
  }

  return (
    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
      <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
        <div>
          <h4 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <StickyNote className="size-5 text-primary" />
            Notes
          </h4>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Capture your ideas and sync them to timestamps.
          </p>
        </div>
        {!isCreating && !editingNoteUuid && (
          <Button 
            onClick={handleAddNote}
            className="h-9 px-4 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="size-4 mr-2" />
            Add Note
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {isCreating && (
          <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
            <CourseNotesEditor
              courseUuid={courseUuid}
              moduleUuid={activeModuleUuid}
              initialTimestamp={initialTimestamp}
              onSave={handleSaveDone}
              onCancel={handleCancel}
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 h-32 animate-pulse" />
            ))}
          </div>
        ) : notes.length === 0 && !isCreating ? (
          <EmptyState
            icon={StickyNote}
            title="No notes yet"
            description="Click + Add Note to capture your first idea."
            variant="light"
          />
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              if (editingNoteUuid === note.uuid) {
                return (
                  <div key={note.uuid} className="animate-in fade-in duration-300">
                    <CourseNotesEditor
                      courseUuid={courseUuid}
                      moduleUuid={activeModuleUuid}
                      noteUuid={note.uuid}
                      initialContent={note.content}
                      onSave={handleSaveDone}
                      onCancel={handleCancel}
                    />
                  </div>
                )
              }

              const updatedAt = safeDate(note.updated_at || note.created_at)
              const createdAt = safeDate(note.created_at)
              const now = new Date()
              const canEdit = differenceInMinutes(now, createdAt) <= 5

              return (
                <div
                  key={note.uuid}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-colors group relative flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {note.video_timestamp !== null && note.video_timestamp !== undefined && note.video_timestamp > 0 ? (
                        <button
                          onClick={() => playerController?.seek(note.video_timestamp!)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-[10px] font-bold hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                        >
                          <Play className="size-3" />
                          {Math.floor(note.video_timestamp / 60).toString().padStart(2, '0')}:
                          {Math.floor(note.video_timestamp % 60).toString().padStart(2, '0')}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-widest">
                          <StickyNote className="size-3" /> Note
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400">
                        {format(updatedAt, 'PPp')}
                      </span>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditNote(note)}
                          className="size-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNote(note.uuid)}
                        className="size-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-700 font-medium leading-relaxed">
                    <HtmlContent html={note.content} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
