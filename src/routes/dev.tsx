import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export const Route = createFileRoute('/dev')({
  head: () => ({
    meta: [
      {
        title: 'Clara | Core Learning App',
      },
    ],
  }),
  component: ComingSoonPage,
})

function ComingSoonPage() {
  return (
    <div className="relative min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider animate-pulse">
          Live Development
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent pb-4 leading-[1.1]">
          Coming Soon
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-md mx-auto font-medium">
          I'm working hard to bring you something amazing. Stay tuned!
        </p>
      </div>

      <div className="relative z-10 mt-16">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all duration-300 group"
        >
          <Link to="/login">
            <Lock className="mr-2 h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
            Admin Portal
          </Link>
        </Button>
      </div>
    </div>
  )
}
