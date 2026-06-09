import { Link } from '@tanstack/react-router'
import { Globe, Instagram, Linkedin, MessageSquare, Mail } from 'lucide-react'
import { APP_CONFIG } from '@/config/app'
import { usePlatformStore } from '@/hooks/use-platform'
import { useAuthStore } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function PublicFooter() {
  const currentYear = new Date().getFullYear()
  const { profile } = usePlatformStore()
  const { user } = useAuthStore()
  
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const name = (isMounted && profile?.name) || APP_CONFIG.name
  const description = (isMounted && profile?.tagline) || APP_CONFIG.description
  const whatsapp = (isMounted && profile?.whatsapp_number) || APP_CONFIG.contact.whatsapp
  const email = (isMounted && profile?.email) || ''
  
  const canApplyInstructor = !isMounted || (!user || (!user.roles?.includes('Admin') && !user.roles?.includes('Super Admin') && !user.roles?.includes('Instructor')))
  
  const instagram = (isMounted && profile?.social_links?.instagram) || APP_CONFIG.contact.socials.instagram
  const linkedin = (isMounted && profile?.social_links?.linkedin) || APP_CONFIG.contact.socials.linkedin
  const youtube = (isMounted && profile?.social_links?.youtube) || APP_CONFIG.contact.socials.youtube
  const facebook = (isMounted && profile?.social_links?.facebook) || ''

  return (
    <footer className="w-full border-t border-white/10 bg-brand-gradient text-white/90 relative">
      <div className="absolute inset-0 bg-slate-950/30 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16 relative z-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-2">
            <Link className="flex items-center space-x-2 mb-4 text-white drop-shadow-sm" to="/">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden">
                {profile?.logo?.url ? (
                  <img src={profile.logo.url} alt="Logo" className="w-full h-full object-contain p-0.5" />
                ) : profile?.logo_dark?.url ? (
                  <img src={profile.logo_dark.url} alt="Logo" className="w-full h-full object-contain p-0.5" />
                ) : (
                  <img src="/images/brand/logo-color.png" alt="Logo" className="w-full h-full object-contain p-1" />
                )}
              </div>
              <span className="text-xl font-black tracking-tighter uppercase text-white drop-shadow-sm">
                {name.split(' ')[0]}
                <span className="text-[#70C942] italic font-black">
                  {name.split(' ')[1] || ''}
                </span>
              </span>
            </Link>
            <p className="max-w-xs mb-6 text-sm leading-relaxed font-medium text-white/90 drop-shadow-sm">
              {description}
            </p>
            <div className="flex gap-4">
              {whatsapp && (
                <Button
                  asChild
                  className="h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-sm text-white shadow-sm transition-all hover:text-[#70C942] hover:border-[#70C942]/30"
                  size="icon"
                  variant="ghost"
                  aria-label="Contact us on WhatsApp"
                >
                  <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-5 w-5 drop-shadow-sm" />
                  </a>
                </Button>
              )}
              {email && (
                <Button
                  asChild
                  className="h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-sm text-white shadow-sm transition-all hover:text-[#70C942] hover:border-[#70C942]/30"
                  size="icon"
                  variant="ghost"
                  aria-label="Send us an email"
                >
                  <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer">
                    <Mail className="h-5 w-5 drop-shadow-sm" />
                  </a>
                </Button>
              )}
              {instagram && (
                <Button
                  asChild
                  className="h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-sm text-white shadow-sm transition-all hover:text-[#70C942] hover:border-[#70C942]/30"
                  size="icon"
                  variant="ghost"
                  aria-label="Follow us on Instagram"
                >
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5 drop-shadow-sm" />
                  </a>
                </Button>
              )}
              {linkedin && (
                <Button
                  asChild
                  className="h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-sm text-white shadow-sm transition-all hover:text-[#70C942] hover:border-[#70C942]/30"
                  size="icon"
                  variant="ghost"
                  aria-label="Follow us on LinkedIn"
                >
                  <a href={linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5 drop-shadow-sm" />
                  </a>
                </Button>
              )}
              {youtube && (
                <Button
                  asChild
                  className="h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-sm text-white shadow-sm transition-all hover:text-[#70C942] hover:border-[#70C942]/30"
                  size="icon"
                  variant="ghost"
                  aria-label="Follow us on YouTube"
                >
                  <a href={youtube} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-5 w-5 drop-shadow-sm" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-white drop-shadow-sm tracking-wide">Discovery</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link className="text-white/90 drop-shadow-sm hover:text-[#70C942] hover:drop-shadow-md transition-all" to="/search">
                  Courses
                </Link>
              </li>
            </ul>
          </div>


        </div>
      </div>
      <div className="w-full bg-black/30 backdrop-blur-sm py-5 border-t border-white/10 relative z-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              className="rounded-full gap-2 border-white/20 text-white hover:bg-white/10 shadow-sm drop-shadow-sm"
              size="sm"
              variant="outline-white"
            >
              <Globe className="h-4 w-4" />
              English
            </Button>
            <p className="text-xs text-white/90 font-semibold tracking-widest drop-shadow-sm">
              © {currentYear} {name}. Powered by{" "}
              <a className="text-white/90 drop-shadow-sm hover:text-[#70C942] hover:drop-shadow-md transition-all" href="https://www.akselerasiindonesia.com" target="_blank" rel="noopener noreferrer">
                Akselerasi Indonesia
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
