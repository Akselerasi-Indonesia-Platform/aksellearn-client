import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Shield } from 'lucide-react'
import { usePlatformStore } from '@/hooks/use-platform'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

type Lang = 'id' | 'en'

export const Route = createFileRoute('/aksesibilitas')({
  component: AksesibilitasPage,
})

function AksesibilitasPage() {
  const { profile } = usePlatformStore()
  const [isMounted, setIsMounted] = React.useState(false)
  const { i18n } = useTranslation()
  React.useEffect(() => setIsMounted(true), [])

  const lang = (isMounted && i18n.language.startsWith('en')) ? 'en' : 'id'

  const email = (isMounted && profile?.email) || 'info@akselerasiindonesia.com'
  const whatsapp = (isMounted && profile?.whatsapp_number) || '+62 812 8060 0616'
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '')

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-[#2AABAA] text-white py-20 px-4 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white,_transparent_70%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Shield className="w-4 h-4" />
              <span>{lang === 'id' ? 'Aksesibilitas' : 'Accessibility'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              {lang === 'id' ? 'Pernyataan Aksesibilitas' : 'Accessibility Statement'}
            </h1>
            <p className="text-white/80 text-lg">
              {lang === 'id' ? 'Terakhir diperbarui: Juni 2025' : 'Last updated: June 2025'}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
            <div className="space-y-10 text-slate-700">

              {lang === 'id' ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Komitmen Aksesibilitas</h2>
                    <p className="leading-relaxed">
                      Sasaran kami adalah menyediakan pembelajaran serta pengembangan skill yang fleksibel dan efektif untuk memberdayakan organisasi dan individu. Kami percaya konten edukasi berkualitas tinggi seharusnya tersedia untuk setiap orang. Inilah alasan aksesibilitas menjadi area fokus kami. Tim kami terus berupaya untuk meningkatkan aksesibilitas layanan kami. Berikut beberapa contoh bagaimana kami mengembangkan platform Aksellearn yang lebih mudah diakses:
                    </p>
                    <ul className="list-disc list-inside space-y-4 mt-4 text-slate-600">
                      <li className="leading-relaxed"><strong className="text-slate-900">Panduan aksesibilitas.</strong> Kami berupaya maksimal untuk mengikuti standar Web Content Accessibility Guidelines (WCAG) 2.1 dan menggunakan spesifikasi WAI-ARIA. Kami mengevaluasi aplikasi situs web dan seluler kami menggunakan versi internasional VPAT standar.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Pengujian kompatibilitas.</strong> Kami menguji aplikasi situs web dan seluler kami untuk kompatibilitas dengan beberapa pembaca layar dan alat aksesibilitas, seperti NVDA, JAWS®, Voiceover untuk macOS dan iOS, serta Talkback untuk Android.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Subtitel dan teks keterangan.</strong> Banyak kursus kami menyertakan subtitel yang dibuat oleh mesin yang tersedia dalam beberapa bahasa. Teks keterangan juga tersedia di beberapa kursus kami.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Pengaturan video.</strong> Pemutar video kami menyertakan sejumlah fitur dan pengaturan yang memungkinkan pelajar menyempurnakan pengalaman belajar mereka.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Cari filter.</strong> Filter pencarian kami memungkinkan pelajar menemukan kursus yang dilengkapi subtitel dan teks keterangan.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Sistem desain.</strong> Aksesibilitas merupakan prinsip inti sistem desain internal kami.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Rekomendasi instruktur.</strong> Kami memberikan instruktur rekomendasi mengenai cara membuat kursus yang mudah diakses dan inklusif.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Riset berkelanjutan.</strong> Kami bekerja sama dengan konsultan aksesibilitas untuk mengaudit dan menyediakan rekomendasi guna meningkatkan aksesibilitas layanan kami.</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Bantuan aksesibilitas</h2>
                    <p className="leading-relaxed">
                      Jika Anda mengalami kesulitan dalam menggunakan atau mengakses Aksellearn, atau memiliki saran mengenai cara agar kami dapat meningkatkan aksesibilitas layanan kami, silakan kirim email kepada kami di <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a> atau gunakan mekanisme dukungan dalam aplikasi.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Accessibility Commitment</h2>
                    <p className="leading-relaxed">
                      Our goal is to provide flexible and effective learning and skill development to empower organizations and individuals. We believe high-quality educational content should be available to everyone. This is why accessibility is one of our key focus areas. Our team continuously works to improve the accessibility of our services. Here are some examples of how we are building a more accessible Aksellearn platform:
                    </p>
                    <ul className="list-disc list-inside space-y-4 mt-4 text-slate-600">
                      <li className="leading-relaxed"><strong className="text-slate-900">Accessibility guidelines.</strong> We make our best effort to follow the Web Content Accessibility Guidelines (WCAG) 2.1 published by the World Wide Web Consortium (W3C) and use WAI-ARIA specifications. We evaluate our web and mobile apps using the international version of the standard Voluntary Product Accessibility Template (VPAT).</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Compatibility testing.</strong> We test our web and mobile apps for compatibility with several screen readers and accessibility tools, such as NVDA, JAWS®, Voiceover for macOS and iOS, and Talkback for Android.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Subtitles and closed captions.</strong> Many of our courses include machine-generated subtitles available in multiple languages. Closed captions are also available on select courses.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Video settings.</strong> Our video player includes features and settings that allow learners to customize their learning experience, including keyboard shortcuts on the Aksellearn marketplace and most Aksellearn Business products.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Search filters.</strong> Our search filters on the Aksellearn marketplace and most Aksellearn Business products allow learners to find courses with subtitles and closed captions.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Design system.</strong> Accessibility is a core principle of our internal design system. Our engineers and designers work with accessibility consultants on design system updates.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Instructor recommendations.</strong> We provide instructors with recommendations on how to create accessible and inclusive courses.</li>
                      <li className="leading-relaxed"><strong className="text-slate-900">Ongoing research.</strong> We work with accessibility consultants to audit and provide recommendations to improve the accessibility of our services.</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Accessibility Assistance</h2>
                    <p className="leading-relaxed">
                      If you have difficulty using or accessing Aksellearn, or have suggestions for how we can improve the accessibility of our services, please email us at <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a> or use the in-app support mechanism.
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
