'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FileUp, Plus, Search, X, Loader2, Edit, Trash2, Paperclip, FileIcon, ImageIcon, Film, FileText, Download, Check } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Form } from '@/components/ui/form'
import { FormInput, FormTextarea, FormSelectStatus } from '@/components/admin/shared/form'
import { adminCourseAttachmentService, CourseAttachment } from '@/services/admin/course-attachment.service'
import { adminMediaService } from '@/services/admin/media.service'

interface AttachmentManagerProps {
  courseUuid: string
}

const attachmentSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  order_weight: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
  media_uuid: z.string().optional(),
})

type AttachmentFormValues = z.infer<typeof attachmentSchema>

export function AttachmentManager({ courseUuid }: AttachmentManagerProps) {
  const [attachments, setAttachments] = React.useState<CourseAttachment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingAttachment, setEditingAttachment] = React.useState<CourseAttachment | undefined>()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [uploadedMedia, setUploadedMedia] = React.useState<any>(null)

  const form = useForm<AttachmentFormValues>({
    resolver: zodResolver(attachmentSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      order_weight: 0,
      is_active: true,
      media_uuid: '',
    },
  }) as any

  const fetchAttachments = async () => {
    setIsLoading(true)
    try {
      const data = await adminCourseAttachmentService.getAll(courseUuid)
      setAttachments(data)
    } catch {
      toast.error('Failed to fetch attachments')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (courseUuid) {
      fetchAttachments()
    }
  }, [courseUuid])

  const handleOpenCreate = () => {
    setEditingAttachment(undefined)
    setUploadedMedia(null)
    form.reset({
      title: '',
      description: '',
      order_weight: 0,
      is_active: true,
      media_uuid: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (attachment: CourseAttachment) => {
    setEditingAttachment(attachment)
    setUploadedMedia(attachment.media || null)
    form.reset({
      title: attachment.title,
      description: attachment.description || '',
      order_weight: attachment.order_weight,
      is_active: attachment.is_active ?? true,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (attachment: CourseAttachment) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return
    try {
      await adminCourseAttachmentService.delete(attachment.uuid)
      toast.success('Attachment deleted')
      fetchAttachments()
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const media = await adminMediaService.upload(file, 'course')
      setUploadedMedia(media)
      form.setValue('media_uuid', media.uuid, { shouldDirty: true, shouldValidate: true })
      if (!form.getValues('title')) {
        form.setValue('title', file.name)
      }
      toast.success('File uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (values: AttachmentFormValues) => {
    setIsSaving(true)
    try {
      if (editingAttachment) {
        await adminCourseAttachmentService.update(editingAttachment.uuid, {
          title: values.title,
          description: values.description,
          order_weight: values.order_weight,
          is_active: values.is_active,
        })
        toast.success('Attachment updated')
      } else {
        if (!values.media_uuid) {
          toast.error('Please upload a file first')
          return
        }
        await adminCourseAttachmentService.create({
          course_uuid: courseUuid,
          media_uuid: values.media_uuid,
          title: values.title,
          description: values.description,
          order_weight: values.order_weight,
          is_active: values.is_active,
        })
        toast.success('Attachment created')
      }
      setIsModalOpen(false)
      fetchAttachments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save attachment')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredAttachments = attachments.filter((att) =>
    att.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getFileIcon = (type?: string, className: string = "size-4") => {
    if (!type) return <FileIcon className={className} />
    if (type.includes('image')) return <ImageIcon className={className} />
    if (type.includes('video')) return <Film className={className} />
    if (type.includes('pdf')) return <FileText className={className} />
    return <FileIcon className={className} />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Course Resources</h3>
        </div>
        <Button
          className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all"
          size="sm"
          type="button"
          variant="outline"
          onClick={handleOpenCreate}
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            className="pl-8 h-10 rounded-xl"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              initial={{ opacity: 0, x: -10 }}
            >
              <Button
                className="h-10 px-3 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/10 transition-all rounded-xl"
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => setSearchQuery('')}
              >
                <X className="mr-2 h-3 w-3" />
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttachments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No resources found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAttachments.map((att) => (
                <TableRow key={att.uuid}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        {getFileIcon(att.media?.mime_type)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{att.title}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {att.media?.mime_type || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {att.media?.size ? `${(att.media.size / 1024 / 1024).toFixed(2)} MB` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={att.is_active ?? true ? 'default' : 'secondary'} className={att.is_active ?? true ? 'bg-emerald-500' : ''}>
                      {att.is_active ?? true ? 'Active' : 'Hidden'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleOpenEdit(att)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(att)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl ring-1 ring-slate-200 admin-theme">
          <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md border-b p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Paperclip className="size-5 text-primary" />
                {editingAttachment ? 'Edit Resource' : 'Add Resource'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 bg-white">
            <Form {...form}>
              <form 
                onSubmit={(e) => {
                  e.stopPropagation()
                  form.handleSubmit(onSubmit)(e)
                }} 
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900">Attached File</label>
                  {uploadedMedia ? (
                    <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 group shadow-sm transition-all hover:shadow-md">
                      {uploadedMedia.mime_type?.startsWith('image/') ? (
                        <div className="flex items-center justify-center p-6 bg-slate-100/50">
                          <img 
                            src={uploadedMedia.url} 
                            alt="Preview" 
                            className="max-h-48 rounded-lg object-contain shadow-sm bg-white border border-slate-100" 
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                          <div className="p-5 bg-primary/10 text-primary rounded-2xl mb-4 shadow-sm ring-1 ring-primary/20">
                            {getFileIcon(uploadedMedia.mime_type, "size-10")}
                          </div>
                          <p className="font-semibold text-sm truncate max-w-[280px] mb-1 text-slate-900">
                            {uploadedMedia.original_name || uploadedMedia.name || 'Document File'}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground mb-5 px-3 py-1 bg-slate-200/50 rounded-full">
                            {uploadedMedia.size ? `${(uploadedMedia.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown Size'}
                          </p>
                          <Button size="sm" variant="outline" className="gap-2 rounded-xl shadow-sm bg-white hover:bg-slate-100" asChild>
                            <a href={uploadedMedia.url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" /> Download File
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <label className="flex items-center justify-center size-9 bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:text-primary hover:bg-white cursor-pointer transition-colors" title="Change file">
                          <Edit className="size-4" />
                          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer group text-center">
                      <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 group-hover:text-primary transition-all border border-slate-100">
                        {isUploading ? <Loader2 className="size-6 animate-spin text-primary" /> : <FileUp className="size-6 text-slate-400 group-hover:text-primary transition-colors" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {isUploading ? 'Uploading...' : 'Click to upload a file'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Images, PDFs, Videos, or Documents (Max 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>

                <FormInput
                  control={form.control}
                  name="title"
                  label="Title"
                  placeholder="E.g. Course Syllabus PDF"
                  required
                />
                
                <FormTextarea
                  control={form.control}
                  name="description"
                  label="Description (Optional)"
                  placeholder="Provide context for this resource..."
                  rows={3}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="order_weight"
                    label="Order Weight"
                    type="number"
                  />
                  <FormSelectStatus
                    control={form.control}
                    name="is_active"
                    label="Status"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving || isUploading} className="min-w-[140px]">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Save Resource
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
