import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getUser, can } from '@/lib/auth'
import { BookOpen, HelpCircle, MessageSquare, Paperclip, Megaphone, CheckCircle, Ticket, Wallet, Star, KeyRound, Users, FileCheck } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { useGuideLang } from '@/hooks/use-guide-lang'

export const Route = createFileRoute('/admin/guide/')({
  component: GuideLandingPage,
})

const topics = [
  {
    id: 'course-management',
    url: '/admin/guide/course',
    icon: BookOpen,
    title: {
      id: 'Manajemen Kursus',
      en: 'Course Management',
    },
    description: {
      id: 'Panduan lengkap membuat dan mengelola konten kursus, modul, materi, kuis, dan diskusi.',
      en: 'Complete guide to creating and managing course content, modules, lessons, quizzes, and discussions.',
    },
  },
  {
    id: 'promotion-coupon',
    url: '/admin/guide/promotion',
    icon: Ticket,
    title: {
      id: 'Promosi & Kupon',
      en: 'Promotion & Coupon',
    },
    description: {
      id: 'Panduan membuat promosi berbatas waktu dan kode kupon diskon untuk siswa.',
      en: 'Guide to creating time-limited promotions and discount coupon codes for students.',
    },
  },
  {
    id: 'withdrawal',
    url: '/admin/guide/withdrawal',
    icon: Wallet,
    title: {
      id: 'Penarikan Dana',
      en: 'Withdrawal',
    },
    description: {
      id: 'Panduan proses penarikan pendapatan instruktur dan pencairan dana.',
      en: 'Guide to the instructor revenue withdrawal process and fund payouts.',
    },
  },
  {
    id: 'featured-course',
    url: '/admin/guide/featured-course',
    icon: Star,
    roles: ['Super Admin', 'Admin'],
    title: {
      id: 'Kursus Unggulan',
      en: 'Featured Courses',
    },
    description: {
      id: 'Panduan mengatur daftar kursus unggulan pilihan yang akan ditampilkan di halaman utama.',
      en: 'Guide to managing the selected featured courses list displayed on the homepage.',
    },
  },
  {
    id: 'user-password',
    url: '/admin/guide/user-password',
    icon: KeyRound,
    title: {
      id: 'Kata Sandi Pengguna',
      en: 'User Password',
    },
    description: {
      id: 'Pelajari cara mengubah kata sandi atau apa yang harus dilakukan jika Anda lupa kata sandi.',
      en: 'Learn how to change your password or what to do if you forget it.',
    },
  },
  {
    id: 'user-management',
    url: '/admin/guide/user-management',
    icon: Users,
    roles: ['Super Admin', 'Admin'],
    title: {
      id: 'Manajemen Pengguna',
      en: 'User Management',
    },
    description: {
      id: 'Panduan mengelola profil pengguna, mengatur peran (roles), dan mengonfigurasi perizinan.',
      en: 'Guide to managing user profiles, setting roles, and configuring permissions.',
    },
  },
  {
    id: 'instructor-application',
    url: '/admin/guide/instructor-application',
    icon: FileCheck,
    roles: ['Super Admin', 'Admin'],
    title: {
      id: 'Pendaftar Instruktur',
      en: 'Instructor Applicants',
    },
    description: {
      id: 'Cara meninjau dan menyetujui pendaftaran pengguna yang ingin menjadi instruktur.',
      en: 'How to review and approve applications from users who want to become instructors.',
    },
  },
  {
    id: 'quizzes',
    url: '/admin/guide/quiz',
    icon: HelpCircle,
    title: {
      id: 'Kuis',
      en: 'Quizzes',
    },
    description: {
      id: 'Panduan membuat soal pilihan ganda dan mengatur kuis untuk siswa.',
      en: 'Guide to creating multiple-choice questions and managing quizzes for students.',
    },
  },
]

function GuideLandingPage() {
  const [lang] = useGuideLang()
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredTopics = topics.filter((topic) => {
    // Role & Permission Check
    const hasRoles = !!(topic as any).roles
    let allowed = true
    
    if (hasRoles) {
      const user = getUser()
      const isSuperAdmin = can('super.admin', user) || can('manage_all', user)
      
      if (!isSuperAdmin) {
        allowed = false
        if (user?.roles) {
          allowed = user.roles.some((role: any) =>
            (topic as any).roles.includes(
              typeof role === 'string' ? role : role.name,
            ),
          )
        }
      }
    }
    
    if (!allowed) return false

    const query = searchQuery.toLowerCase()
    return (
      topic.title[lang].toLowerCase().includes(query) ||
      topic.description[lang].toLowerCase().includes(query)
    )
  })

  return (
    <AdminPage>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'id' ? 'Pusat Panduan' : 'Help Center'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === 'id' 
              ? 'Pelajari cara menggunakan setiap fitur untuk mengelola kursus Anda dengan maksimal.' 
              : 'Learn how to use every feature to manage your courses effectively.'}
          </p>
        </div>
        <GuideLanguageToggle />
      </div>

      <div className="mb-8">
        <div className="relative max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder={lang === 'id' ? 'Cari panduan...' : 'Search guides...'}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => {
            const Icon = topic.icon
            return (
              <Link key={topic.id} to={topic.url} className="group outline-none">
                <Card className="h-full border-border/50 bg-card transition-all duration-300 hover:shadow-md hover:border-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-primary">
                  <CardHeader className="pb-4">
                    <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="size-6" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {topic.title[lang]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-6">
                      {topic.description[lang]}
                    </CardDescription>
                    <div className="text-sm font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                      {lang === 'id' ? 'Baca Panduan' : 'Read Guide'}
                      <span aria-hidden="true">&rarr;</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full py-12 text-center border rounded-xl border-dashed">
            <p className="text-muted-foreground">
              {lang === 'id' ? 'Tidak ada panduan yang ditemukan.' : 'No guides found.'}
            </p>
          </div>
        )}
      </div>
    </AdminPage>
  )
}
