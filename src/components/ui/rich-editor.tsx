'use client'

import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Paperclip,
  Redo,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const attachmentInputRef = React.useRef<HTMLInputElement>(null)

  if (!editor) return null

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        editor.chain().focus().setImage({ src: url }).run()
      }
      reader.readAsDataURL(file)
    }
  }

  const addAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url })
          .insertContent(file.name)
          .run()
      }
      reader.readAsDataURL(file)
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const resizeImage = (width: string) => {
    editor.chain().focus().updateAttributes('image', { width }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-1.5 backdrop-blur-sm sticky top-0 z-[10]">
      {/* Text Styles */}
      <div className="flex items-center gap-0.5 mr-2">
        <Toggle
          pressed={editor.isActive('bold')}
          size="sm"
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="hover:bg-background/80"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('italic')}
          size="sm"
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          className="hover:bg-background/80"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('underline')}
          size="sm"
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          className="hover:bg-background/80"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('highlight')}
          size="sm"
          onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
          className="hover:bg-background/80"
        >
          <Highlighter className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

      {/* Alignment */}
      <div className="flex items-center gap-0.5 mx-2">
        <Toggle
          pressed={editor.isActive({ textAlign: 'left' })}
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().setTextAlign('left').run()
          }
          className="hover:bg-background/80"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive({ textAlign: 'center' })}
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().setTextAlign('center').run()
          }
          className="hover:bg-background/80"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive({ textAlign: 'right' })}
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().setTextAlign('right').run()
          }
          className="hover:bg-background/80"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

      {/* Lists */}
      <div className="flex items-center gap-0.5 mx-2">
        <Toggle
          pressed={editor.isActive('bulletList')}
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className="hover:bg-background/80"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('orderedList')}
          size="sm"
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className="hover:bg-background/80"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={editor.isActive('taskList')}
          size="sm"
          onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
          className="hover:bg-background/80"
        >
          <CheckSquare className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

      {/* Media & Links */}
      <div className="flex items-center gap-0.5 mx-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={addImage}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-background/80"
          onClick={(e) => {
            e.preventDefault()
            fileInputRef.current?.click()
          }}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {editor.isActive('image') && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[10px] font-bold uppercase"
              >
                Size
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="admin-theme rounded-xl shadow-xl"
            >
              <DropdownMenuItem onClick={() => resizeImage('25%')}>
                Small (25%)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => resizeImage('50%')}>
                Medium (50%)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => resizeImage('100%')}>
                Full (100%)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <input
          ref={attachmentInputRef}
          type="file"
          className="hidden"
          onChange={addAttachment}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-background/80"
          onClick={(e) => {
            e.preventDefault()
            attachmentInputRef.current?.click()
          }}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Toggle
          pressed={editor.isActive('link')}
          size="sm"
          onPressedChange={setLink}
          className="hover:bg-background/80"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1 opacity-50" />

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => {
          e.preventDefault()
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }}
      >
        <Eraser className="h-4 w-4" />
      </Button>

      {/* History */}
      <div className="ml-auto flex items-center gap-1 pl-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-background/80"
          disabled={!editor.can().undo()}
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().undo().run()
          }}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-background/80"
          disabled={!editor.can().redo()}
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().redo().run()
          }}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function RichEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  disabled,
}: RichEditorProps) {
  const extensions = React.useMemo(
    () => [
      StarterKit.configure(),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg border shadow-sm max-w-full h-auto my-4 mx-auto',
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: '100%',
              parseHTML: (element) =>
                element.style.width || element.getAttribute('width') || '100%',
              renderHTML: (attributes) => ({
                style: `width: ${attributes.width}`,
                width: attributes.width,
              }),
            },
          }
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    [placeholder],
  )

  const editor = useEditor({
    extensions,
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6 tiptap transition-all',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        ),
      },
    },
  })

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-background overflow-hidden ring-offset-background transition-all shadow-sm',
        !disabled &&
          'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:border-primary/50',
      )}
    >
      {!disabled && <EditorToolbar editor={editor} />}
      <div className="relative w-full h-full overflow-y-auto custom-scrollbar">
        <EditorContent
          editor={editor}
          className="[&_.tiptap]:prose-p:last:mb-0 [&_.tiptap]:prose-headings:last:mb-0 [&_.tiptap]:min-h-[400px]"
        />
      </div>
    </div>
  )
}
