import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlatformStore } from '@/hooks/use-platform'

export const Route = createFileRoute('/hubungi-kami')({
  component: HubungiKamiPage,
})

function HubungiKamiPage() {
  const { profile } = usePlatformStore()
  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => setIsMounted(true), [])

  const email = (isMounted && profile?.email) || 'info@akselerasiindonesia.com'
  const whatsapp = (isMounted && profile?.whatsapp_number) || '+62 812 8060 0616'
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '')

  const [submitted, setSubmitted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const body = `Nama Lengkap: ${form.name}\nEmail: ${form.email}\nNomor Telepon: ${form.phone}\n\nPesan:\n${form.message}`
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`
    
    await new Promise((r) => setTimeout(r, 600))
    window.location.href = mailtoUrl

    setIsSubmitting(false)
    setSubmitted(true)
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary via-primary/90 to-[#2AABAA] text-white py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white,_transparent_70%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
              <MessageSquare className="w-4 h-4" />
              <span>Hubungi Kami</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              Ada Pertanyaan? <br />
              <span className="text-[#70C942]">Kami Siap Membantu.</span>
            </h1>
            <p className="text-white/85 text-lg max-w-2xl mx-auto leading-relaxed">
              Tim kami akan merespons pesan Anda dalam 1x24 jam kerja.
            </p>
          </div>
        </section>

        {/* Contact Layout */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">

            {/* Info Cards */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Informasi Kontak</h2>
              {[
                {
                  icon: Phone,
                  title: 'WhatsApp',
                  value: whatsapp,
                  href: `https://wa.me/${cleanWhatsapp}`,
                  linkText: 'Chat Sekarang →',
                },
                {
                  icon: Mail,
                  title: 'Email',
                  value: email,
                  href: `mailto:${email}`,
                  linkText: 'Kirim Email →',
                },
                {
                  icon: MapPin,
                  title: 'Kantor',
                  value: 'Jakarta, Indonesia',
                  href: undefined,
                  linkText: undefined,
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-slate-600 text-sm mt-0.5">{item.value}</div>
                    {item.href && (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-semibold hover:underline mt-1 inline-block">
                        {item.linkText}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-10">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px] space-y-5">
                  <div className="w-16 h-16 bg-[#70C942]/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#70C942]" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Pesan Terkirim!</h3>
                  <p className="text-slate-500 max-w-sm leading-relaxed">
                    Terima kasih! Draf pesan Anda telah diteruskan ke aplikasi email untuk dikirimkan ke <span className="font-semibold text-slate-700">{email}</span>.
                  </p>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}>
                    Kirim Pesan Lain
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Kirim Pesan</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap <span className="text-destructive">*</span></Label>
                      <Input id="name" name="name" placeholder="Nama Anda" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                      <Input id="email" name="email" type="email" placeholder="email@domain.com" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input id="phone" name="phone" placeholder="+62 ..." value={form.phone} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subjek <span className="text-destructive">*</span></Label>
                      <Input id="subject" name="subject" placeholder="Topik pertanyaan Anda" value={form.subject} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Ceritakan kebutuhan atau pertanyaan Anda di sini..."
                      className="min-h-[140px] resize-none"
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className={cn('w-full gap-2', isSubmitting && 'opacity-80')} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
