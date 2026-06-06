'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Globe, Image as ImageIcon, Layout, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminArticleService } from '@/services/admin/article.service'
import { Article, ArticleFormValues, ArticleImage } from '@/types/article'
import { ImageGallery } from '@/components/admin/shared/image-gallery'
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormSearchableSelect,
  FormEditor,
  FormInputDateTime,
} from '@/components/admin/shared/form'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  article_category_uuid: z.string().min(1, 'Category is required'),
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string().url(),
      order: z.number(),
    }),
  ),
  status: z.enum(['published', 'draft']),
  published_at: z.string().optional().or(z.literal('')),
  meta_title: z.string().optional().or(z.literal('')),
  meta_description: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface ArticleFormProps {
  article?: Article
  categories: { label: string; value: string }[]
  onSubmit: (data: ArticleFormValues) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function ArticleForm({
  article,
  categories,
  onSubmit,
  onCancel,
  onDelete,
}: ArticleFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article?.title || '',
      excerpt: article?.excerpt || '',
      content: article?.content || '',
      article_category_uuid: article?.article_category_uuid || '',
      images: (article?.images || []) as ArticleImage[],
      status: article?.status || 'draft',
      published_at: article?.published_at
        ? new Date(article.published_at).toISOString()
        : '',
      meta_title: article?.meta_title || '',
      meta_description: article?.meta_description || '',
    },
  })

  const { watch } = form

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(async (values) => {
          setIsSubmitting(true)
          try {
            await onSubmit(values as ArticleFormValues)
          } finally {
            setIsSubmitting(false)
          }
        })}
      >
        <Tabs className="w-full" defaultValue="general">
          <TabsList className="grid w-full sm:w-[500px] grid-cols-3 gap-1 mb-8 bg-muted/50 p-1 border rounded-xl overflow-hidden h-12">
            <TabsTrigger
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
              value="general"
            >
              <Layout className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
              value="media"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
              value="seo"
            >
              <Globe className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent
            className="space-y-6 animate-in fade-in-50 duration-300 outline-none"
            value="general"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <FormInput
                  control={form.control}
                  label={t('common.title')}
                  name="title"
                  placeholder="Story title"
                  required
                />

                <FormTextarea
                  control={form.control}
                  description="Short summary for the post list."
                  label={t('common.description')}
                  name="excerpt"
                  placeholder="A brief summary..."
                  required
                />

                <FormEditor
                  control={form.control}
                  label={t('common.content')}
                  name="content"
                  required
                />
              </div>

              <div className="space-y-6">
                <div className="p-5 border rounded-2xl bg-muted/5 space-y-5">
                  <FormSelect
                    control={form.control}
                    label={t('common.status')}
                    name="status"
                    options={[
                      { label: t('common.draft'), value: 'draft' },
                      { label: t('common.published'), value: 'published' },
                    ]}
                    placeholder={t('common.selectStatus', 'Select Status')}
                    required
                  />

                  <FormInputDateTime
                    control={form.control}
                    label={t('common.publishedAt')}
                    name="published_at"
                  />

                  <FormSearchableSelect
                    control={form.control}
                    label={t('common.category')}
                    name="article_category_uuid"
                    options={categories}
                    placeholder={t('common.selectCategory', 'Select Category')}
                    required
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent
            className="animate-in fade-in-50 duration-300 outline-none"
            value="media"
          >
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageGallery
                      images={field.value}
                      onChange={field.onChange}
                      onUpload={(files) =>
                        adminArticleService.uploadImages(files)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent
            className="space-y-6 animate-in fade-in-50 duration-300 outline-none"
            value="seo"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormInput
                  control={form.control}
                  label={t('common.metaTitle')}
                  name="meta_title"
                  placeholder="Meta title"
                />
                <FormTextarea
                  control={form.control}
                  label={t('common.metaDescription')}
                  name="meta_description"
                  placeholder="Meta description..."
                  rows={5}
                />
              </div>

              <div className="p-6 border rounded-2xl bg-slate-50 border-slate-200 shadow-inner flex flex-col justify-center min-h-[200px]">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Search Result Preview
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500 truncate">
                      www.mclara.test › article ›{' '}
                      {(watch('title') || '')
                        .toLowerCase()
                        .replace(/\s+/g, '-')}
                    </div>
                    <h3 className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer transition-all">
                      {watch('meta_title') ||
                        watch('title') ||
                        'Your Post Title Will Appear Here'}
                    </h3>
                    <p className="text-sm text-[#4d5156] line-clamp-2 leading-snug">
                      {watch('meta_description') ||
                        watch('excerpt') ||
                        'Your detailed meta description will show up here...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-6 border-t">
          <div>
            {article && onDelete && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10 p-0"
                onClick={onDelete}
                title={t('common.delete')}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              className="hover:bg-accent/50 transition-all duration-200 rounded-xl"
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 shadow-filament hover:shadow-filament-hover active:scale-[0.98] transition-all duration-200 px-8 rounded-xl font-bold"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {article ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
