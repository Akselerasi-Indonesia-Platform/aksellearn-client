import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle, ChevronRight, HandCoins, ArrowRight, Wallet, UserCog, Send, CheckSquare, Clock } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { GuideStep } from '@/components/admin/guide/guide-step'
import { GuideTip } from '@/components/admin/guide/guide-tip'
import { GuideFeedback } from '@/components/admin/guide/guide-feedback'
import { useGuideLang } from '@/hooks/use-guide-lang'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/hooks/use-auth'

type WithdrawalGuideSearch = {
  tab?: string
}

export const Route = createFileRoute('/admin/guide/withdrawal/')({
  validateSearch: (search: Record<string, unknown>): WithdrawalGuideSearch => {
    return {
      tab: typeof search.tab === 'string' ? search.tab : 'instructor',
    }
  },
  component: WithdrawalGuidePage,
})

function WithdrawalGuidePage() {
  const [lang] = useGuideLang()
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { can } = useAuthStore()

  const canViewAdminTab = can('admin.manage_all') || can('withdrawal.process')
  const activeTab = tab === 'admin' && canViewAdminTab ? 'admin' : 'instructor'

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
          {lang === 'id' ? 'Penarikan Dana' : 'Withdrawal'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'id' ? 'Panduan Penarikan Dana' : 'Withdrawal Guide'}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {lang === 'id'
              ? 'Pelajari alur lengkap penarikan dana dari sudut pandang instruktur (pengajuan) dan Admin (persetujuan).'
              : 'Learn the complete withdrawal workflow from the instructor perspective (request) and Admin perspective (approval).'}
          </p>
        </div>
        <GuideLanguageToggle />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8 flex flex-wrap h-auto w-full justify-start bg-transparent p-0 gap-2">
          <TabsTrigger value="instructor" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <HandCoins className="size-4 mr-2" />
            {lang === 'id' ? 'Alur Instruktur' : 'Instructor Workflow'}
          </TabsTrigger>
          {canViewAdminTab && (
            <TabsTrigger value="admin" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
              <UserCog className="size-4 mr-2" />
              {lang === 'id' ? 'Alur Admin' : 'Admin Workflow'}
            </TabsTrigger>
          )}
        </TabsList>

        {/* INSTRUCTOR TAB */}
        <TabsContent value="instructor" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Cek Saldo Tersedia' : 'Check Available Balance'}
            description={
              lang === 'id'
                ? 'Sebelum melakukan penarikan, pastikan Anda memiliki saldo yang cukup di menu Wallet/Dashboard penghasilan.'
                : 'Before withdrawing, ensure you have sufficient balance in your Wallet/Earnings dashboard.'
            }
          >
            <div className="p-6 bg-card flex flex-col gap-5 border-b">
              <div className="flex items-center gap-4 p-4 bg-muted/20 border rounded-lg max-w-sm">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Wallet className="size-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{lang === 'id' ? 'Saldo Tersedia' : 'Available Balance'}</p>
                  <p className="text-2xl font-bold font-mono">Rp 1.500.000</p>
                </div>
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={2}
            title={lang === 'id' ? 'Ajukan Penarikan (Request)' : 'Submit a Withdrawal Request'}
            description={
              lang === 'id'
                ? 'Masuk ke halaman Penarikan, masukkan nominal yang ingin ditarik, dan pilih rekening bank tujuan Anda.'
                : 'Go to the Withdrawal page, enter the amount you wish to withdraw, and select your destination bank account.'
            }
          >
            <div className="p-6 bg-card grid gap-4 border-b">
               <div className="flex items-center gap-3 border rounded-md p-3 bg-background shadow-sm w-fit">
                <Send className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">{lang === 'id' ? 'Kirim Permintaan' : 'Submit Request'}</span>
              </div>
            </div>
            <GuideTip type="info" className="m-4 border-none">
              {lang === 'id'
                ? 'Setelah diajukan, saldo Anda akan dikunci sementara dan status penarikan menjadi "Pending".'
                : 'Once submitted, your balance will be temporarily locked and the withdrawal status becomes "Pending".'}
            </GuideTip>
          </GuideStep>
          <GuideStep
            step={3}
            title={lang === 'id' ? 'Tunggu Proses Admin' : 'Wait for Admin Processing'}
            description={
              lang === 'id'
                ? 'Admin akan memverifikasi dan mentransfer dana ke rekening Anda. Proses ini biasanya memakan waktu 1-3 hari kerja.'
                : 'Admins will verify and transfer the funds to your account. This process usually takes 1-3 business days.'
            }
          >
            <div className="p-6 bg-card flex items-center gap-4 border-b">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium text-sm">
                <Clock className="size-4" />
                Pending
              </div>
              <ArrowRight className="size-5 text-muted-foreground" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium text-sm">
                <CheckCircle className="size-4" />
                Completed
              </div>
            </div>
          </GuideStep>
        </TabsContent>

        {/* ADMIN TAB */}
        {canViewAdminTab && (
          <TabsContent value="admin" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">

          <GuideStep
            step={1}
            title={lang === 'id' ? 'Tinjau Permintaan Penarikan' : 'Review Withdrawal Requests'}
            description={
              lang === 'id'
                ? 'Buka dashboard Admin dan masuk ke menu Penarikan. Cari permintaan dengan status "Pending". Verifikasi jumlah dan detail bank instruktur.'
                : 'Open the Admin dashboard and go to the Withdrawals menu. Look for requests with "Pending" status. Verify the amount and instructor bank details.'
            }
          >
             <div className="p-6 bg-card border-b">
              <div className="flex gap-4 items-start border rounded-lg p-4 bg-muted/10 max-w-md">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">John Doe (Instructor)</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Amount: Rp 1.500.000</p>
                  <p className="text-xs text-muted-foreground">Bank: BCA - 1234567890</p>
                </div>
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={2}
            title={lang === 'id' ? 'Transfer Dana Secara Manual' : 'Transfer Funds Manually'}
            description={
              lang === 'id'
                ? 'Gunakan sistem perbankan perusahaan atau payment gateway Anda untuk mentransfer dana secara aktual ke rekening instruktur yang tertera.'
                : 'Use your company banking system or payment gateway to actually transfer the funds to the listed instructor account.'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/30 text-muted-foreground">
                <Send className="size-10 mb-3 text-primary/50" />
                <p className="font-medium text-foreground">{lang === 'id' ? 'Lakukan Transfer di Luar Sistem' : 'Perform Transfer Outside the System'}</p>
                <p className="text-sm mt-1 max-w-sm">{lang === 'id' ? 'Pastikan transfer berhasil sebelum menandai penarikan selesai.' : 'Ensure the transfer is successful before marking the withdrawal as complete.'}</p>
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={3}
            title={lang === 'id' ? 'Tandai Selesai (Completed)' : 'Mark as Completed'}
            description={
              lang === 'id'
                ? 'Setelah dana berhasil ditransfer, kembali ke sistem dan ubah status penarikan menjadi "Completed". Sistem akan memberitahu instruktur bahwa dana telah dikirim.'
                : 'After the funds are successfully transferred, return to the system and change the withdrawal status to "Completed". The system will notify the instructor that funds have been sent.'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="flex items-center gap-3 border rounded-md p-4 bg-emerald-50 max-w-sm text-emerald-800 border-emerald-200">
                <CheckSquare className="size-6 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{lang === 'id' ? 'Ubah Status ke Completed' : 'Change Status to Completed'}</span>
                  <span className="text-xs opacity-80">{lang === 'id' ? 'Ini akan menutup permintaan penarikan' : 'This will close the withdrawal request'}</span>
                </div>
              </div>
            </div>
          </GuideStep>
        </TabsContent>
        )}
      </Tabs>

      <GuideFeedback className="mt-16" />
    </AdminPage>
  )
}
