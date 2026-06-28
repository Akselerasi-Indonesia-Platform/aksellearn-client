import * as React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
  label = 'Platform',
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    comingSoon?: boolean
    badge?: number
    search?: any
    items?: {
      title: string
      url?: string
      comingSoon?: boolean
      badge?: number
      search?: any
      onClick?: () => void
    }[]
  }[]
  label?: string
}) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isUrlActive = (url: string) => {
            if (!url || url === '#') return false
            const normalizedPath = pathname.replace(/\/$/, '')
            const normalizedUrl = url.replace(/\/$/, '')
            return (
              normalizedPath === normalizedUrl ||
              normalizedPath.startsWith(normalizedUrl + '/')
            )
          }

          const isParentActive =
            isUrlActive(item.url) ||
            item.items?.some(
              (subItem) => subItem.url && isUrlActive(subItem.url),
            )

          if (item.items) {
            return (
              <Collapsible
                key={item.title}
                asChild
                className="group/collapsible"
                defaultOpen={item.isActive || isParentActive}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isParentActive}
                      tooltip={item.title}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.comingSoon && (
                        <Badge variant="secondary" className="ml-2 text-[8px] px-1.5 py-0 h-4">SOON</Badge>
                      )}
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="default" className="ml-2 text-[10px] px-1.5 py-0 h-4 rounded-full bg-primary text-primary-foreground">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = subItem.url && subItem.url !== '#'
                          ? (subItem.url.replace(/\/$/, '') === '/admin/promotion'
                              ? pathname === '/admin/promotion' || pathname === '/admin/promotion/'
                              : subItem.url.replace(/\/$/, '') === '/admin/course'
                              ? pathname === '/admin/course' || pathname === '/admin/course/' || (!pathname.startsWith('/admin/course/category') && !pathname.startsWith('/admin/course/enrollment') && pathname.startsWith('/admin/course/'))
                              : pathname.startsWith(subItem.url.replace(/\/$/, '')))
                          : false

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild={!!subItem.url && subItem.url !== '#' && !subItem.comingSoon}
                              isActive={isSubActive}
                              onClick={subItem.onClick}
                              className={subItem.comingSoon ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                            >
                              {subItem.url && subItem.url !== '#' && !subItem.comingSoon ? (
                                <Link to={subItem.url} search={subItem.search}>
                                  <span>{subItem.title}</span>
                                  {subItem.badge !== undefined && subItem.badge > 0 && (
                                    <Badge variant="default" className="ml-auto text-[10px] px-1.5 py-0 h-4 rounded-full bg-primary text-primary-foreground">
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </Link>
                              ) : (
                                <div className="flex items-center w-full">
                                  <span>{subItem.title}</span>
                                  {subItem.comingSoon && (
                                    <Badge variant="secondary" className="ml-auto text-[8px] px-1.5 py-0 h-4">SOON</Badge>
                                  )}
                                </div>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isUrlActive(item.url)}
                tooltip={item.title}
                disabled={item.comingSoon}
                className={item.comingSoon ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
              >
                <Link to={item.comingSoon ? '#' : item.url} search={item.search}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.comingSoon && (
                    <Badge variant="secondary" className="ml-auto text-[8px] px-1.5 py-0 h-4">SOON</Badge>
                  )}
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="default" className="ml-auto text-[10px] px-1.5 py-0 h-4 rounded-full bg-primary text-primary-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
