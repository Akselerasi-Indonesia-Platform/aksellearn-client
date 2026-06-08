import * as React from 'react'
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import {
  removeToken,
  getUser,
  getToken,
  getCorrectPortalPath,
  ensureValidPortal,
} from '@/lib/auth'
import {
  BookOpen,
  LogOut,
  User as UserIcon,
  Menu,
  History,
  FileText,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import { usePlatformStore } from '@/hooks/use-platform'

import { NotificationSheet } from '@/components/user/layout/notification-sheet'
import { EmailVerificationBanner } from '@/components/auth/email-verification-banner'
import { WelcomeStepModal } from '@/components/onboarding/welcome-step-modal'

export const Route = createFileRoute('/student')({
  beforeLoad: async ({ location, context }) => {
    const isClient = typeof window !== 'undefined'

    let authenticated = false
    let user = null

    if (!isClient) {
      authenticated = true 
      user = getUser(context.request)
    } else {
      const { useAuthStore } = await import('@/hooks/use-auth')
      let auth = useAuthStore.getState()

      if (!auth.isInitialized) {
        console.log('⏳ [Student Guard] Waiting for rehydration...')
        await auth.rehydrate()
        auth = useAuthStore.getState()
      }

      authenticated = auth.isAuthenticated
      user = auth.user
    }

    if (!authenticated) {
      const groundTruthAuth = !!getToken(context.request)
      if (groundTruthAuth) {
        authenticated = true
      }
    }

    if (!authenticated) {
      console.warn('🚫 [Student Guard] Not authenticated. Redirecting to login.')
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    await ensureValidPortal(user, location.pathname, authenticated, isClient)
  },
  component: UserLayout,
})

function UserLayout() {
  const [mounted, setMounted] = React.useState(false)
  const user = getUser()
  const { profile: platformProfile } = usePlatformStore()

  React.useEffect(() => {
    setMounted(true)

    const authenticated = !!getToken()
    const targetPath = getCorrectPortalPath(user, window.location.pathname, authenticated)
    if (targetPath && targetPath !== window.location.pathname) {
      console.warn('🚫 Redirecting to correct portal:', targetPath)
      window.location.href = targetPath
    }
  }, [user])

  const handleLogout = () => {
    removeToken()
    window.location.href = '/login'
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#F0F7FF]/50 flex flex-col font-sans selection:bg-[#056FAE]/20 selection:text-[#056FAE]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#056FAE]/10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            {platformProfile?.logo?.url ? (
              <img
                src={platformProfile.logo.url}
                alt={platformProfile.name || 'Logo'}
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : platformProfile?.logo_dark?.url ? (
              <img
                src={platformProfile.logo_dark.url}
                alt={platformProfile.name || 'Logo'}
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <>
                <div className="size-10 bg-gradient-to-br from-[#056FAE] to-[#2AABAA] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#056FAE]/20 group-hover:scale-105 transition-transform duration-300">
                  {platformProfile?.platform_focus === 'article' ? <FileText className="size-5" /> : <BookOpen className="size-5" />}
                </div>
                <span className="text-xl font-black tracking-tight text-[#0D3A6E]">
                  {platformProfile?.name?.toUpperCase() || 'AKSELLEARN'}
                </span>
              </>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/student/dashboard"
              className="px-4 py-2 text-sm font-black text-[#0D3A6E]/60 hover:text-[#056FAE] hover:bg-[#F0F7FF] rounded-lg transition-all"
              activeProps={{ className: 'bg-[#F0F7FF] text-[#056FAE]' }}
            >
              Dashboard
            </Link>
            <Link
              to="/student/order"
              className="px-4 py-2 text-sm font-black text-[#0D3A6E]/60 hover:text-[#056FAE] hover:bg-[#F0F7FF] rounded-lg transition-all"
              activeProps={{ className: 'bg-[#F0F7FF] text-[#056FAE]' }}
            >
              Transactions
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <NotificationSheet />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative size-10 rounded-full p-0 overflow-hidden border border-[#056FAE]/20 hover:border-[#056FAE]/50 transition-colors"
              >
                <Avatar className="size-full">
                  <AvatarFallback className="bg-[#F0F7FF] text-[#056FAE] font-black text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 rounded-2xl p-2 shadow-2xl shadow-[#056FAE]/10 border-[#056FAE]/10"
            >
              <DropdownMenuLabel className="px-3 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-[#0D3A6E] truncate">
                    {user?.name}
                  </span>
                  <span className="text-[10px] font-black text-[#056FAE]/60 uppercase tracking-widest truncate">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#F0F7FF]" />
              <DropdownMenuItem
                className="rounded-xl px-3 py-3 font-bold text-[#0D3A6E]/80 focus:bg-[#F0F7FF] focus:text-[#056FAE] cursor-pointer"
                asChild
              >
                <Link to="/student/profile">
                  <UserIcon className="mr-3 size-4" /> Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-3 py-3 font-bold text-[#0D3A6E]/80 focus:bg-[#F0F7FF] focus:text-[#056FAE] cursor-pointer"
                asChild
              >
                <Link to="/student/notification-settings">
                  <Bell className="mr-3 size-4" /> Notification Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-3 py-3 font-bold text-[#0D3A6E]/80 focus:bg-[#F0F7FF] focus:text-[#056FAE] cursor-pointer"
                asChild
              >
                <Link to="/student/order">
                  <History className="mr-3 size-4" /> Billing History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#F0F7FF]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-xl px-3 py-3 font-bold text-rose-500 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
              >
                <LogOut className="mr-3 size-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl text-[#0D3A6E]/60"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </header>

      <EmailVerificationBanner />
      <WelcomeStepModal />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-br from-[#0A2E59] to-[#0D3A6E] py-8 px-6 text-center">
        <p className="text-[10px] font-bold text-[#F0F7FF]/60 uppercase tracking-widest">
          © {new Date().getFullYear()} {platformProfile?.name || 'Aksellearn Learning Platform'}. All rights reserved.
        </p>
      </footer>
    </div>
  )
}