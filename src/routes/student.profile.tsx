import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import {
  Phone,
  Mail,
  Building2,
  ShieldCheck,
  Sparkles,
  MapPin,
  Globe,
  Settings2,
} from 'lucide-react'
import { getUser } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

function StudentProfilePage() {
  const user = getUser()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProfileHeader user={user} />

      <div className="grid md:grid-cols-12 gap-8 px-4">
        <div className="md:col-span-7 space-y-8">
          <ProfessionalSummary bio={user.profile?.bio} />
          <ExperienceIdentity email={user.email} phone={user.phone} />
        </div>

        <div className="md:col-span-5 space-y-8">
          <EnterpriseLinks organizations={user.organizations || []} />
          <DigitalFootprint />
        </div>
      </div>
    </div>
  )
}

// --- Atomic Components ---

function ProfileHeader({ user }: { user: any }) {
  return (
    <>
      <div className="relative mb-16">
        <div className="h-48 bg-gradient-to-br from-[#056FAE] via-[#1A7AB8] to-[#2AABAA] rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          <div className="absolute top-0 right-0 -mr-20 -mt-20 size-64 rounded-full border border-white/10" />
          <div className="absolute top-10 right-10 -mr-20 -mt-20 size-64 rounded-full border border-white/5" />
        </div>
        <div className="absolute -bottom-12 left-12 z-10">
          <Avatar className="size-32 border-4 border-white rounded-full bg-white">
            <AvatarImage src={user.profile?.avatar_url || user.avatar_url || undefined} className="rounded-full object-cover" />
            <AvatarFallback className="bg-[#0D3A6E] text-[#70C942] text-4xl font-bold rounded-full">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="px-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-[#0D3A6E] tracking-tight">
              {user.profile?.display_name || user.name}
            </h1>
            <Badge
              variant="secondary"
              className="bg-[#F0F7FF] text-[#056FAE] border border-[#056FAE]/20 font-semibold px-3 py-1 rounded-xl"
            >
              {user.role}
            </Badge>
          </div>
          <p className="text-[#0D3A6E]/50 font-semibold text-xs uppercase tracking-[0.15em] flex items-center gap-2">
            @{user.profile?.username || user.email.split('@')[0]}{' '}
            <span className="size-1 bg-[#056FAE]/30 rounded-full" /> Joined{' '}
            {new Date().getFullYear()}
          </p>
        </div>

        <div className="flex gap-3">
          <Badge
            variant="outline"
            className="h-10 rounded-xl px-4 border-[#056FAE]/10 font-semibold bg-white text-[#0D3A6E]/70 gap-2"
          >
            <Sparkles className="size-4 text-[#70C942]" /> Professional Learner
          </Badge>
          <Link
            to="/student/settings"
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 rounded-xl px-4 border-2 border-[#056FAE]/10 bg-white text-[#056FAE] hover:bg-[#F0F7FF] hover:border-[#056FAE]/30 gap-2"
          >
            <Settings2 className="size-4" /> Edit Profile
          </Link>
        </div>
      </div>
    </>
  )
}

function ProfessionalSummary({ bio }: { bio?: string }) {
  return (
    <section className="space-y-4">
      <h4 className="text-[10px] font-semibold text-[#056FAE]/60 uppercase tracking-[0.2em] pl-1">
        Professional Summary
      </h4>
      <div className="bg-white p-8 rounded-2xl border border-slate-200">
        <p className="text-[#0D3A6E]/80 text-sm leading-relaxed">
          {bio || 'Write your bio'}
        </p>
      </div>
    </section>
  )
}

function ExperienceIdentity({ email, phone }: { email: string; phone?: string | null }) {
  return (
    <section className="space-y-4">
      <h4 className="text-[10px] font-semibold text-[#056FAE]/60 uppercase tracking-[0.2em] pl-1">
        Experience & Identity
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#F0F7FF]/50 p-6 rounded-2xl border border-[#056FAE]/10 space-y-3">
          <Mail className="size-5 text-[#056FAE]" />
          <div>
            <p className="text-[10px] font-semibold text-[#056FAE]/60 uppercase tracking-widest">
              Email Address
            </p>
            <p className="text-sm font-semibold text-[#0D3A6E] mt-1 break-all">
              {email}
            </p>
          </div>
        </div>
        <div className="bg-[#F0F7FF]/50 p-6 rounded-2xl border border-[#056FAE]/10 space-y-3">
          <Phone className="size-5 text-[#056FAE]" />
          <div>
            <p className="text-[10px] font-semibold text-[#056FAE]/60 uppercase tracking-widest">
              Phone Number
            </p>
            <p className="text-sm font-semibold text-[#0D3A6E] mt-1">
              {phone || 'Not Linked'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function EnterpriseLinks({ organizations }: { organizations: any[] }) {
  return (
    <section className="space-y-4">
      <h4 className="text-[10px] font-semibold text-[#056FAE]/60 uppercase tracking-[0.2em] pl-1">
        Enterprise Links
      </h4>
      {organizations && organizations.length > 0 ? (
        <div className="space-y-4">
          {organizations.map((org) => (
            <Card
              key={org.uuid}
              className="rounded-2xl border-2 border-[#056FAE]/10 bg-white overflow-hidden group hover:border-[#70C942] transition-all cursor-default shadow-none"
            >
              <CardContent className="p-6 flex items-center gap-5">
                <div className="size-16 bg-[#F0F7FF] rounded-2xl flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                  {org.logo_url ? (
                    <img
                      src={org.logo_url}
                      alt={org.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="size-8 text-[#056FAE]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-[#0D3A6E] tracking-tight">
                      {org.name}
                    </h5>
                    <ShieldCheck className="size-4 text-[#70C942]" />
                  </div>
                  <p className="text-[10px] font-semibold text-[#056FAE] uppercase tracking-widest mt-1">
                    Verified Corporate Link
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-[#F0F7FF]/50 p-8 rounded-2xl border border-dashed border-[#056FAE]/20 text-center space-y-4">
          <Building2 className="size-10 text-[#056FAE]/40 mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#0D3A6E]/70 uppercase tracking-widest">
              No Active Organizations
            </p>
            <p className="text-[10px] text-[#056FAE]/60 font-medium px-4 leading-relaxed">
              Corporate links are automatically synced via your Workspace account.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

function DigitalFootprint() {
  return (
    <section className="space-y-4">
      <h4 className="text-[10px] font-semibold text-[#056FAE]/60 uppercase tracking-[0.2em] pl-1">
        Digital Footprint
      </h4>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-[#056FAE]">
            <Globe className="size-5" />
          </div>
          <p className="text-xs font-medium text-[#0D3A6E]/70">
            Public visibility active
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-[#056FAE]">
            <MapPin className="size-5" />
          </div>
          <p className="text-xs font-medium text-[#0D3A6E]/70">
            Global Citizen (Cloud Synchronized)
          </p>
        </div>
      </div>
    </section>
  )
}

export const Route = createFileRoute('/student/profile')({
  component: StudentProfilePage,
})
