import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, FileUp, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  FormInput,
  FormTextarea,
} from '@/components/admin/shared/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminAssignmentService, Assignment } from '@/services/admin/assignment.service'
import { adminMediaService } from '@/services/admin/media.service'
import { AssignmentSubmissions } from './assignment-submissions'

const assignmentSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  max_score: z.coerce.number().min(1, 'Max score must be greater than 0'),
  passing_score: z.coerce.number().min(0, 'Passing score must be at least 0'),
  attachment_uuid: z.string().optional().nullable(),
})

type AssignmentFormValues = z.infer<typeof assignmentSchema>

interface AssignmentEditorProps {
  courseUuid: string
  moduleUuid: string
  initialData?: any // Assignment
  onSaved?: (assignment: Assignment) => void
}

export function AssignmentEditor({
  courseUuid,
  moduleUuid,
  initialData,
  onSaved,
}: AssignmentEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      max_score: initialData?.max_score || 100,
      passing_score: initialData?.passing_score || 70,
      attachment_uuid: initialData?.attachment_uuid || '',
    },
  })

  // Setup form when initial data arrives
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        description: initialData.description || '',
        max_score: initialData.max_score || 100,
        passing_score: initialData.passing_score || 70,
        attachment_uuid: initialData.attachment_uuid || '',
      })
    }
  }, [initialData, form])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const media = await adminMediaService.upload(file, 'course')
      form.setValue('attachment_uuid', media.uuid, { shouldDirty: true, shouldValidate: true })
      toast.success('File uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (values: AssignmentFormValues) => {
    setIsSaving(true)
    try {
      let assignment: Assignment
      if (initialData?.uuid) {
        assignment = await adminAssignmentService.update(
          courseUuid,
          moduleUuid,
          initialData.uuid,
          values
        )
      } else {
        assignment = await adminAssignmentService.create(courseUuid, moduleUuid, values)
      }
      toast.success('Assignment settings saved')
      if (onSaved) onSaved(assignment)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save assignment')
    } finally {
      setIsSaving(false)
    }
  }

  const EditorForm = (
    <Form {...form}>
      <div className="space-y-6">
          <FormInput
            control={form.control as any}
            name="title"
            label="Assignment Title"
            placeholder="E.g. Final Project Submission"
            required
          />

          <FormTextarea
            control={form.control as any}
            name="description"
            label="Instructions"
            placeholder="Provide clear instructions on what the student needs to submit..."
            required
            className="min-h-[120px]"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormInput
              control={form.control as any}
              name="max_score"
              label="Maximum Score"
              type="number"
              required
            />
            <FormInput
              control={form.control as any}
              name="passing_score"
              label="Passing Score Threshold"
              type="number"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Optional Attachment Template (PDF/ZIP)</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center gap-2 px-4 h-10 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-sm font-medium">
                {isUploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
                {isUploading ? 'Uploading...' : 'Upload File'}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              {form.watch('attachment_uuid') && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  File attached
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              onClick={form.handleSubmit(onSubmit as any)}
              disabled={isSaving || isUploading}
              className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Assignment Configuration
            </Button>
          </div>
        </div>
      </Form>
  )

  if (initialData?.uuid) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="bg-emerald-50 p-1 border border-emerald-100 rounded-xl mb-6 grid grid-cols-2 h-11 w-[400px]">
            <TabsTrigger value="config" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-700">
              Configuration
            </TabsTrigger>
            <TabsTrigger value="submissions" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-700">
              Submissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="outline-none">
            {EditorForm}
          </TabsContent>
          
          <TabsContent value="submissions" className="outline-none">
            <AssignmentSubmissions
              courseUuid={courseUuid}
              moduleUuid={moduleUuid}
              assignmentUuid={initialData.uuid}
            />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {EditorForm}
    </div>
  )
}
