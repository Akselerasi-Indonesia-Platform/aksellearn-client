import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Star, ChevronRight, Search, ListPlus, GripVertical, CheckCircle, Info } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { GuideStep } from '@/components/admin/guide/guide-step'
import { GuideTip } from '@/components/admin/guide/guide-tip'
import { GuideFeedback } from '@/components/admin/guide/guide-feedback'
import { useGuideLang } from '@/hooks/use-guide-lang'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type FeaturedCourseGuideSearch = {
  tab?: string
}

export const Route = createFileRoute('/admin/guide/featured-course/')({
  validateSearch: (search: Record<string, unknown>): FeaturedCourseGuideSearch => {
    return {
      tab: typeof search.tab === 'string' ? search.tab : 'overview',
    }
  },
  component: FeaturedCourseGuidePage,
})

function FeaturedCourseGuidePage() {
  const [lang] = useGuideLang()
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()

  const handleTabChange = (value: string) => {
    navigate({ search: { tab: value }, replace: true })
  }

  return (
    <AdminPage>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link to="/admin/guide" className="hover:text-foreground transition-colors">
          {lang === 'id' ? 'Panduan' : 'Guide'}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-medium">
          {lang === 'id' ? 'Kursus Unggulan' : 'Featured Course'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'id' ? 'Panduan Kursus Unggulan' : 'Featured Course Guide'}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {lang === 'id'
              ? 'Pelajari cara memilih dan mengatur kursus unggulan yang akan ditampilkan di halaman utama untuk menarik lebih banyak siswa.'
              : 'Learn how to select and organize featured courses that will be displayed on the homepage to attract more students.'}
          </p>
        </div>
        <GuideLanguageToggle />
      </div>

      <Tabs value={tab || 'overview'} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8 flex flex-wrap h-auto w-full justify-start bg-transparent p-0 gap-2">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <Info className="size-4 mr-2" />
            {lang === 'id' ? 'Pengenalan' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <Star className="size-4 mr-2" />
            {lang === 'id' ? 'Kelola Unggulan' : 'Manage Featured'}
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Apa itu Kursus Unggulan?' : 'What is a Featured Course?'}
            description={
              lang === 'id'
                ? 'Kursus Unggulan (Featured Course) adalah daftar kursus pilihan Admin yang akan ditampilkan secara khusus di halaman utama (homepage) platform. Ini adalah alat marketing yang sangat kuat untuk menyorot kursus terbaik atau kursus baru Anda.'
                : 'Featured Courses are Admin-selected courses that are prominently displayed on the platform\'s homepage. It is a powerful marketing tool to highlight your best or newest courses.'
            }
          >
            <div className="p-6 bg-card flex flex-col gap-5 border-b">
              <div className="flex items-center gap-4 p-4 bg-muted/20 border rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Star className="size-6 fill-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{lang === 'id' ? 'Meningkatkan Visibilitas' : 'Increases Visibility'}</p>
                  <p className="text-sm text-muted-foreground">{lang === 'id' ? 'Kursus di daftar ini akan dilihat oleh semua pengunjung website Anda.' : 'Courses in this list will be seen by all visitors to your website.'}</p>
                </div>
              </div>
            </div>
            <GuideTip type="info" className="m-4 border-none">
              {lang === 'id'
                ? 'Fitur ini HANYA dapat diakses oleh Administrator. Instruktur tidak dapat mengatur kursusnya sendiri menjadi unggulan.'
                : 'This feature can ONLY be accessed by Administrators. Instructors cannot set their own courses as featured.'}
            </GuideTip>
          </GuideStep>
        </TabsContent>

        {/* MANAGE TAB */}
        <TabsContent value="manage" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Pencarian & Penambahan' : 'Search & Add'}
            description={
              lang === 'id'
                ? 'Di halaman "Featured Courses", gunakan kolom pencarian untuk mencari kursus berdasarkan nama atau kategori. Klik kursus dari hasil pencarian untuk menambahkannya ke dalam daftar unggulan.'
                : 'On the "Featured Courses" page, use the search bar to find courses by name or category. Click a course from the search results to add it to the featured list.'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="flex items-center gap-3 border rounded-md p-3 bg-background shadow-sm max-w-md">
                <Search className="size-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{lang === 'id' ? 'Cari kursus terbaik...' : 'Search for the best courses...'}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                <ListPlus className="size-4" />
                {lang === 'id' ? 'Klik pada hasil untuk menambahkan' : 'Click on results to add'}
              </div>
            </div>
          </GuideStep>
          
          <GuideStep
            step={2}
            title={lang === 'id' ? 'Mengatur Urutan Tampilan' : 'Reordering Display Order'}
            description={
              lang === 'id'
                ? 'Setelah kursus ditambahkan ke daftar, Anda dapat mengatur urutannya. Klik dan tahan ikon "Grip" (titik enam) di sebelah kiri kursus, lalu geser (drag & drop) ke atas atau ke bawah. Urutan pertama akan muncul paling depan di website.'
                : 'Once courses are added to the list, you can arrange their order. Click and hold the "Grip" icon (six dots) on the left of the course, then drag and drop it up or down. The first in the list will appear first on the website.'
            }
          >
            <div className="p-6 bg-card flex flex-col gap-2 border-b">
              <div className="flex items-center gap-3 border rounded-md p-3 bg-background hover:border-primary/50 cursor-move transition-colors shadow-sm max-w-md">
                <GripVertical className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">1. React Complete Bootcamp</span>
              </div>
              <div className="flex items-center gap-3 border rounded-md p-3 bg-background hover:border-primary/50 cursor-move transition-colors max-w-md">
                <GripVertical className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">2. UI/UX Masterclass</span>
              </div>
            </div>
          </GuideStep>

          <GuideStep
            step={3}
            title={lang === 'id' ? 'Menyimpan Perubahan' : 'Saving Changes'}
            description={
              lang === 'id'
                ? 'Perubahan yang Anda lakukan (menambah, menghapus, atau mengubah urutan) tidak akan langsung diterapkan. Anda HARUS mengklik tombol "Simpan Urutan" di pojok kanan atas untuk mempublikasikannya ke halaman utama.'
                : 'Changes you make (adding, removing, or reordering) are not applied immediately. You MUST click the "Save Order" button in the top right corner to publish them to the homepage.'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="flex items-center gap-3 border rounded-md p-4 bg-emerald-50 max-w-sm text-emerald-800 border-emerald-200">
                <CheckCircle className="size-6 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{lang === 'id' ? 'Klik "Simpan Urutan"' : 'Click "Save Order"'}</span>
                  <span className="text-xs opacity-80">{lang === 'id' ? 'Untuk memperbarui tampilan website' : 'To update the website display'}</span>
                </div>
              </div>
            </div>
            <GuideTip type="tip" className="m-4 border-none">
              {lang === 'id'
                ? 'Sebaiknya batasi jumlah kursus unggulan maksimal 6-8 kursus agar tampilan halaman utama tetap rapi dan fokus.'
                : 'It is best to limit the number of featured courses to a maximum of 6-8 courses to keep the homepage neat and focused.'}
            </GuideTip>
          </GuideStep>
        </TabsContent>
      </Tabs>

      <GuideFeedback className="mt-16" />
    </AdminPage>
  )
}
