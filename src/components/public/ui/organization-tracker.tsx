import { motion } from 'framer-motion'
import { TrendingUp, Users } from 'lucide-react'

export function OrganizationTracker() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="absolute -top-10 -right-16 z-20 w-72 rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur-2xl shadow-2xl hidden xl:block"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            Live Provisioning
          </span>
        </div>
        <TrendingUp className="size-3 text-emerald-500" />
      </div>

      <div className="space-y-4">
        {[
          { name: 'TechCorp Global', employees: '1.2k', logo: 'TC' },
          { name: 'Nexus Solutions', employees: '450', logo: 'NS' },
        ].map((org, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 font-bold text-xs text-white">
              {org.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">
                {org.name}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Users className="size-3" />
                {org.employees} seats activated
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-medium">
            Monthly Active Orgs
          </span>
          <span className="text-xs font-bold text-white">500+</span>
        </div>
      </div>
    </motion.div>
  )
}
