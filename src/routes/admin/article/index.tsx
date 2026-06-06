import { createFileRoute } from '@tanstack/react-router'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { z } from 'zod'
import { Filter, Plus, X } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ArticleTable } from '@/components/admin/article/article-table'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/admin/shared/layout'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { DataHeader, DataFooter } from '@/components/admin/shared/data'
import { adminArticleService } from '@/services/admin/article.service'
import { adminArticleCategoryService } from '@/services/admin/article-category.service'
import type { Article } from '@/types/article'

const articleSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
  search: z.string().default('').catch(''),
  status: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/admin/article/')({
  validateSearch: articleSearchSchema,
  component: ArticlePostsPage,
})

function ArticlePostsPage() {
  const { t } = useTranslation()
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()
  
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null)
  
  const { page, limit, search, status, category } = searchParams

  const { data: catData } = useQuery({
    queryKey: ['admin', 'article-categories', 'options'],
    queryFn: () => adminArticleCategoryService.getOptions(),
    staleTime: 5 * 60 * 1000,
  })
  const categories = catData || []

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'articles', searchParams],
    queryFn: () => adminArticleService.getAll({
        page,
        limit,
        search,
        status,
        category_uuid: category,
    }),
    placeholderData: keepPreviousData,
  })

  const articles = data?.articles || []
  const pagination = data?.meta || { page: 1, limit: 10, total: 0 }

  const setUrlSearch = (updater: (prev: typeof searchParams) => typeof searchParams) => {
    navigate({ search: updater })
  }

  const handleSearchChange = (newSearch: string) => {
    setUrlSearch((prev) => ({ ...prev, search: newSearch, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setUrlSearch((prev) => ({ ...prev, page: newPage }))
  }

  const handleCreate = () => navigate({ to: '/admin/article/create' })
  const handleEdit = (article: Article) =>
    navigate({ to: `/admin/article/${article.id}` })



  const toggleStatus = (val: string) => {
    const currentStatuses = status ? status.split(',') : []
    const newStatuses = currentStatuses.includes(val)
      ? currentStatuses.filter((s) => s !== val)
      : [...currentStatuses, val]
      
    setUrlSearch((prev) => ({
      ...prev,
      status: newStatuses.length > 0 ? newStatuses.join(',') : undefined,
      page: 1
    }))
  }

  const toggleCategory = (id: string) => {
    const currentCategories = category ? category.split(',') : []
    const newCategories = currentCategories.includes(id)
      ? currentCategories.filter((c) => c !== id)
      : [...currentCategories, id]
      
    setUrlSearch((prev) => ({
      ...prev,
      category: newCategories.length > 0 ? newCategories.join(',') : undefined,
      page: 1
    }))
  }

  const clearFilters = () => {
    setUrlSearch((prev) => ({
      ...prev,
      search: '',
      status: undefined,
      category: undefined,
      page: 1
    }))
  }

  const activeFiltersCount = (status ? status.split(',').length : 0) + (category ? category.split(',').length : 0)

  const filterTrigger = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-10 gap-2 border-border font-semibold shadow-sm"
          variant="outline"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          {t('common.filters')}
          {activeFiltersCount > 0 && (
            <div className="flex items-center">
              <span className="mx-2 h-4 w-px bg-border" />
              <Badge
                className="rounded-sm px-1.5 font-bold h-5 min-w-[20px] justify-center bg-primary text-primary-foreground"
                variant="secondary"
              >
                {activeFiltersCount}
              </Badge>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] admin-theme animate-in zoom-in-95 duration-200"
      >
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-3">
          Status
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={status?.split(',').includes('published') ?? false}
          onCheckedChange={() => toggleStatus('published')}
        >
          Published
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={status?.split(',').includes('draft') ?? false}
          onCheckedChange={() => toggleStatus('draft')}
        >
          Draft
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-1">
          Categories
        </DropdownMenuLabel>
        {categories.map((cat) => (
          <DropdownMenuCheckboxItem
            key={cat.value}
            checked={category?.split(',').includes(cat.value) ?? false}
            onCheckedChange={() => toggleCategory(cat.value)}
          >
            {cat.label}
          </DropdownMenuCheckboxItem>
        ))}
        {activeFiltersCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              className="w-full justify-start px-2 text-xs font-bold text-destructive hover:bg-destructive/10 h-8"
              variant="ghost"
              onClick={clearFilters}
            >
              <X className="mr-2 h-3.5 w-3.5" />
              {t('common.clearFilters')}
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <AdminPage>
      <PageHeader
        title="Article Posts"
        description={t(
          'courses.description',
          'Manage your article content and SEO.',
        )}
        actions={
          <Button
            className="shadow-lg shadow-primary/20 font-bold px-6"
            onClick={handleCreate}
          >
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
        }
      />

      <DataHeader
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        filterTrigger={filterTrigger}
        resultsCount={pagination.total}
        resultsLabel="articles found"
      />

      <div className="flex flex-col gap-4">
        <ArticleTable
          articles={articles}
          isLoading={isLoading}
          pageSize={pagination.limit}
          onEdit={handleEdit}
        />

        <DataFooter
          page={pagination.page}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminPage>
  )
}
