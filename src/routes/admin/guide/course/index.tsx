import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, CheckCircle, HelpCircle, MessageSquare, Paperclip, Megaphone, ChevronRight, Upload, Video, Save, GripVertical, Plus, Library, ArrowRight, ChevronDown, FileText, FileSpreadsheet, FileArchive, Users } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { GuideStep } from '@/components/admin/guide/guide-step'
import { GuideTip } from '@/components/admin/guide/guide-tip'
import { GuideFeedback } from '@/components/admin/guide/guide-feedback'
import { useGuideLang } from '@/hooks/use-guide-lang'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

// Optional: define search params to allow linking directly to a tab
type CourseGuideSearch = {
  tab?: string
}

export const Route = createFileRoute('/admin/guide/course/')({
  validateSearch: (search: Record<string, unknown>): CourseGuideSearch => {
    return {
      tab: typeof search.tab === 'string' ? search.tab : 'content',
    }
  },
  component: CourseGuidePage,
})

function CourseGuidePage() {
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
          {lang === 'id' ? 'Kursus' : 'Course'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'id' ? 'Panduan Manajemen Kursus' : 'Course Management Guide'}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {lang === 'id'
              ? 'Pelajari cara menggunakan setiap tab di editor kursus untuk menyusun materi pembelajaran Anda.'
              : 'Learn how to use each tab in the course editor to structure your learning materials.'}
          </p>
        </div>
        <GuideLanguageToggle />
      </div>

      <Tabs value={tab || 'content'} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8 flex flex-wrap h-auto w-full justify-start bg-transparent p-0 gap-2">
          <TabsTrigger value="content" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <BookOpen className="size-4 mr-2" />
            {lang === 'id' ? 'Konten' : 'Content'}
          </TabsTrigger>
          <TabsTrigger value="module" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <CheckCircle className="size-4 mr-2" />
            {lang === 'id' ? 'Modul' : 'Module'}
          </TabsTrigger>
          <TabsTrigger value="quiz" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <HelpCircle className="size-4 mr-2" />
            {lang === 'id' ? 'Kuis' : 'Quiz'}
          </TabsTrigger>
          <TabsTrigger value="discussion" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <MessageSquare className="size-4 mr-2" />
            {lang === 'id' ? 'Diskusi' : 'Discussion'}
          </TabsTrigger>
          <TabsTrigger value="attachment" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <Paperclip className="size-4 mr-2" />
            {lang === 'id' ? 'Lampiran' : 'Attachment'}
          </TabsTrigger>
          <TabsTrigger value="announcement" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <Megaphone className="size-4 mr-2" />
            {lang === 'id' ? 'Pengumuman' : 'Announcement'}
          </TabsTrigger>
        </TabsList>

        {/* CONTENT TAB */}
        <TabsContent value="content" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Informasi Dasar' : 'Basic Information'}
            description={
              lang === 'id'
                ? 'Isi Judul, Slug (URL), dan Deskripsi singkat kursus. Slug akan terisi otomatis berdasarkan judul, namun Anda bisa mengubahnya jika diperlukan.'
                : 'Fill in the Title, Slug (URL), and short Description of the course. The slug is auto-generated from the title, but you can edit it if needed.'
            }
          >
            <div className="p-6 bg-card flex flex-col gap-5 border-b">
              <div className="grid gap-2">
                <Label>{lang === 'id' ? 'Judul Kursus' : 'Course Title'} <span className="text-destructive">*</span></Label>
                <Input value={lang === 'id' ? 'Belajar React untuk Pemula' : 'Learn React for Beginners'} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Slug <span className="text-destructive">*</span></Label>
                <div className="flex bg-muted rounded-md border px-3 py-2 text-sm text-muted-foreground">
                  /course/belajar-react-untuk-pemula
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'id' ? 'Deskripsi Singkat' : 'Short Description'}</Label>
                <Textarea 
                  value={lang === 'id' ? 'Kursus komprehensif untuk menguasai React dari nol.' : 'A comprehensive course to master React from scratch.'} 
                  readOnly 
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={2}
            title={lang === 'id' ? 'Gambar Thumbnail & Video Promo' : 'Thumbnail & Promo Video'}
            description={
              lang === 'id'
                ? 'Unggah gambar thumbnail yang menarik (disarankan rasio 16:9). Anda juga dapat menambahkan link video promo untuk menarik lebih banyak siswa.'
                : 'Upload an engaging thumbnail image (16:9 ratio recommended). You can also add a promo video link to attract more students.'
            }
          >
            <div className="p-6 bg-card grid gap-6 sm:grid-cols-2 border-b">
              <div className="space-y-3 flex flex-col">
                <Label>{lang === 'id' ? 'Thumbnail Kursus' : 'Course Thumbnail'}</Label>
                <div className="flex-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
                  <Upload className="size-8 mb-2" />
                  <p className="text-sm font-medium">{lang === 'id' ? 'Klik untuk unggah' : 'Click to upload'}</p>
                  <p className="text-xs opacity-70">PNG, JPG, max 5MB. 16:9 ratio.</p>
                </div>
              </div>
              <div className="space-y-3 flex flex-col">
                <Label>{lang === 'id' ? 'Video Promo' : 'Promo Video'} (Opsional)</Label>
                <div className="flex-1 border rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/20 text-muted-foreground">
                  <Video className="size-8 mb-2" />
                  <p className="text-sm font-medium">{lang === 'id' ? 'Tidak ada video' : 'No video provided'}</p>
                </div>
              </div>
            </div>
            <GuideTip type="tip" className="m-4 border-none">
              {lang === 'id'
                ? 'Thumbnail yang profesional dan memiliki teks yang jelas akan meningkatkan tingkat klik (CTR) kursus Anda di halaman pencarian.'
                : 'A professional thumbnail with clear text will increase the click-through rate (CTR) of your course on the search page.'}
            </GuideTip>
          </GuideStep>
          <GuideStep
            step={3}
            title={lang === 'id' ? 'Pengaturan Harga' : 'Pricing Settings'}
            description={
              lang === 'id'
                ? 'Masukkan harga kursus. Jika kursus ini gratis, cukup atur harga menjadi 0. Pengaturan diskon dan promosi dikelola secara terpisah melalui menu Promosi.'
                : 'Enter the course price. If the course is free, simply set the price to 0. Discounts and promotional settings are managed separately through the Promotions menu.'
            }
          >
            <div className="p-6 bg-card flex flex-col gap-6 border-b">
              <div className="grid gap-4 max-w-sm">
                <div className="grid gap-2">
                  <Label>{lang === 'id' ? 'Harga (Rp)' : 'Price (Rp)'}</Label>
                  <Input value="500000" readOnly className="font-mono" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === 'id' ? 'Atur ke 0 untuk kursus gratis.' : 'Set to 0 for free courses.'}
                  </p>
                </div>
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={4}
            title={lang === 'id' ? 'Simpan & Publikasikan' : 'Save & Publish'}
            description={
              lang === 'id'
                ? 'Setelah semua informasi terisi dengan benar, pastikan status kursus diubah menjadi "Aktif" jika Anda ingin kursus tersebut bisa dilihat oleh siswa. Klik tombol Simpan di kanan atas.'
                : 'Once all information is filled out correctly, ensure the course status is set to "Active" if you want it to be visible to students. Click the Save button in the top right.'
            }
          >
            <div className="p-6 bg-card flex items-center justify-between gap-4 border-b">
              <div className="flex items-center gap-3">
                <Switch checked={true} />
                <Label className="font-medium">{lang === 'id' ? 'Status: Aktif' : 'Status: Active'}</Label>
              </div>
              <Button>
                <Save className="size-4 mr-2" />
                {lang === 'id' ? 'Simpan Kursus' : 'Save Course'}
              </Button>
            </div>
          </GuideStep>
        </TabsContent>

        {/* MODULE TAB */}
        <TabsContent value="module" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Apa itu Modul?' : 'What is a Module?'}
            description={
              lang === 'id'
                ? 'Modul adalah wadah atau bab yang mengelompokkan materi pembelajaran Anda. Satu kursus bisa memiliki banyak modul, dan setiap modul dapat berisi video, artikel, atau kuis.'
                : 'A module is a container or chapter that groups your learning materials. A single course can have many modules, and each module can contain videos, articles, or quizzes.'
            }
          >
            <div className="p-6 bg-card flex flex-col gap-3 border-b">
              <div className="border rounded-md p-4 bg-muted/30">
                <div className="flex items-center gap-3 font-medium mb-3">
                  <GripVertical className="size-4 text-muted-foreground" />
                  Section 1: Introduction
                </div>
                <div className="space-y-2 pl-7">
                  <div className="flex items-center gap-3 text-sm border bg-background rounded p-2">
                    <Video className="size-4 text-blue-500" />
                    Welcome to the Course
                  </div>
                  <div className="flex items-center gap-3 text-sm border bg-background rounded p-2">
                    <HelpCircle className="size-4 text-orange-500" />
                    Introduction Quiz
                  </div>
                </div>
              </div>
            </div>
            <GuideTip type="info" className="m-4 border-none">
              {lang === 'id'
                ? 'Contoh Struktur: Modul 1 (Pengenalan) berisi 3 Video. Modul 2 (Praktek) berisi 2 Video dan 1 Kuis.'
                : 'Example Structure: Module 1 (Introduction) contains 3 Videos. Module 2 (Practice) contains 2 Videos and 1 Quiz.'}
            </GuideTip>
          </GuideStep>
          <GuideStep
            step={2}
            title={lang === 'id' ? 'Menambahkan Modul Baru' : 'Adding a New Module'}
            description={
              lang === 'id'
                ? 'Klik tombol "Add Module" di kanan atas tabel. Anda harus memasukkan Judul Modul dan memilih Tipe Modul (Video/Artikel/Kuis).'
                : 'Click the "Add Module" button at the top right of the table. You must enter a Module Title and select a Module Type (Video/Article/Quiz).'
            }
          >
            <div className="p-6 bg-card flex flex-col items-start gap-4 border-b">
              <Button className="w-fit">
                <Plus className="size-4 mr-2" />
                {lang === 'id' ? 'Tambah Modul' : 'Add Module'}
              </Button>
              <div className="w-full max-w-sm grid gap-2 p-4 border rounded-lg bg-muted/10">
                <Label>{lang === 'id' ? 'Judul Modul' : 'Module Title'}</Label>
                <Input placeholder={lang === 'id' ? 'Masukkan judul...' : 'Enter title...'} />
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={3}
            title={lang === 'id' ? 'Mengatur Urutan (Drag & Drop)' : 'Reordering (Drag & Drop)'}
            description={
              lang === 'id'
                ? 'Anda dapat mengubah urutan modul atau sub-video dengan mengklik dan menahan ikon titik enam (grip) di sebelah kiri nama modul, lalu menggesernya ke posisi yang diinginkan.'
                : 'You can change the order of modules or sub-videos by clicking and holding the six-dot grip icon on the left of the module name, then dragging it to the desired position.'
            }
          >
            <div className="p-6 bg-card flex flex-col gap-2 border-b">
              <div className="flex items-center gap-3 border rounded-md p-3 bg-background hover:border-primary/50 cursor-move transition-colors shadow-sm">
                <GripVertical className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">1. Getting Started</span>
              </div>
              <div className="flex items-center gap-3 border rounded-md p-3 bg-background hover:border-primary/50 cursor-move transition-colors">
                <GripVertical className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">2. Core Concepts</span>
              </div>
            </div>
          </GuideStep>
        </TabsContent>

        {/* QUIZ TAB */}
        <TabsContent value="quiz" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Konsep Dasar Kuis' : 'Basic Quiz Concept'}
            description={
              lang === 'id'
                ? 'Kuis dalam sistem ini bersifat modular. Artinya, Anda membuat bank kuis terlebih dahulu melalui menu utama "Quizzes", baru kemudian menempelkan (attach) kuis tersebut ke modul tertentu di dalam kursus.'
                : 'Quizzes in this system are modular. This means you create a quiz bank first via the main "Quizzes" menu, and then attach that quiz to a specific module within a course.'
            }
          >
            <div className="p-6 bg-card flex flex-wrap items-center justify-center gap-4 border-b">
              <div className="border rounded-lg p-4 w-[200px] flex flex-col items-center text-center gap-2 bg-muted/10">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Library className="size-6 text-primary" />
                </div>
                <span className="font-medium text-sm">Quiz Bank</span>
                <p className="text-xs text-muted-foreground">Create quizzes once</p>
              </div>
              <div className="flex items-center justify-center text-muted-foreground">
                <ArrowRight className="size-5" />
              </div>
              <div className="border rounded-lg p-4 w-[200px] flex flex-col items-center text-center gap-2 bg-muted/10">
                <div className="p-3 bg-primary/10 rounded-full">
                  <CheckCircle className="size-6 text-primary" />
                </div>
                <span className="font-medium text-sm">Course Module</span>
                <p className="text-xs text-muted-foreground">Attach many times</p>
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={2}
            title={lang === 'id' ? 'Menyematkan Kuis ke Kursus' : 'Attaching Quiz to a Course'}
            description={
              lang === 'id'
                ? 'Setelah kuis siap, kembali ke menu "Courses", edit kursus Anda, dan buka tab "Module". Tambahkan modul baru, pilih tipe "Quiz", dan pilih kuis yang baru saja Anda buat dari daftar dropdown.'
                : 'Once the quiz is ready, return to the "Courses" menu, edit your course, and open the "Module" tab. Add a new module, select the "Quiz" type, and select the quiz you just created from the dropdown list.'
            }
          >
            <div className="p-6 bg-card border-b flex flex-col gap-4">
              <div className="grid gap-2 max-w-sm">
                <Label>{lang === 'id' ? 'Pilih Kuis dari Bank' : 'Select Quiz from Bank'}</Label>
                <div className="border rounded-md px-3 py-2 text-sm flex justify-between items-center text-muted-foreground bg-muted/20">
                  <span>{lang === 'id' ? '-- Pilih Kuis --' : '-- Select Quiz --'}</span>
                  <ChevronDown className="size-4" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === 'id' ? 'Hanya kuis aktif yang akan muncul di sini.' : 'Only active quizzes will appear here.'}
                </p>
              </div>
            </div>
            <GuideTip type="tip" className="m-4 border-none">
              {lang === 'id'
                ? 'Satu kuis bisa digunakan kembali (reusable) di banyak kursus yang berbeda.'
                : 'A single quiz can be reused across many different courses.'}
            </GuideTip>
          </GuideStep>
        </TabsContent>

        {/* DISCUSSION TAB */}
        <TabsContent value="discussion" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Melihat Daftar Pertanyaan' : 'Viewing the Question List'}
            description={
              lang === 'id'
                ? 'Buka editor kursus dan navigasikan ke tab "Comments". Di sini Anda akan melihat semua komentar dan pertanyaan yang diajukan oleh siswa di setiap materi/video.'
                : 'Open the course editor and navigate to the "Comments" tab. Here you will see all comments and questions asked by students across all lessons/videos.'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="flex gap-4 items-start border rounded-lg p-4 bg-muted/10">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  JD
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">John Doe</p>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">I don't quite understand how the state works in this example. Could you explain it again?</p>
                </div>
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={2}
            title={lang === 'id' ? 'Membalas Komentar' : 'Replying to Comments'}
            description={
              lang === 'id'
                ? 'Klik tombol "Reply" pada komentar siswa untuk memberikan jawaban. Anda dapat memformat teks menggunakan markdown dasar jika diperlukan.'
                : 'Click the "Reply" button on a student\'s comment to provide an answer. You can format the text using basic markdown if needed.'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="pl-14 space-y-3">
                <Textarea placeholder={lang === 'id' ? 'Ketik balasan Anda di sini...' : 'Type your reply here...'} rows={3} className="resize-none" />
                <div className="flex justify-end">
                  <Button size="sm">
                    <MessageSquare className="size-4 mr-2" />
                    {lang === 'id' ? 'Balas' : 'Reply'}
                  </Button>
                </div>
              </div>
            </div>
            <GuideTip type="tip" className="m-4 border-none">
              {lang === 'id'
                ? 'Merespons komentar siswa dengan cepat akan meningkatkan tingkat kepuasan dan rating kursus Anda.'
                : 'Responding quickly to student comments will improve their satisfaction and your course rating.'}
            </GuideTip>
          </GuideStep>
        </TabsContent>

        {/* ATTACHMENT TAB */}
        <TabsContent value="attachment" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Apa yang bisa diunggah?' : 'What can be uploaded?'}
            description={
              lang === 'id'
                ? 'Anda dapat mengunggah berbagai format file seperti PDF, slide presentasi (PPTX), dokumen Word (DOCX), Excel, atau bahkan file arsip (ZIP) berisi source code latihan.'
                : 'You can upload various file formats such as PDFs, presentation slides (PPTX), Word documents (DOCX), Excel, or even archive files (ZIP) containing exercise source code.'
            }
          >
            <div className="p-6 bg-card flex flex-wrap gap-3 border-b">
              <div className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm bg-muted/10">
                <FileText className="size-4 text-blue-500" /> PDF Document
              </div>
              <div className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm bg-muted/10">
                <FileSpreadsheet className="size-4 text-green-500" /> Excel Sheet
              </div>
              <div className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm bg-muted/10">
                <FileArchive className="size-4 text-orange-500" /> ZIP Source Code
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={2}
            title={lang === 'id' ? 'Mengunggah Lampiran Baru' : 'Uploading a New Attachment'}
            description={
              lang === 'id'
                ? 'Di dalam tab "Resources", klik area unggah file atau seret file Anda ke kotak yang disediakan. File akan terunggah secara otomatis ke server.'
                : 'In the "Resources" tab, click the file upload area or drag your file into the provided box. The file will be automatically uploaded to the server.'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors">
                <Upload className="size-10 mb-3 text-primary/50" />
                <p className="font-medium text-foreground">{lang === 'id' ? 'Tarik & Letakkan file di sini' : 'Drag & Drop files here'}</p>
                <p className="text-sm mt-1">{lang === 'id' ? 'atau klik untuk mencari' : 'or click to browse'}</p>
              </div>
            </div>
          </GuideStep>
          <GuideStep
            step={3}
            title={lang === 'id' ? 'Mengubah Nama Tampilan' : 'Changing the Display Name'}
            description={
              lang === 'id'
                ? 'Setelah file diunggah, nama asli file akan digunakan secara default. Anda sangat disarankan untuk mengubah nama tampilan (Display Name) agar lebih mudah dipahami oleh siswa.'
                : 'After a file is uploaded, its original name is used by default. It is highly recommended to change the Display Name to make it easier for students to understand.'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="flex items-center gap-4 border rounded-lg p-4 bg-muted/10">
                <FileText className="size-8 text-blue-500" />
                <div className="flex-1 grid gap-2">
                  <Label>{lang === 'id' ? 'Nama Tampilan' : 'Display Name'}</Label>
                  <Input defaultValue="Cheat Sheet React Hooks" />
                  <p className="text-xs text-muted-foreground">Original: react-hooks-final-v2.pdf</p>
                </div>
              </div>
            </div>
          </GuideStep>
        </TabsContent>

        {/* ANNOUNCEMENT TAB */}
        <TabsContent value="announcement" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Fungsi Pengumuman' : 'Announcement Function'}
            description={
              lang === 'id'
                ? 'Pengumuman berguna saat Anda memperbarui materi kursus, menjadwalkan sesi live, atau ada informasi perbaikan sistem. Saat Anda membuat pengumuman, sistem akan mengirimkan notifikasi kepada siswa.'
                : 'Announcements are useful when you update course material, schedule a live session, or have system maintenance information. When you create an announcement, the system will send notifications to students.'
            }
          >
            <div className="p-6 bg-card border-b space-y-4">
              <div className="grid gap-2">
                <Label>{lang === 'id' ? 'Subjek Pengumuman' : 'Announcement Subject'}</Label>
                <Input placeholder={lang === 'id' ? 'Pembaruan materi bab 3' : 'Chapter 3 material update'} />
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'id' ? 'Isi Pesan' : 'Message Body'}</Label>
                <Textarea rows={3} placeholder={lang === 'id' ? 'Halo semuanya...' : 'Hello everyone...'} className="resize-none" />
              </div>
              <Button className="w-fit">
                <Megaphone className="size-4 mr-2" />
                {lang === 'id' ? 'Kirim Pengumuman' : 'Send Announcement'}
              </Button>
            </div>
          </GuideStep>
          <GuideStep
            step={2}
            title={lang === 'id' ? 'Siapa yang akan menerimanya?' : 'Who will receive it?'}
            description={
              lang === 'id'
                ? 'Pengumuman HANYA akan dikirimkan kepada siswa yang sudah berhasil membeli/mendaftar kursus Anda. Siswa yang hanya menambahkan kursus ke keranjang tidak akan mendapatkannya.'
                : 'Announcements will ONLY be sent to students who have successfully purchased/enrolled in your course. Students who only added the course to their cart will not receive it.'
            }
          >
            <div className="p-6 bg-card border-b">
              <div className="flex items-center gap-4 border rounded-lg p-4 bg-primary/5 border-primary/20">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Users className="size-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">1,248</p>
                  <p className="text-sm text-muted-foreground">{lang === 'id' ? 'Siswa terdaftar akan menerima notifikasi' : 'Enrolled students will receive notifications'}</p>
                </div>
              </div>
            </div>
          </GuideStep>
        </TabsContent>
      </Tabs>

      <GuideFeedback className="mt-16" />
    </AdminPage>
  )
}
