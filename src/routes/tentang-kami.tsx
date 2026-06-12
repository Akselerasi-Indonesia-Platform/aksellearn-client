import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Building2, Target, Eye, Award, Users, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/tentang-kami')({
  component: TentangKamiPage,
})

function TentangKamiPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary via-primary/90 to-[#2AABAA] text-white py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white,_transparent_70%)]" />
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
              <Building2 className="w-4 h-4" />
              <span>Tentang Kami</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
              Akselerasi<br />
              <span className="text-[#70C942]">Pertumbuhan SDM</span> Anda
            </h1>
            <p className="text-xl text-white/85 max-w-3xl mx-auto leading-relaxed font-medium">
              Kami adalah mitra layanan pengembangan sumber daya manusia yang berkomitmen mengakselerasi pertumbuhan individu dan organisasi melalui metode pembelajaran inovatif.
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  Siapa Kami?
                </h2>
                <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Akselerasi Indonesia</strong> adalah mitra layanan pengembangan sumber daya manusia yang berbasiskan coaching dan simulasi. Didukung oleh para coach dan trainer dengan sertifikasi dan lisensi internasional dari <strong>International Coach Federation (ICF)</strong> dan <strong>Neuro Linguistic Programming (NLP)</strong>.
                  </p>
                  <p>
                    Akselerasi Indonesia didirikan pada tanggal 10 November 2014 dan baru diresmikan secara notariil pada tanggal 13 April 2015. Sejak saat itu, kami telah melayani lebih dari 10.000+ peserta dari ratusan perusahaan terkemuka di Indonesia.
                  </p>
                  <p>
                    Platform digital kami, <strong>Aksellearn</strong>, hadir sebagai ekstensi dari layanan pelatihan kami — menghadirkan pengalaman belajar yang fleksibel, interaktif, dan berbasis hasil nyata.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://akselerasiindonesia.s3.ap-southeast-1.amazonaws.com/course/ko0CZTqiPwxKd3HNyLOQh6voJQDAlnIXxsVmRimh.jpg"
                    alt="Tim Akselerasi Indonesia"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                {/* Floating stat card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-slate-100">
                  <div className="text-3xl font-black text-primary">10K+</div>
                  <div className="text-sm text-slate-500 font-medium mt-0.5">Peserta Terlatih</div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-5 border border-slate-100">
                  <div className="text-3xl font-black text-[#70C942]">1000+</div>
                  <div className="text-sm text-slate-500 font-medium mt-0.5">Training Batch</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 bg-slate-50 border-y border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Nilai-Nilai Kami</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Prinsip yang mendasari setiap program dan layanan yang kami hadirkan</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: 'Berbasis Hasil',
                  desc: 'Setiap program dirancang dengan tujuan yang terukur dan berdampak nyata bagi peserta dan organisasi.',
                },
                {
                  icon: Eye,
                  title: 'Inovatif & Adaptif',
                  desc: 'Kami mengembangkan metode Deep Processing Learning yang memastikan akselerasi pemahaman dan perubahan perilaku.',
                },
                {
                  icon: Award,
                  title: 'Berstandar Internasional',
                  desc: 'Trainer dan coach kami bersertifikasi ICF dan NLP, memastikan kualitas tertinggi dalam setiap sesi pelatihan.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow space-y-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 px-4 bg-primary text-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
              {[
                { icon: Users, value: '10.000+', label: 'Peserta' },
                { icon: TrendingUp, value: '1.000+', label: 'Training Batch' },
                { icon: Award, value: '10+', label: 'Tahun Berpengalaman' },
                { icon: Building2, value: '100+', label: 'Klien Korporat' },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="text-4xl md:text-5xl font-black">{stat.value}</div>
                  <div className="text-primary-foreground/80 font-medium tracking-wide text-sm uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team / Partners */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Didukung oleh Para Profesional</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Tim kami terdiri dari praktisi berpengalaman lebih dari 10 tahun di dunia profesional dan pengembangan diri, dengan lisensi internasional yang telah teruji.
            </p>
            <div className="mt-10 rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://akselerasiindonesia.s3.ap-southeast-1.amazonaws.com/course/QjvYhrzN0H7BUBsJ5ZsWfnkaMinmI18EZSRcEKZY.jpg"
                alt="Tim profesional Akselerasi Indonesia"
                className="w-full aspect-video object-cover"
              />
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
