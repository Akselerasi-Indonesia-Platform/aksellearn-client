import { Link } from '@tanstack/react-router'
import { ArrowRight, Calendar, Clock, User, BookOpen } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import type { Article } from '@/types/article'

interface LatestArticlesProps {
  articles: Article[]
}

export function LatestArticles({ articles }: LatestArticlesProps) {
  const featuredArticle = articles[0]
  const latestArticles = articles.slice(1, 5)

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest w-fit">
              <BookOpen className="size-3" />
              <span>Knowledge Hub</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">
              Latest from our{' '}
              <span className="text-primary italic">Journal</span>
            </h2>
            <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
              Discover insights, tutorials, and stories from industry experts to
              help you grow your skills and career.
            </p>
          </div>
          <Link className="w-full md:w-auto" to="/article">
            <Button
              className="w-full md:w-auto font-bold group text-foreground border-slate-200"
              variant="outline"
            >
              View all articles
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          {featuredArticle && (
            <Card className="overflow-hidden border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 transform-gpu group bg-card p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <CardHeader className="p-0 relative overflow-hidden">
                  <div className="aspect-video md:aspect-square relative">
                    <img
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 transform-gpu"
                      loading="eager"
                      src={featuredArticle.thumbnail}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/95 text-indigo-600 border-none font-bold shadow-lg shadow-indigo-600/10 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider">
                        {featuredArticle.badge_text || "Editor's Pick"}
                      </Badge>
                    </div>
                    <Badge className="absolute top-4 right-4 bg-background/95 text-xs text-foreground shadow-sm">
                      {featuredArticle.category?.name || 'Knowledge'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="space-y-5">
                    <h3 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors text-card-foreground">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Clara Editorial
                      </span>
                      {featuredArticle.published_at && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={featuredArticle.published_at}>
                            {new Date(
                              featuredArticle.published_at,
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </time>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />5 min read
                      </span>
                    </div>
                    <Link to="/">
                      <Button
                        className="w-full md:w-auto group/btn mt-4"
                        size="lg"
                      >
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latestArticles.map((post) => (
              <Link key={post.id} to="/">
                <Card className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 transform-gpu group flex flex-col h-full bg-card p-0">
                  <CardHeader className="p-0 relative overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 transform-gpu"
                        loading="lazy"
                        src={post.thumbnail}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
                      <Badge className="absolute top-3 left-3 bg-background/95 text-xs text-foreground shadow-sm">
                        {post.category?.name || 'Update'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors text-card-foreground">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Editorial
                      </span>
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                              },
                            )}
                          </time>
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
