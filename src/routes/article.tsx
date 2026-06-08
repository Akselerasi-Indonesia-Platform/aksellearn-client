import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  Filter,
  Loader2,
  Search,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import * as React from 'react'

import { PublicLayout } from '@/components/public/layout/main-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { usePublicArticles, useCourseCategories } from '@/hooks/use-discovery'

export const Route = createFileRoute('/article')({
  component: ArticlePage,
})

function ArticlePage() {
  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string[]>([])

  const { data: categoryData } = useCourseCategories()
  const { data, isLoading } = usePublicArticles({
    search: search || undefined,
    category_uuid: categoryFilter[0],
  })

  const articles = React.useMemo(() => data?.articles || [], [data?.articles])
  const courseCategories = categoryData || []

  const toggleCategory = (id: string) => {
    setCategoryFilter((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [id],
    )
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter([])
  }

  // Memoize filtering to prevent recalculation on every render
  const { featuredPost, regularPosts } = React.useMemo(() => {
    if (!articles.length) return { featuredPost: null, regularPosts: [] }
    const featured = articles.find((post: any) => post.thumbnail)
    const regular = articles.filter((post: any) => post.id !== featured?.id)
    return { featuredPost: featured, regularPosts: regular }
  }, [articles])

  const activeFiltersCount = categoryFilter.length

  // SEO: Generate dynamic page title and description
  React.useEffect(() => {
    const baseTitle = 'Article - Aksellearn Learn'
    const baseDescription =
      'Discover insights, tutorials, and stories from industry experts to help you grow your skills and career.'

    document.title = search
      ? `Search: ${search} | ${baseTitle}`
      : categoryFilter.length > 0
        ? `Filtered Articles | ${baseTitle}`
        : baseTitle

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', baseDescription)
    }
  }, [search, categoryFilter])

  const isError = (data as any)?.status === 'error'
  const errorMessage = (data as any)?.message || 'Failed to load articles.'

  if (isLoading && articles.length === 0) {
    return (
      <PublicLayout>
        <div className="flex h-[600px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </PublicLayout>
    )
  }

  if (isError) {
    return (
      <PublicLayout>
        <div className="flex h-[600px] flex-col items-center justify-center text-center px-6">
          <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <X className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold text-destructive mb-2">
            Discovery Failed
          </h2>
          <p className="text-muted-foreground max-w-md mb-8">{errorMessage}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <article>
        {/* Hero Section */}
        <header className="relative overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 py-20 border-b">
          <div className="container relative mx-auto px-4 md:px-6 text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm"
              role="status"
            >
              <TrendingUp aria-hidden="true" className="h-4 w-4" />
              <span>Latest Insights & Stories</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Our <span className="text-primary italic">Article</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Discover insights, tutorials, and stories from industry experts to
              help you grow your skills and career.
            </p>
          </div>
        </header>

        {/* Search & Filter Section */}
        <section
          aria-label="Search and filter"
          className="border-b bg-background sticky top-[64px] z-40 shadow-sm"
        >
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full group">
                <label className="sr-only" htmlFor="article-search">
                  Search articles
                </label>
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                />
                <Input
                  aria-label="Search articles by title, content, or author"
                  className="pl-10 h-12 rounded-xl border-border/50 focus-visible:ring-primary/20"
                  id="article-search"
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label="Filter by category"
                      className="h-12 gap-2 rounded-xl flex-1 md:flex-none"
                      variant="outline"
                    >
                      <Filter aria-hidden="true" className="h-4 w-4" />
                      Categories
                      {activeFiltersCount > 0 && (
                        <Badge
                          aria-label={`${activeFiltersCount} categories selected`}
                          className="ml-1 px-1.5 font-normal"
                          variant="secondary"
                        >
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[220px]">
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {courseCategories.map((cat) => (
                      <DropdownMenuCheckboxItem
                        key={cat.id}
                        checked={categoryFilter.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      >
                        <span className="flex-1">{cat.name}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                    {activeFiltersCount > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <Button
                          className="w-full justify-start px-2 text-sm font-normal text-destructive hover:text-destructive"
                          variant="ghost"
                          onClick={clearFilters}
                        >
                          <X aria-hidden="true" className="mr-2 h-4 w-4" />
                          Clear filters
                        </Button>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <AnimatePresence>
                  {(search || activeFiltersCount > 0) && (
                    <motion.div
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        aria-label="Clear all filters"
                        className="h-12 rounded-xl"
                        size="icon"
                        variant="ghost"
                        onClick={clearFilters}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Active Filters Display */}
            <AnimatePresence>
              {(search || activeFiltersCount > 0) && (
                <motion.div
                  animate={{ opacity: 1, height: 'auto' }}
                  aria-live="polite"
                  className="mt-4 flex items-center gap-2 overflow-hidden"
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  role="status"
                >
                  <span className="text-sm text-muted-foreground">
                    Showing {articles.length}{' '}
                    {articles.length === 1 ? 'article' : 'articles'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Article Posts */}
        <section aria-label="Article posts" className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            {articles.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center min-h-[400px] text-center"
                role="status"
              >
                <div
                  aria-hidden="true"
                  className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6"
                >
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No articles found</h2>
                <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                  We couldn't find any articles matching your search. Try
                  adjusting your filters or search terms.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="space-y-16">
                {/* Featured Post */}
                {featuredPost && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div
                        aria-hidden="true"
                        className="h-px flex-1 bg-border"
                      ></div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Featured Article
                      </Badge>
                      <div
                        aria-hidden="true"
                        className="h-px flex-1 bg-border"
                      ></div>
                    </div>
                    <Card className="overflow-hidden border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <div className="grid md:grid-cols-2 gap-0">
                        <CardHeader className="p-0 relative overflow-hidden">
                          <div className="aspect-video md:aspect-square relative">
                            <img
                              alt={featuredPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 transform-gpu"
                              loading="lazy"
                              src={featuredPost.thumbnail}
                            />
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"
                            ></div>
                            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                              {featuredPost.category?.name || 'General'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10 flex flex-col justify-center">
                          <div className="space-y-5">
                            <h2 className="text-3xl md:text-4xl font-bold leading-tight group-hover:text-primary transition-colors">
                              {featuredPost.title}
                            </h2>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                              {featuredPost.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                              <span className="font-medium text-foreground flex items-center gap-2">
                                <User aria-hidden="true" className="h-4 w-4" />
                                {featuredPost.author || 'Editorial'}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar
                                  aria-hidden="true"
                                  className="h-4 w-4"
                                />
                                <time dateTime={featuredPost.published_at}>
                                  {featuredPost.published_at
                                    ? new Date(
                                        featuredPost.published_at,
                                      ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })
                                    : 'Recently'}
                                </time>
                              </span>
                            </div>
                            <Button
                              className="w-full md:w-auto group/btn mt-4"
                              size="lg"
                            >
                              Read Article
                              <ArrowRight
                                aria-hidden="true"
                                className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                              />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Regular Posts Grid - 4 columns */}
                {regularPosts.length > 0 && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {regularPosts.map((post: any) => (
                      <Card
                        key={post.id}
                        className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group flex flex-col h-full"
                      >
                        <CardHeader className="p-0 relative overflow-hidden">
                          <div className="aspect-video relative">
                            <img
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 transform-gpu"
                              loading="lazy"
                              src={
                                post.thumbnail ||
                                'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop'
                              }
                            />
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"
                            ></div>
                            <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-xs">
                              {post.category?.name || 'Article'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-1">
                            {post.excerpt}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
                            <span className="font-medium text-foreground flex items-center gap-1">
                              <User aria-hidden="true" className="h-3 w-3" />
                              {post.author || 'Editorial'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar
                                aria-hidden="true"
                                className="h-3 w-3"
                              />
                              <time dateTime={post.published_at}>
                                {post.published_at
                                  ? new Date(
                                      post.published_at,
                                    ).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'Recent'}
                              </time>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </article>
    </PublicLayout>
  )
}
