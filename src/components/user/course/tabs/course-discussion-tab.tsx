import { useState, useMemo, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Clock, Heart, Loader2, Play, ThumbsUp, Trash2, Edit, User } from 'lucide-react'
import { EmptyState } from '@/components/public/ui/empty-state'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CourseDiscussionTabProps {
  comments: any[]
  user: any
  postCommentMutation: any
  deleteCommentMutation: any
  updateCommentMutation?: any
  toggleCommentLikeMutation?: any
  playerController: any
  hasVideo: boolean
}

const safeDate = (dateStr: string | undefined) => {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

function CommentNode({
  comment,
  user,
  postCommentMutation,
  updateCommentMutation,
  deleteCommentMutation,
  toggleCommentLikeMutation,
  playerController,
  depth = 0,
  rootCommentUuid,
}: any) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  const isOwn = Boolean(user && (
    (user.uuid && (user.uuid === comment.user?.uuid || user.uuid === comment.user_uuid)) ||
    (user.name && (user.name === comment.user?.name || user.name === comment.user_name))
  ))
  const canEdit = (Date.now() - safeDate(comment.created_at || comment.createdAt).getTime()) <= 5 * 60 * 1000

  const handleReply = () => {
    if (replyText) {
      postCommentMutation.mutate(
        { content: replyText, parentUuid: rootCommentUuid || comment.uuid || comment.id },
        {
          onSuccess: () => {
            setIsReplying(false)
            setReplyText('')
            import('sonner').then(({ toast }) => toast.success('Reply posted successfully'))
          },
        }
      )
    }
  }

  const handleEdit = () => {
    if (editText && editText !== comment.content) {
      updateCommentMutation?.mutate(
        { commentUuid: comment.uuid || comment.id, content: editText },
        {
          onSuccess: () => setIsEditing(false),
        }
      )
    } else {
      setIsEditing(false)
    }
  }

  return (
    <div className={cn("group", depth > 0 ? "mt-4 pl-4 border-l-2 border-slate-100" : "")}>
      <div className="flex gap-4">
        <Avatar className="size-10 ring-2 ring-transparent transition-transform shrink-0">
          {comment.is_deleted ? (
            <AvatarFallback className="bg-slate-100 text-slate-400">
              <User className="size-4" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage src={comment.user?.avatar || comment.user_avatar} />
              <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs">
                {((comment.user?.name || comment.user_name) || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-sm text-slate-900">
              {comment.user?.name || comment.user_name}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {formatDistanceToNow(safeDate(comment.created_at || comment.createdAt))} ago
            </span>
          </div>

          {comment.video_timestamp !== null && comment.video_timestamp !== undefined && (
            <button
              onClick={() => playerController?.seek(comment.video_timestamp!)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all mb-2"
            >
              <Play className="size-3" />
              {Math.floor(comment.video_timestamp / 60).toString().padStart(2, '0')}:
              {Math.floor(comment.video_timestamp % 60).toString().padStart(2, '0')}
            </button>
          )}

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                className="bg-slate-50/50 border-slate-200 rounded-xl min-h-[80px]"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleEdit} className="h-8">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8">Cancel</Button>
              </div>
            </div>
          ) : (
            <p className={cn("text-sm leading-relaxed break-words whitespace-pre-wrap", comment.is_deleted ? "text-slate-400 italic" : "text-slate-700")}>
              {comment.content}
            </p>
          )}

          {!comment.is_deleted && (
            <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => toggleCommentLikeMutation?.mutate(comment.uuid || comment.id)}
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors",
                comment.is_liked ? "text-primary hover:text-primary/80" : "text-slate-400 hover:text-primary"
              )}
            >
              <ThumbsUp className={cn("size-3.5", comment.is_liked && "fill-primary")} />
              <span>{comment.likes_count || 0}</span>
            </button>

            <button 
              onClick={() => {
                const willReply = !isReplying;
                setIsReplying(willReply);
                if (willReply) {
                  if (depth > 0) {
                    const targetName = comment.user?.name || comment.user_name || 'User';
                    setReplyText(`@${targetName.replace(/\s+/g, '')} `);
                  }
                  setTimeout(() => {
                    if (replyInputRef.current) {
                      replyInputRef.current.focus();
                      const len = replyInputRef.current.value.length;
                      replyInputRef.current.setSelectionRange(len, len);
                    }
                  }, 10);
                } else {
                  setReplyText('');
                }
              }}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
            >
              <span>Reply</span>
            </button>

            {isOwn && !isEditing && (
              <div className="ml-auto flex items-center gap-4 opacity-0 group-hover:opacity-100">
                {canEdit && (
                  <button
                    onClick={() => {
                      setEditText(comment.content)
                      setIsEditing(true)
                    }}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Edit className="size-3" /> Edit
                  </button>
                )}
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="size-3" /> Delete
                </button>
              </div>
            )}
          </div>
          )}

          {isReplying && !comment.is_deleted && (
            <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                  {(user?.name || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  ref={replyInputRef}
                  placeholder="Write a reply..."
                  className="bg-slate-50/50 border-slate-200 rounded-xl min-h-[60px] text-sm"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleReply}
                    disabled={!replyText || postCommentMutation.isPending}
                    size="sm"
                    className="font-bold rounded-lg h-8"
                  >
                    Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsReplying(false)
                      setReplyText('')
                    }}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply: any) => (
                <CommentNode
                  key={reply.uuid || reply.id}
                  comment={reply}
                  user={user}
                  postCommentMutation={postCommentMutation}
                  updateCommentMutation={updateCommentMutation}
                  deleteCommentMutation={deleteCommentMutation}
                  toggleCommentLikeMutation={toggleCommentLikeMutation}
                  playerController={playerController}
                  depth={depth + 1}
                  rootCommentUuid={rootCommentUuid || comment.uuid || comment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                deleteCommentMutation.mutate(comment.uuid || comment.id)
                setIsDeleteConfirmOpen(false)
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function CourseDiscussionTab({
  comments,
  user,
  postCommentMutation,
  deleteCommentMutation,
  updateCommentMutation,
  toggleCommentLikeMutation,
  playerController,
  hasVideo,
}: CourseDiscussionTabProps) {
  const [commentText, setCommentText] = useState('')
  const [includeTimestamp, setIncludeTimestamp] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [errorText, setErrorText] = useState('')

  const handleSubmit = () => {
    if (!commentText.trim()) {
      setErrorText('Comment cannot be empty')
      return
    }
    setErrorText('')
    
    let ts = includeTimestamp && playerController ? playerController.getCurrentTime() : undefined
    if (ts !== undefined && ts <= 0) {
      ts = undefined
    }
    
    postCommentMutation.mutate({ content: commentText, videoTimestamp: ts }, {
      onError: (error: any) => {
        if (error?.response?.status === 422) {
          const errors = error.response.data?.errors
          if (errors?.video_timestamp) {
            setErrorText(errors.video_timestamp[0] || errors.video_timestamp)
          }
        }
      },
      onSuccess: () => {
        import('sonner').then(({ toast }) => toast.success('Comment posted successfully'))
      }
    })
    
    setCommentText('')
    setIsFocused(false)
    setIncludeTimestamp(false)
  }

  const topLevelComments = useMemo(() => {
    // Reconstruct the tree if backend returns a flat list
    const commentMap = new Map()
    const roots: any[] = []

    // First pass: Map all comments
    comments.forEach((c) => {
      commentMap.set(c.uuid || c.id, { ...c, replies: c.replies ? [...c.replies] : [] })
    })

    // Second pass: Attach to parents
    comments.forEach((c) => {
      const parentId = c.parent_id || c.parent_uuid
      const currentNode = commentMap.get(c.uuid || c.id)

      if (parentId) {
        // Find parent node by matching ID or UUID
        let parent = null
        for (const p of commentMap.values()) {
          // Fallback to strict DB id check if available, or UUID check
          if (
            p.uuid === parentId ||
            p.id === parentId ||
            (c.parent_id && p.id === c.parent_id) ||
            (c.parent_uuid && p.uuid === c.parent_uuid)
          ) {
            parent = p
            break
          }
        }

        if (parent) {
          // Add child to parent if it wasn't already nested by backend
          if (!parent.replies.some((r: any) => (r.uuid || r.id) === (currentNode.uuid || currentNode.id))) {
            parent.replies.push(currentNode)
          }
        } else {
          roots.push(currentNode) // Parent missing, add to root
        }
      } else {
        roots.push(currentNode)
      }
    })

    return roots
  }, [comments])

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-slate-50/30">
        <h4 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
          Discussion
          <span className="ml-2 text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        </h4>

        {/* Composer */}
        <div className="flex gap-4">
          <Avatar className="size-10 ring-2 ring-slate-100 shrink-0">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {(user?.name || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share your thoughts, ask a question, or leave feedback..."
              className={`bg-slate-50/50 border-slate-200 rounded-xl focus-visible:ring-primary/20 transition-all ${
                isFocused || commentText ? 'min-h-[100px]' : 'min-h-[44px]'
              }`}
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value)
                if (errorText && e.target.value.trim()) setErrorText('')
              }}
              onFocus={() => setIsFocused(true)}
            />
            {errorText && (
              <p className="text-xs font-bold text-rose-500 animate-in fade-in">{errorText}</p>
            )}
            
            {(isFocused || commentText) && (
              <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
                {hasVideo ? (
                  <label 
                    className={cn(
                      "flex items-center gap-2 cursor-pointer group",
                      (!playerController || playerController.getCurrentTime() <= 0) && "opacity-50 cursor-not-allowed"
                    )}
                    title={(!playerController || playerController.getCurrentTime() <= 0) ? "Play the video first to attach a timestamp." : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={includeTimestamp}
                      disabled={!playerController || playerController.getCurrentTime() <= 0}
                      onChange={(e) => {
                        setIncludeTimestamp(e.target.checked)
                      }}
                      className="size-4 rounded text-primary focus:ring-primary border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                      Link to current timestamp
                    </span>
                  </label>
                ) : (
                  <div />
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsFocused(false)
                      setCommentText('')
                      setErrorText('')
                      setIncludeTimestamp(false)
                    }}
                    className="font-bold text-slate-500 hover:text-slate-900"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={postCommentMutation.isPending}
                    size="sm"
                    className="font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-6 shadow-sm"
                  >
                    {postCommentMutation.isPending && (
                      <Loader2 className="size-3.5 animate-spin mr-2" />
                    )}
                    Comment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {topLevelComments.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Be the first to start the discussion"
            description="Got a question or something to add? Share it with the community here."
            variant="light"
          />
        ) : (
          <div className="space-y-8">
            {topLevelComments.map((comment) => (
              <CommentNode
                key={comment.id || comment.uuid}
                comment={comment}
                user={user}
                postCommentMutation={postCommentMutation}
                updateCommentMutation={updateCommentMutation}
                deleteCommentMutation={deleteCommentMutation}
                toggleCommentLikeMutation={toggleCommentLikeMutation}
                playerController={playerController}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
