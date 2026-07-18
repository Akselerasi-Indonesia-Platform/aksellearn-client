import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HelpCircle, ChevronRight, Settings, PlusCircle, Edit, Trash2, ListChecks, CheckSquare, Settings2, Hash } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { GuideLanguageToggle } from '@/components/admin/guide/guide-language-toggle'
import { GuideStep } from '@/components/admin/guide/guide-step'
import { GuideTip } from '@/components/admin/guide/guide-tip'
import { GuideFeedback } from '@/components/admin/guide/guide-feedback'
import { useGuideLang } from '@/hooks/use-guide-lang'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type QuizGuideSearch = {
  tab?: string
}

export const Route = createFileRoute('/admin/guide/quiz/')({
  validateSearch: (search: Record<string, unknown>): QuizGuideSearch => {
    return {
      tab: typeof search.tab === 'string' ? search.tab : 'crud',
    }
  },
  component: QuizGuidePage,
})

function QuizGuidePage() {
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
          {lang === 'id' ? 'Kuis' : 'Quizzes'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'id' ? 'Panduan Mengelola Kuis' : 'Quizzes Management Guide'}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {lang === 'id'
              ? 'Pelajari cara membuat dan mengelola bank kuis serta memahami berbagai tipe pertanyaan yang tersedia.'
              : 'Learn how to create and manage the quiz bank and understand the various available question types.'}
          </p>
        </div>
        <GuideLanguageToggle />
      </div>

      <Tabs value={tab || 'crud'} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8 flex flex-wrap h-auto w-full justify-start bg-transparent p-0 gap-2">
          <TabsTrigger value="crud" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <Settings className="size-4 mr-2" />
            {lang === 'id' ? 'Manajemen Kuis' : 'Quiz Management'}
          </TabsTrigger>
          <TabsTrigger value="types" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border bg-card hover:bg-muted/50 rounded-full px-4 py-2">
            <ListChecks className="size-4 mr-2" />
            {lang === 'id' ? 'Tipe Pertanyaan' : 'Question Types'}
          </TabsTrigger>
        </TabsList>

        {/* CRUD TAB */}
        <TabsContent value="crud" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Konsep Bank Kuis' : 'Quiz Bank Concept'}
            description={
              lang === 'id'
                ? 'Sistem ini menggunakan pendekatan "Quiz Bank". Artinya, Anda membuat kuis secara mandiri di menu "Quizzes", lalu menempelkannya (attach) ke dalam modul kursus. Satu kuis bisa dipakai berulang kali di berbagai kursus.'
                : 'This system uses a "Quiz Bank" approach. This means you create quizzes independently in the "Quizzes" menu, then attach them to a course module. A single quiz can be reused across different courses.'
            }
          >
            <GuideTip type="info" className="border-none">
              {lang === 'id'
                ? 'Jika Anda memperbarui soal di dalam kuis, perubahan tersebut akan otomatis terlihat di semua kursus yang menggunakan kuis tersebut.'
                : 'If you update questions inside a quiz, the changes will automatically reflect across all courses that use the quiz.'}
            </GuideTip>
          </GuideStep>

          <GuideStep
            step={2}
            title={lang === 'id' ? 'Membuat Kuis Baru' : 'Creating a New Quiz'}
            description={
              lang === 'id'
                ? 'Buka menu Quizzes dan klik tombol "Add Quiz" (Tambah Kuis). Isi Judul Kuis, Deskripsi, dan "Passing Grade" (Nilai Kelulusan minimum, misal 70).'
                : 'Open the Quizzes menu and click the "Add Quiz" button. Fill in the Quiz Title, Description, and the "Passing Grade" (minimum passing score, e.g., 70).'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border">
              <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border border-border w-fit">
                <PlusCircle className="size-5 text-primary" />
                <span className="font-medium text-sm">{lang === 'id' ? 'Tambah Kuis' : 'Add Quiz'}</span>
              </div>
            </div>
          </GuideStep>

          <GuideStep
            step={3}
            title={lang === 'id' ? 'Menambah dan Mengedit Soal' : 'Adding and Editing Questions'}
            description={
              lang === 'id'
                ? 'Setelah kuis terbuat, Anda dapat menambahkan pertanyaan dengan menekan tombol edit pada kuis. Anda dapat menyusun daftar soal, mengatur bobot nilai (points) tiap soal, dan memberikan penjelasan (explanation) untuk jawaban yang benar.'
                : 'Once the quiz is created, you can add questions by clicking the edit button on the quiz. You can compile a list of questions, set the points for each question, and provide an explanation for the correct answer.'
            }
          >
             <div className="p-6 bg-card border-b rounded-xl border">
              <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border border-border w-fit mb-4">
                <Edit className="size-5 text-blue-500" />
                <span className="font-medium text-sm">{lang === 'id' ? 'Edit Kuis (Builder)' : 'Edit Quiz (Builder)'}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                 {lang === 'id' ? 'Di dalam builder, Anda bisa mengklik "Add Question" untuk menambah soal, atau klik ikon edit pada soal yang sudah ada.' : 'Inside the builder, you can click "Add Question" to add a question, or click the edit icon on an existing question.'}
              </p>
            </div>
          </GuideStep>

          <GuideStep
            step={4}
            title={lang === 'id' ? 'Menghapus Kuis atau Soal' : 'Deleting Quizzes or Questions'}
            description={
              lang === 'id'
                ? 'Anda bisa menghapus kuis jika belum pernah dikerjakan oleh siswa. Jika Anda menghapus kuis yang sedang digunakan dalam modul kursus, kuis tersebut akan hilang dari kursus tersebut.'
                : 'You can delete a quiz if it has not been attempted by students. If you delete a quiz that is being used in a course module, the quiz will disappear from that course.'
            }
          >
             <div className="p-6 bg-card border-b rounded-xl border">
              <div className="flex items-center gap-3 bg-rose-50 p-4 rounded-lg border border-rose-100 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 w-fit">
                <Trash2 className="size-5 text-rose-500" />
                <span className="font-medium text-sm">{lang === 'id' ? 'Hapus' : 'Delete'}</span>
              </div>
            </div>
          </GuideStep>
        </TabsContent>

        {/* TYPES TAB */}
        <TabsContent value="types" className="space-y-12 max-w-4xl mt-0 focus-visible:outline-none focus-visible:ring-0">
          
          <GuideStep
            step={1}
            title={lang === 'id' ? 'Pilihan Ganda (Satu Jawaban Benar)' : 'Single Choice (Radio Button)'}
            description={
              lang === 'id'
                ? 'Tipe ini memungkinkan siswa memilih satu jawaban yang paling tepat dari beberapa pilihan yang ada (Radio button). Anda harus menandai satu opsi sebagai jawaban yang benar (Correct).'
                : 'This type allows students to select the single most accurate answer from several options (Radio button). You must mark exactly one option as Correct.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border space-y-4">
              <div className="flex gap-4 items-center mb-4">
                <CheckSquare className="size-8 text-blue-500" />
                <div className="text-sm">
                  <p className="font-medium">{lang === 'id' ? 'Penggunaan Umum:' : 'Common Use Case:'}</p>
                  <p className="text-muted-foreground">{lang === 'id' ? 'Soal ujian standar seperti "Siapa penemu lampu pijar?".' : 'Standard exam questions like "Who invented the light bulb?".'}</p>
                </div>
              </div>
              <div className="bg-muted/20 border rounded-lg p-5 space-y-4">
                <p className="font-bold text-sm">Q: {lang === 'id' ? 'Apa ibukota dari Indonesia?' : 'What is the capital of Indonesia?'}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 border border-primary bg-primary/5 rounded-md cursor-not-allowed opacity-70">
                     <div className="size-4 rounded-full border border-primary flex items-center justify-center">
                       <div className="size-2 rounded-full bg-primary" />
                     </div>
                     <span className="text-sm font-medium">Jakarta</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-md bg-background cursor-not-allowed opacity-70">
                     <div className="size-4 rounded-full border border-muted-foreground" />
                     <span className="text-sm">Bandung</span>
                  </div>
                </div>
              </div>
            </div>
          </GuideStep>

          <GuideStep
            step={2}
            title={lang === 'id' ? 'Pilihan Ganda (Banyak Jawaban Benar)' : 'Multiple Choice (Checkboxes)'}
            description={
              lang === 'id'
                ? 'Tipe ini memungkinkan siswa untuk memilih lebih dari satu jawaban yang benar (Checkboxes). Anda bisa mengatur dua atau lebih opsi sebagai jawaban yang benar.'
                : 'This type allows students to select more than one correct answer (Checkboxes). You can set two or more options as correct.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border space-y-4">
              <div className="flex gap-4 items-center mb-4">
                <ListChecks className="size-8 text-green-500" />
                <div className="text-sm">
                  <p className="font-medium">{lang === 'id' ? 'Penggunaan Umum:' : 'Common Use Case:'}</p>
                  <p className="text-muted-foreground">{lang === 'id' ? 'Soal yang membutuhkan beberapa pilihan benar, seperti "Pilih buah yang berwarna merah:".' : 'Questions requiring multiple correct selections, like "Select the fruits that are red:".'}</p>
                </div>
              </div>
              <div className="bg-muted/20 border rounded-lg p-5 space-y-4">
                <p className="font-bold text-sm">Q: {lang === 'id' ? 'Pilih buah yang berwarna merah:' : 'Select the fruits that are red:'}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 border border-primary bg-primary/5 rounded-md cursor-not-allowed opacity-70">
                     <div className="size-4 rounded border border-primary bg-primary flex items-center justify-center text-primary-foreground">
                        <CheckSquare className="size-3" />
                     </div>
                     <span className="text-sm font-medium">Apple</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-md bg-background cursor-not-allowed opacity-70">
                     <div className="size-4 rounded border border-muted-foreground" />
                     <span className="text-sm">Banana</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-primary bg-primary/5 rounded-md cursor-not-allowed opacity-70">
                     <div className="size-4 rounded border border-primary bg-primary flex items-center justify-center text-primary-foreground">
                        <CheckSquare className="size-3" />
                     </div>
                     <span className="text-sm font-medium">Strawberry</span>
                  </div>
                </div>
              </div>
            </div>
          </GuideStep>

          <GuideStep
            step={3}
            title={lang === 'id' ? 'Benar / Salah' : 'True / False'}
            description={
              lang === 'id'
                ? 'Pertanyaan biner sederhana di mana hanya ada dua kemungkinan jawaban: Benar (True) atau Salah (False).'
                : 'A simple binary question where there are only two possible answers: True or False.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border space-y-4">
              <div className="flex gap-4 items-center mb-4">
                <Settings2 className="size-8 text-orange-500" />
                <div className="text-sm">
                   <p className="text-muted-foreground">{lang === 'id' ? 'Sistem akan secara otomatis membuat opsi True dan False untuk Anda.' : 'The system will automatically generate the True and False options for you.'}</p>
                </div>
              </div>
              <div className="bg-muted/20 border rounded-lg p-5 space-y-4">
                <p className="font-bold text-sm text-center">Q: {lang === 'id' ? 'Bumi itu datar.' : 'The earth is flat.'}</p>
                <div className="flex gap-4 max-w-sm mx-auto">
                  <div className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-md bg-background cursor-not-allowed opacity-70">
                     <div className="size-4 rounded-full border border-muted-foreground" />
                     <span className="text-sm">True</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-2 p-3 border border-primary bg-primary/5 rounded-md cursor-not-allowed opacity-70">
                     <div className="size-4 rounded-full border border-primary flex items-center justify-center">
                       <div className="size-2 rounded-full bg-primary" />
                     </div>
                     <span className="text-sm font-medium">False</span>
                  </div>
                </div>
              </div>
            </div>
          </GuideStep>

          <GuideStep
            step={4}
            title={lang === 'id' ? 'Rentang Skala (Range / Likert)' : 'Range / Likert Scale (1-10)'}
            description={
              lang === 'id'
                ? 'Tipe pertanyaan ini umumnya digunakan untuk survei tingkat kepuasan, rating, atau kuesioner psikologi. Tidak ada jawaban salah; setiap pilihan dianggap valid dan siswa akan mendapatkan poin penuh selama mereka menjawabnya.'
                : 'This question type is typically used for satisfaction surveys, ratings, or psychological questionnaires. There are no wrong answers; every choice is considered valid and the student will get full points as long as they answer it.'
            }
          >
            <div className="p-6 bg-card border-b rounded-xl border space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Hash className="size-8 text-purple-500" />
                <div className="text-sm">
                  <p className="font-medium">{lang === 'id' ? 'Contoh Preset Skala:' : 'Example Scale Presets:'}</p>
                  <ul className="list-disc ml-5 text-muted-foreground">
                    <li>Numeric (1-5)</li>
                    <li>Numeric (1-10)</li>
                    <li>Likert ({lang === 'id' ? 'Sangat Setuju - Sangat Tidak Setuju' : 'Strongly Agree - Strongly Disagree'})</li>
                  </ul>
                </div>
              </div>
              <div className="bg-muted/20 border rounded-lg p-5 space-y-4">
                <p className="font-bold text-sm text-center">{lang === 'id' ? 'Seberapa puas Anda dengan kursus ini?' : 'How satisfied are you with this course?'}</p>
                <div className="flex justify-between items-center gap-1 sm:gap-2 mt-4 max-w-lg mx-auto">
                   {[1, 2, 3, 4, 5].map((num) => (
                     <div key={num} className={`size-10 md:size-12 rounded-full border flex items-center justify-center font-bold text-sm cursor-not-allowed opacity-70 transition-colors ${num === 4 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground'}`}>
                       {num}
                     </div>
                   ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1 mt-2 max-w-lg mx-auto w-full font-medium uppercase tracking-wider">
                   <span>{lang === 'id' ? 'Sangat Buruk' : 'Very Poor'}</span>
                   <span>{lang === 'id' ? 'Sangat Baik' : 'Excellent'}</span>
                </div>
              </div>
              <GuideTip type="tip" className="border-none mt-2">
                {lang === 'id'
                  ? 'Karena ini adalah pertanyaan berbasis penyelesaian, Anda tidak perlu menandai "Is Correct" secara manual. Semua opsi diaktifkan sebagai jawaban benar di latar belakang.'
                  : 'Since this is a completion-based question, you do not need to manually mark "Is Correct". All options are enabled as correct answers in the background.'}
              </GuideTip>
            </div>
          </GuideStep>

        </TabsContent>
      </Tabs>

      <GuideFeedback className="mt-16" />
    </AdminPage>
  )
}
