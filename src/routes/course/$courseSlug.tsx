import * as React from 'react'
import {
  createFileRoute,
  useNavigate,
  useParams,
  Link,
} from '@tanstack/react-router'
import { format } from 'date-fns'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Users,
  PlayCircle,
  Clock,
  CheckCircle,
  ShoppingBag,
  ChevronRight,
  ChevronDown,
  Heart,
  ShieldCheck,
  Globe,
  Lock,
  Award,
  BookOpen,
  Loader2,
  AlertCircle,
  FileText,
  FileArchive,
  File,
  Download,
  Paperclip,
  Link2,
  Linkedin,
  GraduationCap,
  MessageSquare,
  Trophy,
  Infinity,
  Smartphone,
  Video,
  ThumbsUp,
  ThumbsDown,
  CalendarDays,
  UserCircle,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react'

import { discoveryCourseService } from '@/services/discovery/course.service'
import { userCourseService } from '@/services/user/course.service'
import { userWishlistService } from '@/services/user/wishlist.service'
import { userPaymentService } from '@/services/user/payment.service'
import { authService } from '@/services/auth.service'
import { useCart } from '@/hooks/use-cart'
import { useRequireVerification } from '@/hooks/use-require-verification'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { toast } from 'sonner'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import { useAuthStore } from '@/hooks/use-auth'
import { cn, formatCurrency } from '@/lib/utils'
import { CourseCard } from '@/components/public/ui/course-card'

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-orange-100 text-orange-700',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function RelativeDate({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return <span>just now</span>
  if (diff < 3600) return <span>{Math.floor(diff / 60)} min ago</span>
  if (diff < 86400) return <span>{Math.floor(diff / 3600)} hr ago</span>
  if (diff < 2592000) return <span>{Math.floor(diff / 86400)} days ago</span>
  if (diff < 31536000) return <span>{Math.floor(diff / 2592000)} mo. ago</span>
  return <span>{Math.floor(diff / 31536000)} yr ago</span>
}

function InstructorBio({ bio }: { bio: string }) {
  const [expanded, setExpanded] = React.useState(false)
  const isLong = bio.length > 300
  return (
    <div className="space-y-2">
      <p
        className={cn(
          'text-slate-600 leading-relaxed font-medium text-sm whitespace-pre-wrap break-words',
          !expanded && isLong && 'line-clamp-4'
        )}
      >
        {bio}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-bold text-[#056FAE] hover:underline flex items-center gap-1"
        >
          {expanded ? 'Show less' : 'Show more'}
          <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
    </div>
  )
}

function SyllabusAccordion({ modules }: { modules: any[] }) {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [allOpen, setAllOpen] = React.useState(false)
  const expandedIds = allOpen ? modules.map((m) => m.id) : openId ? [openId] : []

  const toggle = (id: string) => {
    if (allOpen) {
      setAllOpen(false)
      setOpenId(openId === id ? null : id)
    } else {
      setOpenId((prev) => (prev === id ? null : id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Course content</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            {modules.length} sections
          </span>
          <button
            onClick={() => { setAllOpen((v) => !v); setOpenId(null) }}
            className="text-xs font-bold text-[#056FAE] hover:underline"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white divide-y divide-slate-100">
        {modules.map((m: any, i: number) => {
          const isOpen = expandedIds.includes(m.id)
          const hasLessons = m.lessons && m.lessons.length > 0
          return (
            <div key={m.id}>
              <button
                onClick={() => hasLessons && toggle(m.id)}
                className={cn(
                  'w-full px-5 py-4 flex items-center justify-between group transition-colors text-left',
                  hasLessons ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                )}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-xs font-black text-slate-300 w-5 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <h4 className={cn(
                      'font-semibold text-sm transition-colors truncate',
                      isOpen ? 'text-[#056FAE]' : 'text-slate-800 group-hover:text-[#056FAE]'
                    )}>
                      {m.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 capitalize">{m.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {m.lessons_count ? (
                    <span className="text-[11px] font-bold text-slate-400">{m.lessons_count} lessons</span>
                  ) : null}
                  {m.type === 'lesson' ? (
                    <PlayCircle className={cn('size-4 transition-colors', isOpen ? 'text-[#056FAE]' : 'text-slate-300 group-hover:text-[#056FAE]')} />
                  ) : m.type === 'quiz' ? (
                    <Trophy className={cn('size-4 transition-colors', isOpen ? 'text-amber-500' : 'text-slate-300 group-hover:text-amber-500')} />
                  ) : (
                    <BookOpen className="size-4 text-slate-300" />
                  )}
                  {hasLessons && (
                    <ChevronDown className={cn('size-4 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
                  )}
                </div>
              </button>

              {/* Expandable lesson list */}
              {hasLessons && (
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="lessons"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden bg-slate-50/60 border-t border-slate-100"
                    >
                      <div className="px-5 py-2 divide-y divide-slate-100">
                        {m.lessons.map((lesson: any, li: number) => (
                          <div key={lesson.id || li} className="flex items-center gap-3 py-2.5">
                            <PlayCircle className="size-3.5 text-slate-300 shrink-0" />
                            <span className="text-xs font-medium text-slate-600 flex-1 truncate">{lesson.title}</span>
                            {lesson.duration && (
                              <span className="text-[11px] text-slate-400 font-mono shrink-0">{lesson.duration}</span>
                            )}
                            {lesson.is_preview && (
                              <span className="text-[10px] font-bold text-[#2AABAA] uppercase tracking-widest">Preview</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CoursePublicDetails() {
  const { courseSlug } = useParams({ from: '/course/$courseSlug' })
  const navigate = useNavigate()
  const authenticated = isAuthenticated()
  const isUserAdmin = authenticated && isAdmin()
  
  const user = useAuthStore((state) => state.user)
  const needsEmailVerification = !!user && !user.email_verified_at
  const { verifyAndProceed } = useRequireVerification()

  const idempotencyKey = React.useMemo(() => crypto.randomUUID(), [])

  const [isPollingEnrollment, setIsPollingEnrollment] = React.useState(false)

  // 1. Fetch Course Public Data
  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public', 'course', courseSlug],
    queryFn: () => discoveryCourseService.getDetails(courseSlug),
    refetchInterval: isPollingEnrollment ? 1000 : false,
  })

  // 2. Check Enrollment if Authenticated
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user', 'enrollments'],
    queryFn: () => userCourseService.getAll().then((res) => res.data || []),
    enabled: authenticated,
  })

  // 3. Fetch Related Courses
  const { data: relatedCourses = [] } = useQuery({
    queryKey: ['public', 'course', course?.uuid, 'related'],
    queryFn: () => discoveryCourseService.getRelatedCourses(course!.uuid),
    enabled: !!course?.uuid,
  })

  const isEnrolled = React.useMemo(() => {
    if (course?.is_enrolled) return true
    if (!course?.uuid) return false
    return enrollments.some((e: any) => e.uuid === course.uuid || e.id === course.uuid)
  }, [enrollments, course?.uuid, course?.is_enrolled])

  const { addToCart, isAdding } = useCart()

  const handleAddToCart = () => {
    if (!authenticated) {
      navigate({
        to: '/login',
        search: { redirect: `/student/learn/${course?.uuid}` },
      })
      return
    }
    if (!course?.uuid) return
    verifyAndProceed(() => {
      addToCart({ id: course.uuid as string, type: 'course', quantity: 1 })
    })
  }

  const { mutate: handleFreeEnroll, isPending: isEnrollingFree } = useMutation({
    mutationFn: async () => {
      if (!course?.id) throw new Error('Course not found')
      return userPaymentService.checkoutDirect({
        purchasable_type: 'courses',
        purchasable_id: course.id,
      }, idempotencyKey)
    },
    onSuccess: () => {
      setIsPollingEnrollment(true)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to enroll. Please try again.')
    },
  })

  React.useEffect(() => {
    if (isPollingEnrollment && course?.is_enrolled) {
      setIsPollingEnrollment(false)
      toast.success('Enrolled successfully!')
      if (course?.uuid) {
        navigate({
          to: '/student/learn/$courseUuid',
          params: { courseUuid: course.uuid },
        })
      }
    }
  }, [course?.is_enrolled, isPollingEnrollment, navigate, course?.uuid])

  const [couponInput, setCouponInput] = React.useState('')
  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      localStorage.setItem('active_coupon', couponInput.trim())
      navigate({ to: '/cart' })
    }
  }

  const { data: wishlist = [], refetch: refetchWishlist } = useQuery({
    queryKey: ['user', 'wishlist'],
    queryFn: () => userWishlistService.getWishlist(),
    enabled: authenticated,
  })

  const wishlistItem = Array.isArray(wishlist) ? wishlist.find(
    (w: any) =>
      w.purchasable_type === 'courses' && w.purchasable_id === course?.id,
  ) : undefined
  const isInWishlist = !!wishlistItem

  const toggleWishlist = async () => {
    if (!authenticated) {
      navigate({ to: '/login' })
      return
    }

    try {
      if (isInWishlist && wishlistItem) {
        await userWishlistService.removeItem(wishlistItem.id)
      } else if (course?.id) {
        await userWishlistService.addItem(course.id)
      }
      refetchWishlist()
    } catch (err) {
      // handled globally or let fail
    }
  }

  const enrollmentData = React.useMemo(() => {
    return enrollments.find((e: any) => e.uuid === course?.uuid || e.id === course?.uuid)
  }, [enrollments, course?.uuid])

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="pt-32 pb-20 bg-slate-900">
          <div className="container mx-auto px-4 animate-in fade-in duration-300">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-8 space-y-8">
                <Skeleton className="h-6 w-24 rounded-full bg-slate-800" />
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full bg-slate-800" />
                    <Skeleton className="h-12 w-3/4 bg-slate-800" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-full bg-slate-800" />
                    <Skeleton className="h-6 w-5/6 bg-slate-800" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-32 bg-slate-800" />
                  <Skeleton className="h-6 w-32 bg-slate-800" />
                </div>
              </div>
              <div className="lg:col-span-4 relative">
                <div className="bg-white rounded-2xl p-2 shadow-2xl shadow-indigo-500/20">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-1/2" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-14 w-full rounded-2xl" />
                        <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (isError || !course) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-32 text-center space-y-6">
          <div className="size-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle className="size-10" />
          </div>
          <h2 className="text-3xl font-black">Course Unavailable</h2>
          <p className="text-muted-foreground">
            This curriculum is currently not broadcasted or has been archived.
          </p>
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            Back to Home
          </Button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Breadcrumbs */}
      <div className="bg-white py-4 border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
             <Link to="/" className="text-[#056FAE] hover:underline whitespace-nowrap">Home</Link>
             <ChevronRight className="size-4 text-slate-400 shrink-0" />
             <Link to="/search" className="text-[#056FAE] hover:underline whitespace-nowrap">Courses</Link>
             <ChevronRight className="size-4 text-slate-400 shrink-0" />
             <span className="text-slate-500 truncate">{course.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10" />
          <img
            src={course.thumbnail || undefined}
            className="w-full h-full object-cover blur-sm scale-110"
            alt=""
            fetchPriority="high"
          />
        </div>

        <div className="container relative z-20 mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/20 text-primary border-none font-bold px-3 py-1 text-[11px] uppercase tracking-wider">
                  {course.category?.name || 'Development'}
                </Badge>
                {course.badge_text && (
                    <Badge
                        variant="outline"
                        className="text-white border-white/20 font-bold px-3 py-1 text-[11px] uppercase tracking-wider bg-white/5"
                    >
                        {course.badge_text}
                    </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-lg">
                    {course.summary?.stats?.average_rating}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">
                    ({course.summary?.stats?.total_reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-slate-400" />
                  <span className="font-semibold text-slate-200">
                    {course.summary?.stats?.total_students?.toLocaleString()} students
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-400">
                <div className="flex items-center gap-2">
                  <PlayCircle className="size-4" />
                  <span>
                    {course.summary?.stats?.total_videos ||
                      course.summary?.stats?.total_lessons ||
                      course.summary?.stats?.total_modules ||
                      0}{' '}
                    lectures
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{course.summary?.stats?.total_duration_human_full} total length</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="size-4" />
                  <span>English & Indonesian</span>
                </div>
                {course.summary?.stats?.total_modules ? (
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4" />
                    <span>{course.summary?.stats?.total_modules} Modules</span>
                  </div>
                ) : null}
                {course.summary?.stats?.total_quizzes ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Award className="size-4" />
                    <span>Includes Quiz</span>
                  </div>
                ) : null}
                {course.certificate_config && course.certificate_config.title ? (
                  <div className="flex items-center gap-2 text-indigo-400">
                    <ShieldCheck className="size-4" />
                    <span>Certificate of Completion</span>
                  </div>
                ) : null}
              </div>

              {/* FE-10: Created by instructor link + FE-01: Last Updated */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {course.instructor && (
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <UserCircle className="size-4" />
                    <span>Created by</span>
                    <a
                      href="#instructor-section"
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById('instructor-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className="text-[#2AABAA] font-bold hover:underline"
                    >
                      {course.instructor.name}
                    </a>
                  </div>
                )}
                {(course as any).last_updated_at && (
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <CalendarDays className="size-4" />
                    <span>Last updated: {format(new Date((course as any).last_updated_at), 'MMMM yyyy')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1], // custom easeOutExpo
                  delay: 0.2 
                }}
                className="bg-white rounded-2xl p-2 shadow-2xl shadow-indigo-500/20 group relative overflow-hidden"
              >
                <div className="aspect-video relative overflow-hidden rounded-xl isolate">
                  <motion.img
                    src={course.thumbnail || undefined}
                    className="w-full h-full object-cover"
                    alt={course.title}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                  />
                  <motion.div 
                    initial={false}
                    className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  >
                    <div className="size-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                      <PlayCircle className="size-10 text-white" />
                    </div>
                  </motion.div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {course.access_duration_days
                          ? `${course.access_duration_days} Days Access`
                          : 'Full Access'}
                      </p>
                      <div className="flex items-baseline gap-2">
                        {course.price_discount !== null && course.price_discount !== undefined && course.price_discount < (course.price || 0) ? (
                          <>
                            <span className="text-4xl font-black text-slate-900 tracking-tight">
                              {formatCurrency(course.price_discount)}
                            </span>
                            <span className="text-slate-400 line-through font-bold text-lg">
                              {formatCurrency(course.price || 0)}
                            </span>
                          </>
                        ) : (
                          <span className="text-4xl font-black text-slate-900 tracking-tight">
                            {formatCurrency(course.price || 0)}
                          </span>
                        )}
                      </div>
                    </div>
                    {(() => {
                      const finalPrice = course.price_discount !== null && course.price_discount !== undefined && course.price_discount < (course.price || 0) ? course.price_discount : (course.price || 0)
                      const basePrice = course.price || 0
                      if (basePrice > finalPrice && finalPrice > 0) {
                        return (
                          <Badge className="bg-emerald-500 hover:bg-emerald-500 text-[10px] font-bold rounded-lg px-2">
                            {Math.round((1 - finalPrice / basePrice) * 100)}% OFF
                          </Badge>
                        )
                      }
                      return null
                    })()}
                  </div>

                  <div className="space-y-3">
                    {isUserAdmin ? (
                      <div className="space-y-4">
                        <Button
                          disabled
                          className="w-full h-14 rounded-2xl bg-slate-100 text-slate-400 text-sm font-bold uppercase tracking-widest border border-slate-200"
                        >
                          <ShieldCheck className="mr-2 size-4" /> Admin Access
                        </Button>
                        <p className="text-[10px] text-center font-bold text-slate-400 leading-relaxed">
                          Admins cannot enroll in courses or use the checkout system.
                          Please switch to a student account to test the purchase flow.
                        </p>
                      </div>
                    ) : isEnrolled && (course.access_duration_days || 0) <= 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between mb-2">
                               <Badge className="bg-[#2ECFB0]/15 text-[#0E7A6A] hover:bg-[#2ECFB0]/25 border-none font-bold uppercase tracking-widest text-[10px]">Course Progress</Badge>
                               <span className="text-xs font-bold text-slate-700">{enrollmentData?.progress_percentage || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#2AABAA] rounded-full transition-all duration-500" style={{ width: `${enrollmentData?.progress_percentage || 0}%` }} />
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-bold text-center w-full justify-center text-[11px] py-1">
                          You own this (Lifetime)
                        </Badge>
                        <Button
                          onClick={() =>
                            navigate({
                              to: '/student/learn/$courseUuid',
                              params: { courseUuid: course.uuid },
                            })
                          }
                          variant="card-enroll"
                          size="xl"
                          className="w-full rounded-xl text-lg font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:shadow-primary/30 gap-2"
                        >
                          Go to Classroom <ChevronRight className="size-5" />
                        </Button>
                      </div>
                    ) : isEnrolled && (course.access_duration_days || 0) > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between mb-2">
                               <Badge className="bg-[#2ECFB0]/15 text-[#0E7A6A] hover:bg-[#2ECFB0]/25 border-none font-bold uppercase tracking-widest text-[10px]">Course Progress</Badge>
                               <span className="text-xs font-bold text-slate-700">{enrollmentData?.progress_percentage || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#2AABAA] rounded-full transition-all duration-500" style={{ width: `${enrollmentData?.progress_percentage || 0}%` }} />
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-bold text-center w-full justify-center text-[11px] py-1">
                          {course.enrollment_expiry 
                            ? `Access until ${format(new Date(course.enrollment_expiry), 'MMM dd, yyyy')}`
                            : 'Lifetime Access'}
                        </Badge>
                        <Button
                          onClick={() =>
                            navigate({
                              to: '/student/learn/$courseUuid',
                              params: { courseUuid: course.uuid },
                            })
                          }
                          variant="outline"
                          size="xl"
                          className="w-full rounded-xl text-lg font-bold uppercase tracking-widest shadow-sm gap-2 text-slate-800 hover:text-slate-900 border-slate-200"
                        >
                          Go to Classroom <ChevronRight className="size-5" />
                        </Button>
                        {course.enrollment_expiry && (
                          <div className="grid gap-3 pt-4 border-t border-slate-100">
                            <Button
                              onClick={handleAddToCart}
                              disabled={isAdding || isLoading || !course}
                              variant="card-enroll"
                              size="xl"
                              className="w-full text-lg uppercase tracking-widest gap-2 shadow-lg hover:shadow-xl hover:shadow-primary/30"
                            >
                              {isAdding || isLoading ? (
                                <Loader2 className="size-5 animate-spin" />
                              ) : (
                                <ShoppingBag className="size-5" />
                              )}
                              Extend Access
                            </Button>
                            <p className="text-xs text-slate-500 text-center font-medium leading-relaxed">
                              Your current access expires on {format(new Date(course.enrollment_expiry), 'MMM dd, yyyy')}. 
                              Purchasing this will add an additional {course.access_duration_days} days to your access.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : course.is_corporate ? (
                      <div className="space-y-4">
                        <Button
                          disabled
                          className="w-full h-14 rounded-2xl bg-slate-100 text-slate-400 text-sm font-bold uppercase tracking-widest border border-slate-200"
                        >
                          <Lock className="mr-2 size-4" /> Corporate Access Only
                        </Button>
                        <p className="text-[10px] text-center font-bold text-slate-400 leading-relaxed">
                          This curriculum is reserved for enterprise partners.
                          <span className="text-primary underline cursor-pointer ml-1">
                            Learn how to enroll your team.
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {(() => {
                          const isFree = course.price_discount !== null && course.price_discount !== undefined && course.price_discount < (course.price || 0)
                            ? course.price_discount === 0 
                            : (course.price || 0) === 0
                          return (
                            <div className="flex flex-col gap-3">
                              {/* Checkout Now hidden per user request, only show Enroll for Free if course is free */}
                              {isFree && (
                                <Button
                                  onClick={() => {
                                    if (!authenticated) {
                                      navigate({
                                        to: '/login',
                                        search: { redirect: `/student/learn/${course?.uuid}` },
                                      })
                                      return
                                    }
                                    verifyAndProceed(() => handleFreeEnroll())
                                  }}
                                  disabled={isEnrollingFree || isPollingEnrollment || isLoading || !course}
                                  variant="commerce"
                                  size="xl"
                                  className="w-full text-lg uppercase tracking-widest gap-2 shadow-lg hover:shadow-xl hover:shadow-primary/30 h-14"
                                >
                                  {isEnrollingFree || isPollingEnrollment ? (
                                    <Loader2 className="size-5 animate-spin" />
                                  ) : null}
                                  {isEnrollingFree || isPollingEnrollment ? "Processing Enrollment..." : "Enroll for Free"}
                                </Button>
                              )}
                              {!isFree && (
                                <Button
                                  onClick={handleAddToCart}
                                  disabled={isAdding || isLoading || !course}
                                  variant="outline"
                                  size="xl"
                                  className="w-full text-slate-800 hover:text-slate-900 text-lg uppercase tracking-widest gap-2 h-14"
                                >
                                  {isAdding || isLoading ? (
                                    <Loader2 className="size-5 animate-spin" />
                                  ) : (
                                    <ShoppingBag className="size-5" />
                                  )}
                                  Add to Cart
                                </Button>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">
                    Avg. Lesson:{' '}
                    {course.summary?.stats?.average_video_duration_human || 'N/A'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Highlights */}
      <section className="py-24 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
              {/* What You'll Learn */}
              {course.what_you_will_learn &&
              course.what_you_will_learn.length > 0 ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight">
                    What you will learn
                  </h2>
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                    {course.what_you_will_learn.map((item: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <CheckCircle className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-medium leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Requirements
                  </h2>
                  <ul className="space-y-3">
                    {course.requirements.map((item: any, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-slate-600 font-medium"
                      >
                        <div className="size-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Who is this for */}
              {course.who_is_this_for && course.who_is_this_for.length > 0 ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Who this course is for
                  </h2>
                  <ul className="space-y-3">
                    {course.who_is_this_for.map((item: any, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-slate-600 font-medium"
                      >
                        <div className="size-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Syllabus — FE-03 Accordion */}
              {course.modules && course.modules.length > 0 ? (
                <SyllabusAccordion modules={course.modules} />
              ) : null}

              {/* Instructor Card — FE-10 anchor */}
              {course.instructor ? (
                <div id="instructor-section" className="space-y-6 pt-8 border-t border-slate-100">
                  <h2 className="text-2xl font-bold tracking-tight">Your Instructor</h2>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                    {/* Instructor header row */}
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-5">
                      <div className="shrink-0">
                        {course.instructor.profile?.avatar_url ? (
                          <img
                            src={course.instructor.profile.avatar_url}
                            alt={course.instructor.name}
                            className="size-20 rounded-full object-cover ring-2 ring-white ring-offset-2 ring-offset-slate-50 shadow-md"
                          />
                        ) : (
                          <div className="size-20 rounded-full bg-[#056FAE]/10 flex items-center justify-center text-[#056FAE] font-black text-2xl uppercase ring-2 ring-white ring-offset-2 ring-offset-slate-50 shadow-md">
                            {course.instructor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-slate-900">{course.instructor.name}</h3>
                        {course.instructor.profile?.headline && (
                          <p className="text-sm font-semibold text-[#056FAE] mt-0.5">{course.instructor.profile.headline}</p>
                        )}
                      </div>
                    </div>

                    {/* Stats chips row */}
                    {(course.instructor.average_rating || course.instructor.total_reviews || course.instructor.total_students || course.instructor.total_courses) && (
                      <div className="px-6 sm:px-8 pb-5 flex flex-wrap gap-5">
                        {course.instructor.average_rating && (
                          <div className="flex items-center gap-1.5">
                            <Star className="size-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-bold text-slate-700">{course.instructor.average_rating}</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Rating</span>
                          </div>
                        )}
                        {course.instructor.total_reviews && (
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="size-3.5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-700">{course.instructor.total_reviews?.toLocaleString()}</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Reviews</span>
                          </div>
                        )}
                        {course.instructor.total_students && (
                          <div className="flex items-center gap-1.5">
                            <Users className="size-3.5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-700">{course.instructor.total_students?.toLocaleString()}</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Students</span>
                          </div>
                        )}
                        {course.instructor.total_courses && (
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="size-3.5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-700">{course.instructor.total_courses}</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Courses</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Divider + Bio */}
                    {course.instructor.profile?.bio && (
                      <div className="px-6 sm:px-8 pb-6 border-t border-slate-100 pt-5">
                        <InstructorBio bio={course.instructor.profile.bio} />
                      </div>
                    )}

                    {/* LinkedIn */}
                    {course.instructor.profile?.linkedin_url && (
                      <div className="px-6 sm:px-8 pb-6">
                        <a
                          href={course.instructor.profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-[#0077B5] hover:underline"
                        >
                          <Linkedin className="size-4" />
                          View LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Sidebar - Consolidated Sticky Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">

                {/* Course Includes / Perks */}
                {course.what_you_will_get && course.what_you_will_get.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900 text-sm">This course includes</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {course.what_you_will_get.map((item: any, i: number) => {
                        const icons: any[] = [Video, Clock, Infinity, Smartphone, Award, ShieldCheck]
                        const Icon = icons[i % icons.length]
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <Icon className="size-4 text-[#056FAE] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-slate-600 leading-snug">{item}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Downloadable Resources */}
                {course.attachments && course.attachments.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                      <Paperclip className="size-3.5 text-slate-400" />
                      <h3 className="font-bold text-slate-900 text-sm">Resources</h3>
                      {!isEnrolled && (
                        <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
                          <Lock className="size-3" /> Enroll to unlock
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      {course.attachments.map((file: any) => {
                        const isPdf = file.media?.mime_type === 'application/pdf'
                        const isArchive = file.media?.mime_type?.includes('zip') || file.media?.mime_type?.includes('rar')
                        const Icon = isPdf ? FileText : isArchive ? FileArchive : File
                        return (
                          <div
                            key={file.uuid}
                            className={cn(
                              'flex items-center p-3 rounded-lg transition-all group',
                              isEnrolled
                                ? 'hover:bg-[#056FAE]/5 cursor-pointer border border-transparent hover:border-[#056FAE]/20'
                                : 'bg-slate-50 opacity-60 cursor-not-allowed border border-transparent'
                            )}
                            onClick={() => { if (isEnrolled && file.media?.url) window.open(file.media.url, '_blank') }}
                          >
                            <Icon className="size-4 text-slate-400 mr-3 shrink-0" />
                            <div className="flex-1 min-w-0 mr-2">
                              <p className="font-semibold text-xs text-slate-800 truncate">
                                {file.title}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {file.media?.size ? `${(file.media.size / 1024 / 1024).toFixed(2)} MB` : 'File'}
                              </p>
                            </div>
                            {isEnrolled
                              ? <Download className="size-3.5 text-slate-300 group-hover:text-[#056FAE]" />
                              : <Lock className="size-3.5 text-slate-300" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Share Row */}
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">SHARE</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      title="Copy link"
                      onClick={() => navigator.clipboard.writeText(window.location.href)}
                      className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#056FAE] hover:text-white transition-colors"
                    >
                      <Link2 className="size-4" />
                    </button>
                    <button
                      title="Share on Facebook"
                      onClick={() => window.open(`https://www.facebook.com/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1877F2] hover:text-white transition-colors"
                    >
                      <Facebook className="size-4" />
                    </button>
                    <button
                      title="Share on X"
                      onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-black hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                    <button
                      title="Share on WhatsApp"
                      onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#25D366] hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </button>
                    <button
                      title="Share on LinkedIn"
                      onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white transition-colors"
                    >
                      <Linkedin className="size-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {course.reviews && course.reviews.length > 0 ? (
        <section className="py-16 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-16">
              <div className="lg:col-span-8">
            {/* Section header + FE-05 aggregate rating */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-8 mb-10">
              <h2 className="text-2xl font-bold tracking-tight shrink-0">Student Reviews</h2>
              {(() => {
                const avgRating = course.summary?.stats?.average_rating
                if (!avgRating) return null
                const dist: Record<string, number> | undefined = (course.summary?.stats as any)?.rating_distribution
                return (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Big number + stars */}
                    <div className="flex items-center gap-3">
                      <span className="text-5xl font-black text-slate-900">{avgRating}</span>
                      <div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn('size-4', i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')} />
                          ))}
                        </div>
                        <p className="text-xs font-medium text-slate-400 mt-1">
                          {course.summary?.stats?.total_reviews?.toLocaleString()} reviews
                        </p>
                      </div>
                    </div>
                    {/* FE-05: Rating distribution bars (renders when BE-02 provides data) */}
                    {dist && (
                      <div className="space-y-1.5 flex-1 min-w-[180px]">
                        {([5, 4, 3, 2, 1] as const).map((star) => {
                          const pct = dist[String(star)] || 0
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <div className="flex gap-0.5 shrink-0">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={cn('size-2.5', i < star ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')} />
                                ))}
                              </div>
                              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 w-8 text-right shrink-0">{pct}%</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Review cards grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {course.reviews.map((review: any) => {
                const name = review.user?.name || 'Anonymous'
                const avatarColor = getAvatarColor(name)
                return (
                  <div key={review.uuid} className="p-6 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all space-y-4 bg-white">
                    <div className="flex items-start gap-3">
                      <div className={cn('size-10 rounded-full flex items-center justify-center font-bold text-sm uppercase shrink-0', avatarColor)}>
                        {name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{name}</h4>
                          {review.created_at && (
                            <span className="text-[11px] text-slate-400 font-medium shrink-0">
                              <RelativeDate dateStr={review.created_at} />
                            </span>
                          )}
                        </div>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i: number) => (
                            <Star key={i} className={cn('size-3', i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm line-clamp-4">
                      {review.comment}
                    </p>
                    {/* FE-06: Helpful? thumbs */}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs font-medium text-slate-400">Helpful?</span>
                      <button className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors">
                        <ThumbsUp className="size-3.5" />
                        <span className="text-xs font-medium">Yes</span>
                      </button>
                      <button className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors">
                        <ThumbsDown className="size-3.5" />
                        <span className="text-xs font-medium">No</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          </div>
          </div>
        </section>
      ) : null}

      {/* Related Courses — compact vertical list */}
      {relatedCourses && relatedCourses.length > 0 ? (
        <section className="py-14 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-16">
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Students also bought</h2>
                  <Link to="/search" className="text-sm font-bold text-[#056FAE] hover:underline">View all</Link>
                </div>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
              {relatedCourses.slice(0, 6).map((item: any) => (
                <Link
                  key={item.uuid}
                  to="/course/$courseSlug"
                  params={{ courseSlug: item.slug || item.uuid }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="size-5 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#056FAE] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    {item.instructor?.name && (
                      <p className="text-xs text-slate-400 font-medium mt-1">{item.instructor.name}</p>
                    )}
                    {item.summary?.stats?.average_rating ? (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-slate-600">{item.summary.stats.average_rating}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right ml-2">
                    {item.price_discount !== null && item.price_discount !== undefined && item.price_discount < (item.price || 0) ? (
                      <div>
                        <p className="text-sm font-black text-slate-900">{formatCurrency(item.price_discount)}</p>
                        <p className="text-xs line-through text-slate-400 font-medium">{formatCurrency(item.price)}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-black text-slate-900">{formatCurrency(item.price || 0)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

    </PublicLayout>
  )
}

export const Route = createFileRoute('/course/$courseSlug')({
  loader: async ({ params: { courseSlug } }) => {
    try {
      return await discoveryCourseService.getDetails(courseSlug)
    } catch (err) {
      return null
    }
  },
  head: ({ loaderData }: any) => {
    if (!loaderData) {
      return {
        meta: [
          {
            title: 'Course Not Found | Aksellearn',
          },
        ],
      }
    }

    const title = loaderData.meta_title || loaderData.title || 'Course Details'
    const description = loaderData.meta_description || loaderData.description || ''
    const imageUrl = loaderData.og_image_url || loaderData.thumbnail || ''

    return {
      meta: [
        {
          title: `${title} | Aksellearn`,
        },
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'og:image',
          content: imageUrl,
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: description,
        },
        {
          name: 'twitter:image',
          content: imageUrl,
        },
      ],
    }
  },
  component: CoursePublicDetails,
})
