import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, ChevronRight, Menu, Search, ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { isAuthenticated, getUser, removeToken, isAdmin } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, LayoutDashboard, Settings2 } from 'lucide-react'

import { useNavigate } from '@tanstack/react-router'
import { useCourseCategories } from '@/hooks/use-discovery'
import { useCart } from '@/hooks/use-cart'
import { useUIStore } from '@/hooks/use-ui-store'
import { usePlatformStore } from '@/hooks/use-platform'
import { MiniCart } from '@/components/public/cart/mini-cart'

export function PublicNavbar() {
  const [mounted, setMounted] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isScrolled, setIsScrolled] = React.useState(false)
  const navigate = useNavigate()
  const { toggleMiniCart } = useUIStore()
  const { profile } = usePlatformStore()

  const { data: categories } = useCourseCategories()
  const { cart } = useCart()
  const cartItemCount = cart?.total_items || 0

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isAuth = mounted ? isAuthenticated() : false
  const user = mounted ? getUser() : null
  const userIsAdmin = mounted && user ? isAdmin(user) : false
  const userIsInstructor = mounted && user ? user.roles?.includes('Instructor') : false
  const canApplyInstructor = mounted && (!user || (!userIsAdmin && !userIsInstructor))

  const handleLogout = () => {
    removeToken()
    window.location.href = '/'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate({
        to: '/search',
        search: { q: searchQuery.trim() },
      })
    }
  }

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-300 bg-brand-gradient text-white shadow-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Logo & Categories */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link className="flex items-center space-x-2" to="/">
            {profile?.logo_dark?.url ? (
              <img
                src={profile.logo_dark.url}
                alt={profile.name || 'Akselerasi Indonesia'}
                className="h-16 w-auto object-contain"
              />
            ) : profile?.logo?.url ? (
              <img
                src={profile.logo.url}
                alt={profile.name || 'Akselerasi Indonesia'}
                className="h-16 w-auto object-contain"
              />
            ) : (
              <img
                src="/images/brand/logo-white.png"
                alt="Akselerasi Indonesia"
                className="h-16 w-auto object-contain"
              />
            )}
          </Link>


        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden flex-1 px-8 lg:flex max-w-2xl">
          <form className="relative w-full group" onSubmit={handleSearch}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              className="w-full pl-10 h-10 rounded-full border-transparent transition-all bg-white/10 text-white placeholder:text-white/60 hover:bg-white/20 focus-visible:ring-white/30 focus-visible:bg-white/20"
              placeholder="Search training tracks..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <nav className="hidden lg:flex items-center gap-4 mr-2">
            {canApplyInstructor && (
              <Link
                className="text-sm font-medium transition-colors text-white/80 hover:text-white hover:border-b-2 hover:border-white"
                to="/become-an-instructor"
              >
                Teach on Clara
              </Link>
            )}
            {isAuth && (
              <Link
                className="text-sm font-medium transition-colors text-white/80 hover:text-white hover:border-b-2 hover:border-white"
                to={userIsAdmin ? '/admin/dashboard' : '/student/dashboard'}
              >
                {userIsAdmin ? 'Admin Panel' : 'My Learning'}
              </Link>
            )}

            <div
              onClick={(e) => {
                e.preventDefault()
                toggleMiniCart()
              }}
              className="relative p-2 rounded-full transition-colors group cursor-pointer hover:bg-white/10"
              aria-label="Toggle Shopping Cart"
              role="button"
              tabIndex={0}
            >
              <ShoppingCart
                className="h-5 w-5 transition-colors text-white"
              />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm animate-in zoom-in duration-300">
                  {cartItemCount}
                </span>
              )}
            </div>
          </nav>

          {!isAuth ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/login">Log in</Link>
              </Button>
              <Button
                asChild
                variant="cta"
                className="rounded-xl"
              >
                <Link to="/login">Mulai Belajar</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 ring-2 ring-primary/10 hover:ring-primary/30 transition-all"
                  aria-label="User Profile Menu"
                >
                  <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage
                      src={(user?.profile?.avatar_url || user?.avatar_url) || undefined}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mt-2 rounded-2xl p-2 shadow-2xl"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal px-2 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black leading-none">
                      {user?.profile?.display_name || user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground font-medium">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem
                  asChild
                  className="rounded-xl px-3 py-2.5 cursor-pointer gap-2"
                >
                  <Link to="/student/profile">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="font-bold text-xs uppercase tracking-widest">
                      My Profile
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-xl px-3 py-2.5 cursor-pointer gap-2"
                >
                  <Link to="/student/settings">
                    <Settings2 className="h-4 w-4 text-slate-500" />
                    <span className="font-bold text-xs uppercase tracking-widest">
                      Account Settings
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-xl px-3 py-2.5 cursor-pointer gap-2"
                >
                  <Link to={userIsAdmin ? '/admin/dashboard' : '/student/dashboard'}>
                    <LayoutDashboard className="h-4 w-4 text-slate-500" />
                    <span className="font-bold text-xs uppercase tracking-widest">
                      {userIsAdmin ? 'Admin Dashboard' : 'Learning Portal'}
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2.5 cursor-pointer gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-black text-xs uppercase tracking-widest">
                    Logout Session
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                  aria-label="Toggle Navigation Menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-[400px]" side="right">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-8 py-6 h-full overflow-y-auto no-scrollbar pb-12 px-2">
                  <Link
                    className="text-2xl font-bold italic text-primary flex items-center gap-2"
                    to="/"
                  >
                    {profile?.logo?.url ? (
                      <img
                        src={profile.logo.url}
                        alt={profile.name || 'Logo'}
                        className="h-10 w-auto object-contain"
                      />
                    ) : profile?.logo_dark?.url ? (
                      <img
                        src={profile.logo_dark.url}
                        alt={profile.name || 'Logo'}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <span>{profile?.name?.toUpperCase() || 'CLARA LEARN'}</span>
                    )}
                  </Link>
                  <div className="flex flex-col gap-4">
                    <form
                      className="relative w-full group"
                      onSubmit={handleSearch}
                    >
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        className="w-full bg-muted/50 pl-11 h-12 rounded-xl border-transparent focus-visible:ring-primary/20 transition-all text-base"
                        placeholder="Search courses..."
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </form>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">
                      Most Popular
                    </h3>
                    <div className="flex flex-col">
                      {categories?.map((cat) => (
                        <Link
                          key={cat.id}
                          className="text-base font-bold text-slate-700 hover:text-primary transition-colors py-3.5 border-b border-slate-100 last:border-0 flex items-center justify-between group"
                          to="/search"
                          search={{ category: cat.slug }}
                        >
                          {cat.name}
                          <ChevronRight className="size-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-6 mt-auto">
                    <div className="flex flex-col gap-3">
                      {canApplyInstructor && (
                        <Button
                          asChild
                          className="w-full justify-start gap-3 rounded-xl border-white/20 hover:bg-white/10 h-12 text-base font-bold"
                          variant="outline"
                        >
                          <Link to="/become-an-instructor">
                            Teach on Clara
                          </Link>
                        </Button>
                      )}
                      {isAuth ? (
                        <>
                          <Button
                            asChild
                            className="w-full justify-start gap-3 rounded-xl h-12 text-base"
                            variant="outline"
                          >
                            <Link to="/student/profile">
                              <User className="h-4 w-4" /> My Profile
                            </Link>
                          </Button>
                          <Button
                            asChild
                            className="w-full justify-start gap-3 rounded-xl h-12 text-base"
                            variant="outline"
                          >
                            <Link to="/student/settings">
                              <Settings2 className="h-4 w-4" /> Account Settings
                            </Link>
                          </Button>
                          <Button
                            asChild
                            className="w-full justify-start gap-3 rounded-xl h-12 text-base"
                            variant="outline"
                          >
                            <Link to="/cart">
                              <ShoppingCart className="h-4 w-4" /> My Cart
                              {cartItemCount > 0 && (
                                <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {cartItemCount}
                                </span>
                              )}
                            </Link>
                          </Button>
                          <Button
                            asChild
                            className="w-full justify-start gap-3 rounded-xl h-12 text-base"
                            variant="outline"
                          >
                            <Link to={userIsAdmin ? '/admin/dashboard' : '/student/dashboard'}>
                              <LayoutDashboard className="h-4 w-4" />{' '}
                              {userIsAdmin ? 'Admin Panel' : 'Learning Portal'}
                            </Link>
                          </Button>
                          <Button
                            onClick={handleLogout}
                            className="w-full justify-start gap-3 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border-none h-12 text-base"
                          >
                            <LogOut className="h-4 w-4" /> Logout Session
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild className="w-full h-12 text-base rounded-xl" variant="outline">
                            <Link to="/login">Log in</Link>
                          </Button>
                          <Button asChild className="w-full h-12 text-base rounded-xl">
                            <Link to="/login">Sign up</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <MiniCart />
    </header>
  )
}
