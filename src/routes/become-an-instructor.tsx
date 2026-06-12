import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/hooks/use-auth'
import { instructorApplicationService } from '@/services/instructor-application.service'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Globe, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  const renderSmartCTA = (size: 'default' | 'lg' | 'xl' = 'xl', className: string = '') => {
    const baseClasses = `font-bold transition-all w-full md:w-auto shadow-md hover:shadow-xl ${className}`

    if (isLoading) {
      return <Button disabled size={size} className={baseClasses}>Loading...</Button>
    }

    if (isAuthenticated) {
      if (user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin')) {
        return (
          <div className="flex flex-col items-center gap-2">
            <Button disabled size={size} className={baseClasses} variant="secondary">
              You are an Admin
            </Button>
            <p className="text-xs text-muted-foreground">Admins cannot apply.</p>
          </div>
        )
      }

      if (user?.roles?.includes('Instructor') || status === 'accepted') {
        return (
          <Button onClick={handleCtaClick} size={size} className={baseClasses}>
            Go to Dashboard
          </Button>
        )
      }

      if (status === 'pending' || status === 'under_review') {
        return (
          <div className="flex flex-col items-start gap-2">
            <Button disabled size={size} variant="secondary" className={`${baseClasses} opacity-80`}>
              Application Submitted
            </Button>
            <Badge variant="outline" className="text-xs">
              Status: {status === 'under_review' ? 'Under Review' : 'Pending'}
            </Badge>
          </div>
        )
      }
    }

    return (
      <Button onClick={handleCtaClick} size={size} className={baseClasses}>
        Get started
      </Button>
    )
  }

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        
        {/* 1. Split Hero Section */}
        <section className="relative overflow-hidden bg-white py-12 md:py-20 px-4">
          <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-slate-900 leading-[1.1]">
                Come teach<br />with us
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Become an instructor and change lives — including your own.
              </p>
              <div className="pt-4 flex justify-center lg:justify-start">
                {renderSmartCTA('xl')}
              </div>
            </div>
            <div className="flex-1 w-full max-w-2xl lg:max-w-none">
              <div className="aspect-[4/3] md:aspect-video lg:aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl group">
                <img 
                  src="https://akselerasiindonesia.s3.ap-southeast-1.amazonaws.com/course/ko0CZTqiPwxKd3HNyLOQh6voJQDAlnIXxsVmRimh.jpg" 
                  alt="Instructor teaching" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. So many reasons to start */}
        <section className="py-20 md:py-24 px-4 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-center mb-16 text-slate-900">
              So many reasons to start
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-slate-900">Teach your way</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Publish the course you want, in the way you want, and always have control of your own content.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-slate-900">Inspire learners</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Teach what you know and help learners explore their interests, gain new skills, and advance their careers.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-slate-900">Get rewarded</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Expand your professional network, build your expertise, and earn money on each paid enrollment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Impact & Stats Section */}
        <section className="py-20 bg-primary text-primary-foreground px-4 text-center">
          <div className="max-w-7xl mx-auto space-y-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">Discover your potential</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-black">73M</div>
                <div className="text-primary-foreground/80 font-medium tracking-wide uppercase text-sm">Students</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-black">75+</div>
                <div className="text-primary-foreground/80 font-medium tracking-wide uppercase text-sm">Languages</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-black">830M</div>
                <div className="text-primary-foreground/80 font-medium tracking-wide uppercase text-sm">Enrollments</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-black">15K+</div>
                <div className="text-primary-foreground/80 font-medium tracking-wide uppercase text-sm">Enterprise customers</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. How to begin (Tabs) */}
        <section className="py-24 px-4 bg-white max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-center mb-16 text-slate-900">
            How to begin
          </h2>
          <Tabs defaultValue="plan" className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <div className="w-full lg:w-1/3">
              <TabsList className="flex flex-col h-auto bg-transparent space-y-2 w-full">
                <TabsTrigger 
                  value="plan" 
                  className="w-full justify-start text-left text-xl font-bold py-4 px-6 border-l-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-slate-50 data-[state=active]:shadow-none rounded-none transition-all"
                >
                  Plan your curriculum
                </TabsTrigger>
                <TabsTrigger 
                  value="record" 
                  className="w-full justify-start text-left text-xl font-bold py-4 px-6 border-l-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-slate-50 data-[state=active]:shadow-none rounded-none transition-all"
                >
                  Record your video
                </TabsTrigger>
                <TabsTrigger 
                  value="launch" 
                  className="w-full justify-start text-left text-xl font-bold py-4 px-6 border-l-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-slate-50 data-[state=active]:shadow-none rounded-none transition-all"
                >
                  Launch your course
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="w-full lg:w-2/3">
              <TabsContent value="plan" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 space-y-6">
                    <p className="text-slate-600 text-lg leading-relaxed">
                      You start with your passion and knowledge. Then choose a promising topic with the help of our Marketplace Insights tool.
                    </p>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      The way that you teach — what you bring to it — is up to you.
                    </p>
                    <div className="pt-4 font-bold text-slate-900">How we help you</div>
                    <p className="text-slate-600 leading-relaxed">
                      We offer plenty of resources on how to create your first course. And, our instructor dashboard and curriculum pages help keep you organized.
                    </p>
                  </div>
                  <div className="flex-1 w-full">
                    <img src="https://akselerasiindonesia.s3.ap-southeast-1.amazonaws.com/course/taTmRmO2Tuj4sFmG6UkeiILZl3iznmYrKFEVLH4c.jpg" alt="Plan your curriculum" className="rounded-xl shadow-lg w-full aspect-[4/3] object-cover" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="record" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 space-y-6">
                    <p className="text-slate-600 text-lg leading-relaxed">
                      Use basic tools like a smartphone or a DSLR camera. Add a good microphone and you're ready to start.
                    </p>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      If you don't like being on camera, just capture your screen. Either way, we recommend two hours or more of video for a paid course.
                    </p>
                    <div className="pt-4 font-bold text-slate-900">How we help you</div>
                    <p className="text-slate-600 leading-relaxed">
                      Our support team is available to help you throughout the process and provide feedback on test videos.
                    </p>
                  </div>
                  <div className="flex-1 w-full">
                    <img src="https://akselerasiindonesia.s3.ap-southeast-1.amazonaws.com/course/C4iow3NVo4YEy8v8TEFQzp3pMGltdRgc1qkeMJzP.jpg" alt="Record your video" className="rounded-xl shadow-lg w-full aspect-[4/3] object-cover" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="launch" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 space-y-6">
                    <p className="text-slate-600 text-lg leading-relaxed">
                      Gather your first ratings and reviews by promoting your course through social media and your professional networks.
                    </p>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      Your course will be discoverable in our marketplace where you earn revenue from each paid enrollment.
                    </p>
                    <div className="pt-4 font-bold text-slate-900">How we help you</div>
                    <p className="text-slate-600 leading-relaxed">
                      Our custom coupon tool lets you offer enrollment incentives while our global promotions drive traffic to courses.
                    </p>
                  </div>
                  <div className="flex-1 w-full">
                    <img src="https://akselerasiindonesia.s3.ap-southeast-1.amazonaws.com/course/hRrpeGueGB5IVBQ8Kj3sESKNPKeuN70lrP9mBA5J.jpg" alt="Launch your course" className="rounded-xl shadow-lg w-full aspect-[4/3] object-cover" />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* 5. Support Section */}
        <section className="py-20 md:py-24 px-4 bg-slate-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 w-full">
              <img 
                src="https://akselerasiindonesia.s3.ap-southeast-1.amazonaws.com/course/QjvYhrzN0H7BUBsJ5ZsWfnkaMinmI18EZSRcEKZY.jpg" 
                alt="Support team" 
                className="rounded-2xl shadow-xl w-full object-cover aspect-video"
              />
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-slate-900">
                You won't have to do it alone
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Our Instructor Support Team is here to answer your questions and review your test video, while our Teaching Center gives you plenty of resources to help you through the process. Plus, get the support of experienced instructors in our online community.
              </p>
              <div className="pt-4 flex justify-center md:justify-start">
                <Button variant="outline" size="lg" className="font-bold border-primary text-primary hover:bg-primary/5">
                  Need more details before you start?
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. High-Impact Final CTA */}
        <section className="bg-slate-900 text-white py-24 px-4 text-center border-t-8 border-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[url('https://akselerasiindonesia.s3.ap-southeast-1.amazonaws.com/course/bqZYk8TOUABRstx0gb2t0kbuG4JEzK6NDFG9sAkd.jpg')] bg-cover bg-center"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight">Become an instructor today</h2>
            <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
              Join one of the world's largest online learning marketplaces.
            </p>
            <div className="pt-8 flex justify-center">
              {renderSmartCTA('xl')}
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
