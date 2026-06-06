'use client'

import { Link, useLocation } from '@tanstack/react-router'
import * as React from 'react'

import { LanguageToggle } from './language-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

import { NotificationBell } from './notification-bell'
import { useBreadcrumbStore } from '@/lib/breadcrumb-store'

export function AdminHeader() {
  const labels = useBreadcrumbStore((state) => state.labels)
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              {mounted &&
                pathnames.map((value, index) => {
                  const last = index === pathnames.length - 1
                  const to = `/${pathnames.slice(0, index + 1).join('/')}`
                  const label =
                    labels[value] ||
                    value.charAt(0).toUpperCase() +
                      value.slice(1).replace(/-/g, ' ')

                  return (
                    <React.Fragment key={to}>
                      <BreadcrumbItem>
                        {last ? (
                          <BreadcrumbPage className="font-bold text-foreground">
                            {label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={to}>{label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!last && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  )
                })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
