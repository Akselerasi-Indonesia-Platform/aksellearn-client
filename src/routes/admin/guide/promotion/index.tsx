import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Megaphone, Ticket, ChevronRight, Percent, Calendar, Tag, CheckCircle } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { GuideStep } from '@/components/admin/guide/guide-step'
import { GuideTip } from '@/components/admin/guide/guide-tip'
import { GuideFeedback } from '@/components/admin/guide/guide-feedback'
import { useGuideLang } from '@/hooks/use-guide-lang'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type PromotionGuideSearch = {
  tab?: string
}

export const Route = createFileRoute('/admin/guide/promotion/')({
  validateSearch: (search: Record<string, unknown>): PromotionGuideSearch => {
    return {
      tab: typeof search.tab === 'string' ? search.tab : 'promotion',
    }
  },
  component: PromotionGuidePage,
})

function PromotionGuidePage() {
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
          {lang === 'id' ? 'Pemasaran' : 'Marketing'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'id' ? 'Panduan Promosi & Kupon' : 'Promotion & Coupon Guide'}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {lang === 'id'
              ? 'Tingkatkan penjualan kursus Anda dengan membuat promosi spesial atau membagikan kupon diskon kepada siswa.'
              : 'Boost your course sales by creating special promotions or sharing discount coupons with students.'}
          </p>
        </div>
        <GuideLanguageToggle />
      </div>

      <Tabs value={tab || 'promotion'} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8 flex flex-wrap h-auto w-full justify-start bg-transparent p-0 gap-2">
          <TabsTrigger value="promotion" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <Megaphone className="size-4 mr-2" />
            {lang === 'id' ? 'Promosi' : 'Promotion'}
          </TabsTrigger>
          <TabsTrigger value="coupon" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <Ticket className="size-4 mr-2" />
            {lang === 'id' ? 'Kupon' : 'Coupon'}
          </TabsTrigger>
        </TabsList>

        {/* PROMOTION TAB */}
        <TabsContent value="promotion" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Apa itu Promosi?' : 'What is a Promotion?'}
            description={
              lang === 'id'
                ? 'Promosi adalah kampanye diskon yang berlaku untuk umum dan memiliki batas waktu (tanggal mulai dan berakhir). Promosi akan otomatis menampilkan harga coret (diskon) pada kursus yang Anda pilih.'
                : 'A promotion is a public discount campaign with a specific timeframe (start and end dates). Promotions will automatically display crossed-out (discounted) prices on the courses you select.'
            }
          >
            <div className="p-6 bg-card flex flex-col gap-4 border-b">
              <div className="border rounded-xl p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 flex flex-col md:flex-row gap-6 items-center">
                <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Percent className="size-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">{lang === 'id' ? 'Diskon Akhir Tahun 50%' : 'Year-End 50% Off'}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="size-4" />
                    20 Dec 2026 - 31 Dec 2026
                  </p>
                </div>
              </div>
            </div>
            <GuideTip type="info" className="m-4 border-none">
              {lang === 'id'
                ? 'Siswa tidak perlu memasukkan kode apapun. Harga akan otomatis terpotong selama masa promosi berlangsung.'
                : 'Students do not need to enter any code. The price will automatically be discounted during the promotion period.'}
            </GuideTip>
          </GuideStep>

          <GuideStep
            step={2}
            title={lang === 'id' ? 'Membuat Promosi Baru' : 'Creating a New Promotion'}
            description={
              lang === 'id'
                ? 'Pilih persentase diskon yang ingin Anda berikan (contoh: 20%). Kemudian tentukan tanggal mulai dan tanggal berakhir kampanye.'
                : 'Select the discount percentage you want to offer (e.g., 20%). Then determine the start and end dates of the campaign.'
            }
          >
            <div className="p-6 bg-card grid gap-6 sm:grid-cols-2 border-b">
              <div className="grid gap-2">
                <Label>{lang === 'id' ? 'Persentase Diskon (%)' : 'Discount Percentage (%)'}</Label>
                <div className="relative">
                  <Input type="number" defaultValue="25" className="pl-9" />
                  <Percent className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'id' ? 'Periode Promosi' : 'Promotion Period'}</Label>
                <div className="flex border rounded-md px-3 py-2 text-sm text-muted-foreground items-center gap-2 bg-background">
                  <Calendar className="size-4" />
                  {lang === 'id' ? 'Pilih rentang tanggal' : 'Select date range'}
                </div>
              </div>
            </div>
          </GuideStep>

          <GuideStep
            step={3}
            title={lang === 'id' ? 'Memilih Kursus untuk Promosi' : 'Selecting Courses for Promotion'}
            description={
              lang === 'id'
                ? 'Setelah detail promosi diisi, Anda bisa memilih satu atau beberapa kursus yang ingin diikutkan dalam kampanye promosi ini.'
                : 'After filling in the promotion details, you can select one or multiple courses to include in this promotion campaign.'
            }
          >
            <div className="p-6 bg-card flex flex-col gap-3 border-b">
               <div className="flex items-center gap-3 border rounded-lg p-3 bg-primary/5 border-primary/20">
                 <CheckCircle className="size-5 text-primary" />
                 <span className="text-sm font-medium">{lang === 'id' ? 'Mastering React JS 2026' : 'Mastering React JS 2026'}</span>
               </div>
               <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/20">
                 <div className="size-5 rounded-full border-2 border-muted-foreground/30" />
                 <span className="text-sm font-medium">{lang === 'id' ? 'Node.js Backend Development' : 'Node.js Backend Development'}</span>
               </div>
            </div>
          </GuideStep>
        </TabsContent>

        {/* COUPON TAB */}
        <TabsContent value="coupon" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Apa itu Kupon?' : 'What is a Coupon?'}
            description={
              lang === 'id'
                ? 'Kupon adalah kode unik rahasia (contoh: "BELAJAR20") yang bisa Anda bagikan kepada orang tertentu. Diskon hanya akan diberikan kepada siswa yang mengetikkan kode ini saat checkout.'
                : 'A coupon is a secret unique code (e.g., "LEARN20") that you can share with specific people. The discount is only given to students who type this code during checkout.'
            }
          >
            <div className="p-6 bg-card flex flex-col items-center border-b">
              <div className="border-2 border-dashed border-primary bg-primary/5 rounded-xl px-8 py-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{lang === 'id' ? 'Kode Kupon' : 'Coupon Code'}</p>
                <h2 className="text-2xl font-black text-primary tracking-widest uppercase">MERDEKA50</h2>
              </div>
            </div>
            <GuideTip type="tip" className="m-4 border-none">
              {lang === 'id'
                ? 'Gunakan huruf kapital dan nama yang mudah diingat agar siswa mudah mengetiknya.'
                : 'Use capital letters and a memorable name so it is easy for students to type.'}
            </GuideTip>
          </GuideStep>

          <GuideStep
            step={2}
            title={lang === 'id' ? 'Tipe Diskon Kupon' : 'Coupon Discount Types'}
            description={
              lang === 'id'
                ? 'Berbeda dengan promosi, pada kupon Anda bisa memilih dua tipe diskon: Diskon Persentase (contoh: potong 10%) atau Diskon Nominal Fix (contoh: potong Rp 50.000).'
                : 'Unlike promotions, with coupons you can choose two discount types: Percentage Discount (e.g., 10% off) or Fixed Nominal Discount (e.g., Rp 50,000 off).'
            }
          >
            <div className="p-6 bg-card border-b grid gap-6 sm:grid-cols-2">
              <div className="border rounded-lg p-4 bg-muted/10 flex items-start gap-4 hover:border-primary/50 cursor-pointer">
                <div className="p-2 bg-background rounded-full border shadow-sm">
                  <Percent className="size-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{lang === 'id' ? 'Diskon Persentase' : 'Percentage Discount'}</p>
                  <p className="text-xs text-muted-foreground mt-1">10%, 20%, dll.</p>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-muted/10 flex items-start gap-4 hover:border-primary/50 cursor-pointer">
                <div className="p-2 bg-background rounded-full border shadow-sm">
                  <Tag className="size-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{lang === 'id' ? 'Diskon Nominal' : 'Fixed Discount'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Rp 50.000, Rp 100.000, dll.</p>
                </div>
              </div>
            </div>
          </GuideStep>

          <GuideStep
            step={3}
            title={lang === 'id' ? 'Batas Penggunaan (Kuota)' : 'Usage Limits (Quota)'}
            description={
              lang === 'id'
                ? 'Anda dapat membatasi berapa kali kupon ini boleh digunakan oleh semua orang (contoh: "hanya untuk 100 pembeli pertama").'
                : 'You can limit how many times this coupon can be used by everyone combined (e.g., "only for the first 100 buyers").'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="max-w-sm grid gap-2">
                <Label>{lang === 'id' ? 'Kuota Penggunaan' : 'Usage Quota'}</Label>
                <Input type="number" defaultValue="100" />
                <p className="text-xs text-muted-foreground">{lang === 'id' ? 'Biarkan kosong untuk tanpa batas' : 'Leave empty for unlimited'}</p>
              </div>
            </div>
          </GuideStep>
        </TabsContent>
      </Tabs>

      <GuideFeedback className="mt-16" />
    </AdminPage>
  )
}
