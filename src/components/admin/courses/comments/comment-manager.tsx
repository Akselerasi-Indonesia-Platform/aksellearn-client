'use client'

import { Eye, EyeOff, MessageSquare, Trash2, MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { adminCourseCommentService } from '@/services/admin/course-comment.service'
import { CourseComment } from '@/types/course'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CommentManagerProps {
  courseUuid: string
}

export function CommentManager({ courseUuid }: CommentManagerProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [comments, setComments] = useState<CourseComment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const data = await adminCourseCommentService.getAll(courseUuid)
      setComments(data)
    } catch {
      toast.error('Failed to fetch comments')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (courseUuid) {
      fetchComments()
    }
  }, [courseUuid])

  const toggleStatus = async (commentUuid: string, currentStatus: boolean) => {
    try {
      await adminCourseCommentService.toggleStatus(courseUuid, commentUuid, !currentStatus)
      toast.success(t('common.updateSuccess', 'Status updated successfully'))
      fetchComments()
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'course', courseUuid] })
    } catch {
      toast.error('Update failed')
    }
  }

  const deleteComment = async (commentUuid: string) => {
    if (!window.confirm(t('common.confirmDelete', 'Are you sure you want to delete this comment?'))) return
    try {
      await adminCourseCommentService.delete(courseUuid, commentUuid)
      toast.success(t('common.deleteSuccess', 'Comment deleted successfully'))
      fetchComments()
    } catch {
      toast.error('Delete failed')
    }
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
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          {t('courses.comments', 'Course Comments')}
        </h3>
      </div>

      <div className="rounded-xl border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b bg-muted/30">
              <TableHead className="font-bold py-4">
                {t('common.user', 'User')}
              </TableHead>
              <TableHead className="font-bold py-4">
                {t('common.comment', 'Comment')}
              </TableHead>
              <TableHead className="font-bold py-4">
                {t('common.status')}
              </TableHead>
              <TableHead className="font-bold py-4">
                {t('common.createdAt')}
              </TableHead>
              <TableHead className="w-[100px] py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={5}>
                  {t('common.noResults', 'No comments found.')}
                </TableCell>
              </TableRow>
            ) : (
              comments.map((comment) => {
                return (
                  <TableRow
                    key={comment.uuid}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={(comment.user as any)?.avatar_url || (comment.user as any)?.profile?.avatar_url} />
                          <AvatarFallback>
                            {comment.user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {comment.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <p
                        className={`text-sm ${!comment.is_active ? 'italic text-muted-foreground line-through' : ''}`}
                      >
                        {comment.content}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="rounded-full px-2"
                        variant={
                          comment.is_active ? 'default' : 'secondary'
                        }
                      >
                        {comment.is_active
                          ? t('common.visible', 'Visible')
                          : t('common.hidden', 'Hidden')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="h-8 w-8 hover:bg-slate-100 transition-colors"
                              size="icon"
                              variant="ghost"
                              title="More Actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => toggleStatus(comment.uuid, comment.is_active)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              {comment.is_active ? (
                                <>
                                  <EyeOff className="h-4 w-4" />
                                  <span>{t('common.hide', 'Hide')}</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" />
                                  <span>{t('common.show', 'Show')}</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteComment(comment.uuid)}
                              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>{t('common.delete')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
