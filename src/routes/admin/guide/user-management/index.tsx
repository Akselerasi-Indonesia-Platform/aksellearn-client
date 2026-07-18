import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Users, Shield, UserCog, ChevronRight, Edit, Settings } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { GuideStep } from '@/components/admin/guide/guide-step'
import { GuideTip } from '@/components/admin/guide/guide-tip'
import { GuideFeedback } from '@/components/admin/guide/guide-feedback'
import { useGuideLang } from '@/hooks/use-guide-lang'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type UserManagementGuideSearch = {
  tab?: string
}

export const Route = createFileRoute('/admin/guide/user-management/')({
  validateSearch: (search: Record<string, unknown>): UserManagementGuideSearch => {
    return {
      tab: typeof search.tab === 'string' ? search.tab : 'user',
    }
  },
  component: UserManagementGuidePage,
})

function UserManagementGuidePage() {
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
          {lang === 'id' ? 'Manajemen Pengguna' : 'User Management'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'id' ? 'Panduan Manajemen Pengguna' : 'User Management Guide'}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {lang === 'id'
              ? 'Pelajari cara mengelola pengguna, memperbarui informasi profil, mengubah peran, dan mengatur perizinan sistem.'
              : 'Learn how to manage users, update profile information, change roles, and configure system permissions.'}
          </p>
        </div>
        <GuideLanguageToggle />
      </div>

      <Tabs value={tab || 'user'} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8 flex flex-wrap h-auto w-full justify-start bg-transparent p-0 gap-2">
          <TabsTrigger value="user" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <UserCog className="size-4 mr-2" />
            {lang === 'id' ? 'Kelola Pengguna' : 'Manage Users'}
          </TabsTrigger>
          <TabsTrigger value="role" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <Shield className="size-4 mr-2" />
            {lang === 'id' ? 'Peran & Izin' : 'Roles & Permissions'}
          </TabsTrigger>
        </TabsList>

        {/* MANAGE USERS TAB */}
        <TabsContent value="user" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Buka Daftar Pengguna' : 'Open User List'}
            description={
              lang === 'id'
                ? 'Navigasi ke menu "Pengguna" di bilah sisi kiri (sidebar) dan pilih "Semua Pengguna" untuk melihat daftar lengkap pengguna yang terdaftar di platform.'
                : 'Navigate to the "Users" menu in the left sidebar and select "All Users" to see the complete list of registered users on the platform.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border">
              <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border border-border w-fit">
                <Users className="size-5 text-muted-foreground" />
                <span className="font-medium text-sm">{lang === 'id' ? 'Semua Pengguna' : 'All Users'}</span>
              </div>
            </div>
          </GuideStep>

          <GuideStep
            step={2}
            title={lang === 'id' ? 'Edit Pengguna' : 'Edit a User'}
            description={
              lang === 'id'
                ? 'Cari pengguna yang ingin Anda ubah datanya menggunakan fitur pencarian. Kemudian klik tombol "Edit" atau ikon pensil di kolom aksi pada baris pengguna tersebut.'
                : 'Search for the user you want to modify using the search feature. Then click the "Edit" button or pencil icon in the action column for that user\'s row.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border">
               <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border border-border w-fit">
                  <Edit className="size-5 text-muted-foreground" />
                  <span className="font-medium text-sm">Edit</span>
               </div>
            </div>
            <GuideTip type="info" className="m-4 border-none">
              {lang === 'id'
                ? 'Anda dapat memperbarui informasi dasar seperti Nama, Nomor Telepon, dan Email.'
                : 'You can update basic information such as Name, Phone Number, and Email.'}
            </GuideTip>
          </GuideStep>

          <GuideStep
            step={3}
            title={lang === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
            description={
              lang === 'id'
                ? 'Setelah selesai mengubah data profil pengguna, pastikan Anda menekan tombol "Simpan" agar perubahan diterapkan secara permanen ke dalam sistem.'
                : 'After modifying the user profile data, make sure you press the "Save" button to apply the changes permanently to the system.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border">
              <div className="h-10 w-24 bg-primary/90 rounded flex items-center justify-center text-primary-foreground text-sm font-medium">
                {lang === 'id' ? 'Simpan' : 'Save'}
              </div>
            </div>
          </GuideStep>
        </TabsContent>

        {/* ROLE MANAGEMENT TAB */}
        <TabsContent value="role" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Buka Manajemen Peran' : 'Open Role Management'}
            description={
              lang === 'id'
                ? 'Melalui sidebar kiri, klik pada menu "Pengguna" kemudian pilih "Peran". Di sini Anda dapat melihat peran-peran (Roles) yang tersedia seperti Admin, Instruktur, atau Siswa.'
                : 'Through the left sidebar, click on the "Users" menu and then select "Roles". Here you can see available roles such as Admin, Instructor, or Student.'
            }
          >
             <div className="p-6 bg-card border-b rounded-xl border">
               <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border border-border w-fit">
                  <Shield className="size-5 text-muted-foreground" />
                  <span className="font-medium text-sm">{lang === 'id' ? 'Peran' : 'Roles'}</span>
               </div>
            </div>
          </GuideStep>

          <GuideStep
            step={2}
            title={lang === 'id' ? 'Mengatur Perizinan' : 'Configure Permissions'}
            description={
              lang === 'id'
                ? 'Untuk mengubah hak akses suatu peran, pilih opsi "Edit" pada peran yang diinginkan, kemudian centang atau hapus centang pada kotak izin (permissions) sesuai dengan modul yang ingin diberikan aksesnya.'
                : 'To modify access rights for a role, select the "Edit" option on the desired role, then check or uncheck the permissions boxes according to the modules they should access.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border flex gap-4 flex-col">
              <div className="flex items-center gap-2">
                 <div className="size-4 rounded border bg-primary flex items-center justify-center text-primary-foreground text-[10px]">✓</div>
                 <span className="text-sm">course.read</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="size-4 rounded border"></div>
                 <span className="text-sm">course.write</span>
              </div>
            </div>
          </GuideStep>
          
          <GuideStep
            step={3}
            title={lang === 'id' ? 'Terapkan Peran ke Pengguna' : 'Assign Role to User'}
            description={
              lang === 'id'
                ? 'Untuk memberikan peran spesifik kepada seorang pengguna, kembalilah ke daftar pengguna (All Users), edit pengguna tersebut, lalu pada bagian "Peran", pilih peran yang baru saja Anda konfigurasikan.'
                : 'To assign a specific role to a user, return to the user list (All Users), edit the user, and in the "Roles" section, select the role you just configured.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border bg-muted/10">
               <div className="p-4 bg-background border rounded shadow-sm max-w-md">
                 <p className="font-medium text-sm mb-2">{lang === 'id' ? 'Pilih Peran' : 'Select Role'}</p>
                 <div className="w-full border rounded p-2 text-sm text-muted-foreground flex justify-between items-center">
                    <span>Admin</span>
                    <ChevronRight className="size-4 rotate-90" />
                 </div>
               </div>
            </div>
            <GuideTip type="warning" className="m-4 border-none">
              {lang === 'id'
                ? 'Berhati-hatilah saat memberikan peran dengan akses tinggi seperti "Super Admin" kepada pengguna.'
                : 'Be careful when assigning roles with high access levels such as "Super Admin" to a user.'}
            </GuideTip>
          </GuideStep>
        </TabsContent>
      </Tabs>

      <GuideFeedback className="mt-16" />
    </AdminPage>
  )
}
