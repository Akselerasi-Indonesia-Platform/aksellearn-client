import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, HelpCircle, MessageSquare, Paperclip, Megaphone, CheckCircle, Ticket } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { useGuideLang } from '@/hooks/use-guide-lang'

export const Route = createFileRoute('/admin/guide/')({
  component: GuideLandingPage,
})

const topics = [
  {
    id: 'course-content',
    url: '/admin/guide/course?tab=content',
    icon: BookOpen,
    title: {
      id: 'Konten Kursus',
      en: 'Course Content',
    },
    description: {
      id: 'Pelajari cara mengatur judul, deskripsi, harga, thumbnail, dan video promo kursus Anda.',
      en: 'Learn how to set up your course title, description, price, thumbnail, and promo video.',
    },
  },
  {
    id: 'course-module',
    url: '/admin/guide/course?tab=module',
    icon: CheckCircle,
    title: {
      id: 'Modul & Materi',
      en: 'Modules & Lessons',
    },
    description: {
      id: 'Cara membuat modul, menambahkan video pembelajaran, dan mengatur urutan materi kursus.',
      en: 'How to create modules, add video lessons, and arrange your course content order.',
    },
  },
  {
    id: 'course-quiz',
    url: '/admin/guide/course?tab=quiz',
    icon: HelpCircle,
    title: {
      id: 'Kuis & Ujian',
      en: 'Quizzes & Exams',
    },
    description: {
      id: 'Panduan membuat soal pilihan ganda, mengatur batas kelulusan, dan menyematkan kuis ke modul.',
      en: 'Guide to creating multiple-choice questions, setting passing scores, and attaching quizzes to modules.',
    },
  },
  {
    id: 'course-discussion',
    url: '/admin/guide/course?tab=discussion',
    icon: MessageSquare,
    title: {
      id: 'Diskusi & Komentar',
      en: 'Discussions & Comments',
    },
    description: {
      id: 'Cara merespons pertanyaan siswa dan mengelola forum diskusi di dalam kursus Anda.',
      en: 'How to respond to student questions and manage discussion forums within your course.',
    },
  },
  {
    id: 'course-attachment',
    url: '/admin/guide/course?tab=attachment',
    icon: Paperclip,
    title: {
      id: 'Lampiran & Dokumen',
      en: 'Attachments & Documents',
    },
    description: {
      id: 'Cara mengunggah materi tambahan seperti PDF, presentasi, atau source code untuk diunduh siswa.',
      en: 'How to upload supplementary materials like PDFs, presentations, or source code for students to download.',
    },
  },
  {
    id: 'course-announcement',
    url: '/admin/guide/course?tab=announcement',
    icon: Megaphone,
    title: {
      id: 'Pengumuman',
      en: 'Announcements',
    },
    description: {
      id: 'Cara membuat pengumuman penting yang akan dikirimkan sebagai notifikasi kepada semua siswa yang terdaftar.',
      en: 'How to create important announcements that will be sent as notifications to all enrolled students.',
    },
  },
  {
    id: 'marketing-promotion',
    url: '/admin/guide/promotion?tab=promotion',
    icon: Megaphone,
    title: {
      id: 'Promosi Spesial',
      en: 'Special Promotions',
    },
    description: {
      id: 'Panduan membuat promosi berbatas waktu dengan diskon persentase yang akan ditampilkan sebagai banner di halaman utama.',
      en: 'Guide to creating time-limited promotions with percentage discounts that will be displayed as banners on the homepage.',
    },
  },
  {
    id: 'marketing-coupon',
    url: '/admin/guide/promotion?tab=coupon',
    icon: Ticket,
    title: {
      id: 'Kupon Diskon',
      en: 'Discount Coupons',
    },
    description: {
      id: 'Cara membuat kode kupon (voucher) dengan nominal diskon tetap atau persentase untuk dibagikan kepada siswa tertentu.',
      en: 'How to create coupon codes (vouchers) with fixed or percentage discounts to share with specific students.',
    },
  },
]

function GuideLandingPage() {
  const [lang] = useGuideLang()
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredTopics = topics.filter((topic) => {
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
