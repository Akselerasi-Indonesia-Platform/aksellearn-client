import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { KeyRound, ShieldAlert, ChevronRight, Settings, Mail } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { GuideStep } from '@/components/admin/guide/guide-step'
import { GuideTip } from '@/components/admin/guide/guide-tip'
import { GuideFeedback } from '@/components/admin/guide/guide-feedback'
import { useGuideLang } from '@/hooks/use-guide-lang'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type UserPasswordGuideSearch = {
  tab?: string
}

export const Route = createFileRoute('/admin/guide/user-password/')({
  validateSearch: (search: Record<string, unknown>): UserPasswordGuideSearch => {
    return {
      tab: typeof search.tab === 'string' ? search.tab : 'change',
    }
  },
  component: UserPasswordGuidePage,
})

function UserPasswordGuidePage() {
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
          {lang === 'id' ? 'Kata Sandi Pengguna' : 'User Password'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'id' ? 'Panduan Mengelola Kata Sandi' : 'Password Management Guide'}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {lang === 'id'
              ? 'Pelajari cara mengubah kata sandi Anda atau apa yang harus dilakukan jika Anda lupa kata sandi.'
              : 'Learn how to change your password or what to do if you forget it.'}
          </p>
        </div>
        <GuideLanguageToggle />
      </div>

      <Tabs value={tab || 'change'} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8 flex flex-wrap h-auto w-full justify-start bg-transparent p-0 gap-2">
          <TabsTrigger value="change" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <Settings className="size-4 mr-2" />
            {lang === 'id' ? 'Ubah Kata Sandi' : 'Change Password'}
          </TabsTrigger>
          <TabsTrigger value="reset" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <ShieldAlert className="size-4 mr-2" />
            {lang === 'id' ? 'Lupa Kata Sandi' : 'Forgot Password'}
          </TabsTrigger>
        </TabsList>

        {/* CHANGE PASSWORD TAB */}
        <TabsContent value="change" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Buka Pengaturan Profil' : 'Open Profile Settings'}
            description={
              lang === 'id'
                ? 'Klik pada foto profil atau nama Anda di sudut kanan atas menu navigasi, kemudian pilih menu "Profile" (Profil) untuk membuka halaman pengaturan akun Anda.'
                : 'Click on your profile picture or name in the top right corner of the navigation menu, then select "Profile" to open your account settings page.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border">
              <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-lg">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  U
                </div>
                <div>
                  <p className="font-medium">User Menu</p>
                  <p className="text-sm text-muted-foreground">Click here to find the Profile option</p>
                </div>
              </div>
            </div>
          </GuideStep>

          <GuideStep
            step={2}
            title={lang === 'id' ? 'Pilih Opsi Ubah Kata Sandi' : 'Select Change Password Option'}
            description={
              lang === 'id'
                ? 'Di halaman Profil, cari bagian Keamanan (Security) dan klik tombol "Ubah Kata Sandi" (Change Password).'
                : 'On the Profile page, look for the Security section and click the "Change Password" button.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border">
               <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border border-border w-fit">
                  <KeyRound className="size-5 text-muted-foreground" />
                  <span className="font-medium text-sm">{lang === 'id' ? 'Ubah Kata Sandi' : 'Change Password'}</span>
               </div>
            </div>
          </GuideStep>

          <GuideStep
            step={3}
            title={lang === 'id' ? 'Masukkan Kata Sandi Baru' : 'Enter New Password'}
            description={
              lang === 'id'
                ? 'Masukkan kata sandi Anda saat ini, lalu masukkan kata sandi baru Anda sebanyak dua kali untuk konfirmasi. Pastikan kata sandi baru Anda kuat dan aman.'
                : 'Enter your current password, then enter your new password twice to confirm. Make sure your new password is strong and secure.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border">
              <div className="space-y-4 max-w-sm">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{lang === 'id' ? 'Kata Sandi Saat Ini' : 'Current Password'}</Label>
                  <Input type="password" value="********" readOnly className="pointer-events-none text-muted-foreground bg-muted/10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{lang === 'id' ? 'Kata Sandi Baru' : 'New Password'}</Label>
                  <Input type="password" value="********" readOnly className="pointer-events-none text-muted-foreground bg-muted/10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{lang === 'id' ? 'Konfirmasi Kata Sandi Baru' : 'Confirm New Password'}</Label>
                  <Input type="password" value="********" readOnly className="pointer-events-none text-muted-foreground bg-muted/10" />
                </div>
              </div>
            </div>
            <GuideTip type="tip" className="m-4 border-none">
              {lang === 'id'
                ? 'Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk membuat kata sandi yang lebih aman.'
                : 'Use a combination of uppercase, lowercase letters, numbers, and symbols to create a more secure password.'}
            </GuideTip>
          </GuideStep>
        </TabsContent>

        {/* FORGOT PASSWORD TAB */}
        <TabsContent value="reset" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Buka Halaman Lupa Kata Sandi' : 'Go to Forgot Password Page'}
            description={
              lang === 'id'
                ? 'Jika Anda belum masuk ke sistem, klik tautan "Lupa kata sandi?" pada halaman login utama.'
                : 'If you are not logged in, click the "Forgot password?" link on the main login page.'
            }
          >
             <div className="p-6 bg-card border-b rounded-xl border">
               <div className="text-sm font-medium text-primary cursor-pointer hover:underline">
                 {lang === 'id' ? 'Lupa kata sandi?' : 'Forgot password?'}
               </div>
            </div>
          </GuideStep>

          <GuideStep
            step={2}
            title={lang === 'id' ? 'Masukkan Email Anda' : 'Enter Your Email'}
            description={
              lang === 'id'
                ? 'Masukkan alamat email yang terdaftar pada akun Anda. Sistem akan mengirimkan tautan reset kata sandi ke email tersebut.'
                : 'Enter the email address registered to your account. The system will send a password reset link to that email.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border flex gap-4 items-center">
              <Mail className="size-8 text-muted-foreground" />
              <div className="flex-1 max-w-sm">
                 <div className="h-10 w-full bg-muted/30 rounded border flex items-center px-3">
                   <span className="text-muted-foreground text-sm">user@example.com</span>
                 </div>
              </div>
            </div>
          </GuideStep>
          
          <GuideStep
            step={3}
            title={lang === 'id' ? 'Cek Email Anda' : 'Check Your Email'}
            description={
              lang === 'id'
                ? 'Buka kotak masuk email Anda dan cari email dari kami berisi tautan reset. Klik tautan tersebut untuk diarahkan ke halaman pembuatan kata sandi baru.'
                : 'Open your email inbox and look for an email from us containing a reset link. Click that link to be directed to the new password creation page.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border bg-muted/10">
               <div className="p-4 bg-background border rounded shadow-sm max-w-md">
                 <p className="font-medium text-sm mb-2">Reset Password Request</p>
                 <p className="text-xs text-muted-foreground mb-4">Click the button below to reset your password.</p>
                 <div className="h-8 w-32 bg-primary/80 rounded flex items-center justify-center text-primary-foreground text-xs font-medium">
                   Reset Password
                 </div>
               </div>
            </div>
            <GuideTip type="info" className="m-4 border-none">
              {lang === 'id'
                ? 'Tautan reset kata sandi biasanya memiliki batas waktu (misalnya 1 jam). Jika kadaluarsa, Anda harus meminta tautan baru.'
                : 'The password reset link usually has a time limit (e.g., 1 hour). If it expires, you will need to request a new link.'}
            </GuideTip>
          </GuideStep>
        </TabsContent>
      </Tabs>

      <GuideFeedback className="mt-16" />
    </AdminPage>
  )
}
