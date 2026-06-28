import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  BookMarked,
  Command,
  FileText,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  PieChart,
  Settings2,
  Users,
  DollarSign,
  HelpCircle,
  Building,
  Tag,
} from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { adminOrderService } from '@/services/admin/order.service'

import { getUser, can } from '@/lib/auth'
import { useAuthStore } from '@/hooks/use-auth'
import { usePlatformStore } from '@/hooks/use-platform'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavUser } from './nav-user'
import { APP_CONFIG } from '@/config/app'

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { user: authUser } = useAuthStore()
  const { profile: platformProfile } = usePlatformStore()
  const [mounted, setMounted] = React.useState(false)



  React.useEffect(() => {
    setMounted(true)
  }, [])

  const { data: pendingOrders } = useQuery({
    queryKey: ['admin', 'orders', { status: 'pending', page: 1, limit: 1 }],
    queryFn: () => adminOrderService.getAll({ status: 'pending', page: 1, limit: 1 }),
    enabled: mounted,
    staleTime: 60 * 1000,
  })

  const data = {
    user: {
      name: authUser?.name || 'Admin User',
      email: authUser?.email || 'admin@example.com',
      avatar: authUser?.avatar || 'https://github.com/shadcn.png',
    },

    navMain: [
      {
        title: t('sidebar.dashboard', 'Dashboard'),
        url: '/admin/dashboard',
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: t('sidebar.revenue', 'Revenue'),
        url: '#',
        icon: DollarSign,
        roles: ['Super Admin', 'Admin', 'Teacher', 'Instructor'],
        permissions: ['platform_finance.read'],
        feature: 'revenue',
        items: [
          {
            title: 'Platform Finance',
            url: '/admin/finance/revenue',
            permissions: ['platform_finance.read'],
          },
          {
            title: t('sidebar.orders', 'Orders'),
            url: '/admin/order/',
            roles: ['Super Admin', 'Admin', 'Teacher', 'Instructor'],
            badge: pendingOrders?.meta?.total || 0,
          },
          {
            title: t('sidebar.instructorRevenue', 'Instructor Revenue'),
            url: '/admin/instructor/revenue',
            roles: ['Super Admin', 'Teacher', 'Instructor'],
          },
          {
            title: t('sidebar.myBankAccounts', 'Bank Accounts'),
            url: '/admin/instructor/bank-accounts',
            roles: ['Teacher', 'Instructor'],
          },
          {
            title: t('sidebar.myWithdrawals', 'My Withdrawals'),
            url: '/admin/instructor/withdrawals',
            roles: ['Teacher', 'Instructor'],
          },
          {
            title: t('sidebar.feeConfig', 'Platform Fee'),
            url: '/admin/finance/platform-fees',
            roles: ['Super Admin'],
          },
          {
            title: t('sidebar.withdrawals', 'Withdrawals'),
            url: '/admin/finance/withdrawals',
            roles: ['Super Admin', 'Admin'],
          },
        ],
      },
      {
        title: t('sidebar.users', 'Users'),
        url: '/admin/user/',
        icon: Users,
        roles: ['Super Admin', 'Admin'],
        feature: 'users',
        items: [
          {
            title: t('sidebar.allUsers', 'All Users'),
            url: '/admin/user/',
          },
          {
            title: t('sidebar.roles', 'Roles'),
            url: '/admin/role/',
          },
          {
            title: t('sidebar.instructorApplications', 'Instructor Applications'),
            url: '/admin/instructor-applications',
          },
        ],
      },
      {
        title: t('sidebar.organizations', 'Organizations'),
        url: '/admin/organization',
        icon: Building,
        roles: ['Super Admin', 'Admin'],
        feature: 'organizations',
        items: [
          {
            title: 'All Organizations',
            url: '/admin/organization',
          },
          {
            title: 'Industry Tags',
            url: '/admin/organization/tag',
          },
        ],
      },
      {
        title: t('sidebar.articles', 'Articles'),
        url: '/admin/article/',
        icon: FileText,
        feature: 'articles',
      },
      {
        title: t('sidebar.courses', 'Courses'),
        url: '/admin/course/',
        icon: BookOpen,
        feature: 'courses',
        items: [
          {
            title: t('sidebar.allCourses', 'All Courses'),
            url: '/admin/course/',
          },
          {
            title: t('sidebar.categories', 'Categories'),
            url: '/admin/course/category',
            roles: ['Super Admin', 'Admin'],
          },
          {
            title: t('sidebar.enrollments', 'Enrollments'),
            url: '/admin/course/enrollment',
          },
        ],
      },
      {
        title: t('sidebar.marketing', 'Marketing'),
        url: '/admin/promotion',
        icon: Tag,
        roles: ['Super Admin', 'Admin', 'Teacher', 'Instructor'],
        feature: 'courses',
        items: [
          {
            title: t('sidebar.promotions', 'Promotions'),
            url: '/admin/promotion',
            roles: ['Super Admin', 'Admin', 'Teacher', 'Instructor'],
          },
          {
            title: t('sidebar.coupons', 'Coupons'),
            url: '/admin/promotion/coupon',
            roles: ['Super Admin', 'Admin'],
          },
          {
            title: t('sidebar.featuredCourses', 'Featured Courses'),
            url: '/admin/featured-courses',
            roles: ['Super Admin', 'Admin'],
          },
          {
            title: t('sidebar.banners', 'Banners'),
            url: '/admin/banners',
            roles: ['Super Admin', 'Admin'],
          },
        ],
      },
      {
        title: t('sidebar.quizzes', 'Quizzes'),
        url: '/admin/quiz/',
        icon: HelpCircle,
        feature: 'quizzes',
      },
      {
        title: t('sidebar.settings', 'Settings'),
        url: '#',
        icon: Settings2,
        roles: ['Super Admin'],
        feature: 'settings',
        items: [
          {
            title: t('sidebar.appSettings', 'App Settings'),
            url: '/admin/setting/app',
          },
          {
            title: t('sidebar.platformProfile', 'Platform Profile'),
            url: '/admin/setting/platform',
          },
          {
            title: t('sidebar.paymentMethods', 'Payment Methods'),
            url: '/admin/setting/payment-method',
          },
        ],
      },
      {
        title: t('sidebar.guide', 'Guide'),
        url: '/admin/guide',
        icon: BookMarked,
        items: [
          {
            title: t('sidebar.guideCourse', 'Course Management'),
            url: '/admin/guide/course',
          },
          {
            title: t('sidebar.guidePromotion', 'Promotion & Coupon'),
            url: '/admin/guide/promotion',
          },
        ],
      },
    ],
    projects: [
      {
        name: t('sidebar.platform', 'Platform'),
        url: '#',
        icon: Command,
        feature: 'platform',
        comingSoon: true,
      },
      {
        name: t('sidebar.analytics', 'Analytics'),
        url: '#',
        icon: PieChart,
        feature: 'analytics',
        comingSoon: true,
      },
      {
        name: t('sidebar.exports', 'Exports'),
        url: '#',
        icon: History,
        feature: 'exports',
        comingSoon: true,
      },
    ],
  }

  const filterNavItems = React.useCallback((navItems: any[]) => {
    return navItems
      .filter((item) => {
        // 1. Feature Toggle Check
        if (item.feature && !(APP_CONFIG.features as any)[item.feature])
          return false

        // 1.5. Platform Focus Check
        if (platformProfile?.platform_focus) {
          if (platformProfile.platform_focus === 'course' && item.title === t('sidebar.articles', 'Articles')) {
            return false
          }
          if (platformProfile.platform_focus === 'article' && item.title === t('sidebar.courses', 'Courses')) {
            return false
          }
        }

        // 2. Role & Permission Check
        const hasRoles = !!(item as any).roles
        const hasPermissions = !!(item as any).permissions
        
        if (!hasRoles && !hasPermissions) return true
        
        const user = getUser()
        
        // God Mode permission fallback
        const isSuperAdmin = can('super.admin', user) || can('manage_all', user)
        if (isSuperAdmin) return true

        let roleMatch = false
        if (hasRoles && user?.roles) {
          roleMatch = user.roles.some((role: any) =>
            (item as any).roles.includes(
              typeof role === 'string' ? role : role.name,
            ),
          )
        }

        let permMatch = false
        if (hasPermissions && user?.permissions) {
          permMatch = user.permissions.some((perm: string) =>
            (item as any).permissions.includes(perm),
          )
        }

        return roleMatch || permMatch
      })
      .map((item) => {
        if (!item.items) return item
        const user = getUser()
        const isSuperAdmin = can('super.admin', user) || can('manage_all', user)

        const filteredSubItems = item.items.filter((subItem: any) => {
          if (isSuperAdmin) return true
          
          const subHasRoles = !!subItem.roles
          const subHasPermissions = !!subItem.permissions
          
          if (!subHasRoles && !subHasPermissions) return true
          
          let roleMatch = false
          if (subHasRoles && user?.roles) {
            roleMatch = user.roles.some((role: any) =>
              subItem.roles.includes(typeof role === 'string' ? role : role.name)
            )
          }
          
          let permMatch = false
          if (subHasPermissions && user?.permissions) {
            permMatch = user.permissions.some((perm: string) =>
              subItem.permissions.includes(perm)
            )
          }
          
          return roleMatch || permMatch
        })

        return {
          ...item,
          items: filteredSubItems,
        }
      })
      .filter((item) => !item.items || item.items.length > 0)
  }, [platformProfile, t])

  const filteredPlatform = filterNavItems(data.navMain)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link to="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                  {platformProfile?.logo?.url ? (
                    <img src={platformProfile.logo.url} alt="Logo" className="w-full h-full object-contain p-0.5" />
                  ) : platformProfile?.logo_dark?.url ? (
                    <img src={platformProfile.logo_dark.url} alt="Logo" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Command className="size-4" />
                    </div>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-semibold">{platformProfile?.name || 'Aksellearn'}</span>
                  <span className="text-xs">
                    {platformProfile?.tagline || t('sidebar.appDescription', 'Core Learning App')}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {mounted && (
          <>
            <NavMain items={filteredPlatform} />
            <NavProjects
              projects={data.projects.filter((project) => {
                if (
                  (project as any).feature &&
                  !(APP_CONFIG.features as any)[(project as any).feature]
                )
                  return false
                return true
              })}
              showMore={APP_CONFIG.features.more_projects}
            />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>{mounted && <NavUser user={data.user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
