import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { FileCheck, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { GuideStep } from '@/components/admin/guide/guide-step'
import { GuideTip } from '@/components/admin/guide/guide-tip'
import { GuideFeedback } from '@/components/admin/guide/guide-feedback'
import { useGuideLang } from '@/hooks/use-guide-lang'

export const Route = createFileRoute('/admin/guide/instructor-application/')({
  component: InstructorApplicationGuidePage,
})

function InstructorApplicationGuidePage() {
  const [lang] = useGuideLang()

  return (
    <AdminPage>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link to="/admin/guide" className="hover:text-foreground transition-colors">
          {lang === 'id' ? 'Panduan' : 'Guide'}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-medium">
          {lang === 'id' ? 'Aplikasi Instruktur' : 'Instructor Application'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'id' ? 'Panduan Pengajuan Instruktur' : 'Instructor Application Guide'}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {lang === 'id'
              ? 'Pelajari cara mengelola dan meninjau pendaftaran dari pengguna yang ingin menjadi instruktur.'
              : 'Learn how to manage and review applications from users who want to become instructors.'}
          </p>
        </div>
        <GuideLanguageToggle />
      </div>

      <div className="space-y-12 max-w-4xl mt-0">
        <GuideStep
          step={1}
          title={lang === 'id' ? 'Buka Daftar Pengajuan' : 'Open Applications List'}
          description={
            lang === 'id'
              ? 'Arahkan kursor ke menu "Pengguna" (Users) di panel navigasi kiri, kemudian klik opsi "Pengajuan Instruktur" (Instructor Applications) untuk melihat semua daftar pengajuan.'
              : 'Hover over the "Users" menu in the left navigation panel, then click the "Instructor Applications" option to view all applications.'
          }
        >
          <div className="p-6 bg-card border-b rounded-xl border">
            <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border border-border w-fit">
              <FileCheck className="size-5 text-muted-foreground" />
              <span className="font-medium text-sm">{lang === 'id' ? 'Pengajuan Instruktur' : 'Instructor Applications'}</span>
            </div>
          </div>
        </GuideStep>

        <GuideStep
          step={2}
          title={lang === 'id' ? 'Tinjau Profil Pendaftar' : 'Review Applicant Profile'}
          description={
            lang === 'id'
              ? 'Klik tombol "Detail" atau lihat pada baris data pengajuan untuk memeriksa CV, portofolio, serta informasi pengalaman dari calon instruktur.'
              : 'Click the "Detail" button or look at the application data row to review the CV, portfolio, and experience information of the prospective instructor.'
          }
        >
          <div className="p-6 bg-card border-b rounded-xl border bg-muted/10">
            <div className="p-4 bg-background border rounded shadow-sm max-w-md">
                <p className="font-medium text-sm mb-2">Applicant: John Doe</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Experience: 5 Years</p>
                  <p className="text-primary hover:underline cursor-pointer">View Portfolio / CV</p>
                </div>
            </div>
          </div>
          <GuideTip type="info" className="m-4 border-none">
            {lang === 'id'
              ? 'Pastikan untuk memeriksa portofolio dengan teliti sebelum memberikan persetujuan guna menjaga kualitas pengajar.'
              : 'Make sure to thoroughly check the portfolio before giving approval to maintain teaching quality.'}
          </GuideTip>
        </GuideStep>

        <GuideStep
          step={3}
          title={lang === 'id' ? 'Setujui atau Tolak Pengajuan' : 'Approve or Reject Application'}
          description={
            lang === 'id'
              ? 'Setelah selesai meninjau, Anda dapat mengubah status pengajuan menjadi "Disetujui" (Approved) atau "Ditolak" (Rejected). Jika disetujui, akun pengguna tersebut akan otomatis mendapatkan akses dan peran sebagai Instruktur.'
              : 'After finishing the review, you can change the application status to "Approved" or "Rejected". If approved, the user\'s account will automatically gain access and the role of Instructor.'
          }
        >
          <div className="p-6 bg-card border-b rounded-xl border">
            <div className="flex gap-4">
              <div className="h-10 px-4 bg-green-600/90 text-white rounded flex items-center justify-center text-sm font-medium gap-2">
                <CheckCircle className="size-4" />
                {lang === 'id' ? 'Setujui' : 'Approve'}
              </div>
              <div className="h-10 px-4 bg-red-600/90 text-white rounded flex items-center justify-center text-sm font-medium gap-2">
                <XCircle className="size-4" />
                {lang === 'id' ? 'Tolak' : 'Reject'}
              </div>
            </div>
          </div>
          <GuideTip type="warning" className="m-4 border-none">
            {lang === 'id'
              ? 'Keputusan untuk menyetujui pengajuan akan memberikan izin (permissions) bagi pengguna tersebut untuk membuat kursus dan modul pembelajaran.'
              : 'The decision to approve an application will grant the user permissions to create courses and learning modules.'}
          </GuideTip>
        </GuideStep>
      </div>

      <GuideFeedback className="mt-16" />
    </AdminPage>
  )
}
