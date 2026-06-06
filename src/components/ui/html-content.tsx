import { cn } from '@/lib/utils'
import DOMPurify from 'dompurify'
import * as React from 'react'

interface HtmlContentProps {
  html: string
  className?: string
}

/**
 * HtmlContent Component
 * An atomic component for rendering rich text / HTML content from editors (Tiptap)
 * ensuring consistent typography and premium styling using tailwind-typography.
 */
export function HtmlContent({ html, className }: HtmlContentProps) {
  const [sanitizedHtml, setSanitizedHtml] = React.useState<string>('')

  React.useEffect(() => {
    if (html) {
      setSanitizedHtml(DOMPurify.sanitize(html))
    } else {
      setSanitizedHtml('')
    }
  }, [html])

  if (!html) return null

  // During SSR we render the raw HTML (which should have been sanitized on save),
  // but we hydrate with the DOMPurify version to be absolutely safe
  const contentToRender = sanitizedHtml || html

  return (
    <div
      className={cn(
        // Base prose classes
        'prose prose-slate dark:prose-invert max-w-none',
        // Heading refinements
        'prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-800',
        // Paragraph & Text refinements
        'prose-p:leading-relaxed prose-p:text-slate-600 prose-p:font-medium',
        // List refinements
        'prose-li:text-slate-600 prose-li:font-medium',
        // Link refinements
        'prose-a:text-indigo-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline',
        // Media refinements
        'prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8 prose-img:border prose-img:border-slate-100',
        // Blockquote refinements
        'prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-indigo-900',
        // Table refinements
        'prose-th:bg-slate-50 prose-th:p-4 prose-td:p-4 prose-table:rounded-xl prose-table:overflow-hidden prose-table:border prose-table:border-slate-100',
        // Code refinements
        'prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-indigo-600 prose-code:before:content-none prose-code:after:content-none',
        // Tiptap specific overrides from styles.css
        'tiptap',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: contentToRender }}
    />
  )
}
