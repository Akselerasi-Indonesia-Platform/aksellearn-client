import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/hooks/use-auth'
import { instructorApplicationService } from '@/services/instructor-application.service'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Globe, Clock, Users, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/become-an-instructor')({
  component: BecomeAnInstructorPage,
})

function BecomeAnInstructorPage() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['instructor-status'],
    queryFn: () => instructorApplicationService.getStatus(),
    enabled: isAuthenticated,
  })

  const status = statusData?.data?.status

  const handleCtaClick = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: '/instructor/apply' } })
      return
    }
    
    if (user?.roles?.includes('Instructor')) {
      navigate({ to: '/admin/dashboard' })
      return
    }

    if (status === null || status === undefined || status === 'rejected') {
      navigate({ to: '/instructor/apply' })
    }
  }

  const renderSmartCTA = (isHero: boolean = false) => {
    const baseClasses = "px-8 py-6 text-lg shadow-lg font-bold transition-all"
    const heroClasses = "bg-white text-primary hover:bg-white/90 hover:scale-105 hover:shadow-xl"
    const defaultClasses = "hover:scale-105 hover:shadow-xl"
    
    const className = `${baseClasses} ${isHero ? heroClasses : defaultClasses}`

    if (isLoading) {
      return <Button disabled size="lg" className={className} variant={isHero ? "outline" : "default"}>Loading...</Button>
    }

    if (isAuthenticated) {
      if (user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin')) {
        return (
          <div className="flex flex-col items-center gap-3">
            <Button disabled size="lg" className={className} variant={isHero ? "outline" : "secondary"}>
              You are an Admin
            </Button>
            <p className={`text-sm font-medium ${isHero ? 'text-white/80' : 'text-muted-foreground'}`}>
              Admins cannot apply as instructors.
            </p>
          </div>
        )
      }

      if (user?.roles?.includes('Instructor') || status === 'accepted') {
        return (
          <Button onClick={handleCtaClick} size="lg" className={className} variant={isHero ? "outline" : "default"}>
            Go to Dashboard
          </Button>
        )
      }

      if (status === 'pending' || status === 'under_review') {
        return (
          <div className="flex flex-col items-center gap-3">
            <Button disabled size="lg" variant={isHero ? "outline" : "secondary"} className={`${className} opacity-80`}>
              Application Submitted
            </Button>
            <Badge variant="outline" className={`text-sm font-medium px-3 py-1 ${isHero ? 'text-white border-white/30 bg-white/10' : 'bg-background/50 backdrop-blur-sm border-primary/20 text-foreground'}`}>
              Application {status === 'under_review' ? 'Under Review' : 'Pending'}
            </Badge>
          </div>
        )
      }
    }

    return (
      <Button onClick={handleCtaClick} size="lg" className={className} variant={isHero ? "outline" : "default"}>
        Get Started Now
      </Button>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50/50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground py-24 px-4 text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative max-w-4xl mx-auto space-y-6 z-10">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-4">
              Share what you know.<br className="hidden sm:block"/> Teach thousands.
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
              Join our community of expert instructors. Create courses, reach a global audience, and earn revenue doing what you love.
            </p>
            <div className="pt-10 flex justify-center min-h-[100px]">
              {renderSmartCTA(true)}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-24 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Why teach with us?</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Everything you need to build your personal brand and create a new revenue stream.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-sm">
                <DollarSign size={32} />
              </div>
              <h3 className="font-semibold text-xl text-gray-900">Earn Revenue</h3>
              <p className="text-gray-500 leading-relaxed">Get paid for every enrollment. Build a passive income stream with your expertise.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-sm">
                <Globe size={32} />
              </div>
              <h3 className="font-semibold text-xl text-gray-900">Build Your Brand</h3>
              <p className="text-gray-500 leading-relaxed">Showcase your skills to a global audience and establish yourself as an industry leader.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-sm">
                <Clock size={32} />
              </div>
              <h3 className="font-semibold text-xl text-gray-900">Flexible Schedule</h3>
              <p className="text-gray-500 leading-relaxed">Create content on your own time. You have complete control over your schedule.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-sm">
                <Users size={32} />
              </div>
              <h3 className="font-semibold text-xl text-gray-900">Expert Community</h3>
              <p className="text-gray-500 leading-relaxed">Connect with other experienced professionals and share best teaching practices.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-24 px-4 border-y border-gray-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight text-gray-900">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gray-100 z-0"></div>
              
              <div className="text-center space-y-5 relative z-10">
                <div className="w-16 h-16 bg-primary text-primary-foreground font-bold text-2xl rounded-2xl shadow-lg flex items-center justify-center mx-auto transform -rotate-3">1</div>
                <h3 className="font-semibold text-xl text-gray-900">Submit Application</h3>
                <p className="text-base text-gray-500 px-4 leading-relaxed">Fill out a short form detailing your professional background and teaching experience.</p>
              </div>
              
              <div className="text-center space-y-5 relative z-10">
                <div className="w-16 h-16 bg-primary text-primary-foreground font-bold text-2xl rounded-2xl shadow-lg flex items-center justify-center mx-auto transform rotate-3">2</div>
                <h3 className="font-semibold text-xl text-gray-900">Review Process</h3>
                <p className="text-base text-gray-500 px-4 leading-relaxed">Our team will review your profile to ensure quality standards. You'll hear back within 3-5 days.</p>
              </div>
              
              <div className="text-center space-y-5 relative z-10">
                <div className="w-16 h-16 bg-primary text-primary-foreground font-bold text-2xl rounded-2xl shadow-lg flex items-center justify-center mx-auto transform -rotate-3">3</div>
                <h3 className="font-semibold text-xl text-gray-900">Start Teaching</h3>
                <p className="text-base text-gray-500 px-4 leading-relaxed">Once approved, you get access to the Instructor Dashboard to create and publish your first course.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-24 px-4 max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold mb-8 tracking-tight text-gray-900 text-center">What we look for</h2>
            <ul className="space-y-6 text-lg text-gray-700">
              <li className="flex items-start bg-gray-50 p-4 rounded-xl">
                <CheckCircle2 className="text-primary mr-4 mt-0.5 flex-shrink-0" size={24} />
                <span className="leading-relaxed">Demonstrated expertise in your field (portfolio, open-source contributions, etc.)</span>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-xl">
                <CheckCircle2 className="text-primary mr-4 mt-0.5 flex-shrink-0" size={24} />
                <span className="leading-relaxed">Prior experience in teaching, mentoring, or creating educational content</span>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-xl">
                <CheckCircle2 className="text-primary mr-4 mt-0.5 flex-shrink-0" size={24} />
                <span className="leading-relaxed">Strong communication skills and passion for helping others learn</span>
              </li>
              <li className="flex items-start bg-gray-50 p-4 rounded-xl">
                <CheckCircle2 className="text-primary mr-4 mt-0.5 flex-shrink-0" size={24} />
                <span className="leading-relaxed">Commitment to creating high-quality, up-to-date course material</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gray-900 text-white py-24 px-4 text-center border-t-8 border-primary">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to inspire others?</h2>
            <p className="text-xl text-gray-400 font-light leading-relaxed">Take the first step towards becoming a platform instructor today and join thousands of others.</p>
            <div className="pt-6 flex justify-center min-h-[100px]">
              {renderSmartCTA()}
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
