import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/hooks/use-auth'
import { isAdmin } from '@/lib/auth'

export const Route = createFileRoute('/debug-auth')({
  component: DebugAuthPage,
})

function DebugAuthPage() {
  const { user, token, isAuthenticated } = useAuthStore()
  
  return (
    <div className="p-8 space-y-4 font-mono text-sm">
      <h1 className="text-2xl font-bold">Auth Debugger</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <section className="p-4 border rounded">
          <h2 className="font-bold border-b mb-2">Store State</h2>
          <pre>{JSON.stringify({ isAuthenticated, hasToken: !!token }, null, 2)}</pre>
        </section>
        
        <section className="p-4 border rounded">
          <h2 className="font-bold border-b mb-2">isAdmin() Result</h2>
          <pre>{JSON.stringify({ 
            libIsAdmin: isAdmin(user || undefined),
            isAdminNoArgs: isAdmin()
          }, null, 2)}</pre>
        </section>
      </div>

      <section className="p-4 border rounded bg-slate-50">
        <h2 className="font-bold border-b mb-2">User Object</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </section>

      <section className="p-4 border rounded overflow-hidden">
        <h2 className="font-bold border-b mb-2">localStorage (auth_user)</h2>
        <pre className="overflow-auto max-h-40">{typeof window !== 'undefined' ? localStorage.getItem('auth_user') : 'N/A'}</pre>
      </section>

      <section className="p-4 border rounded overflow-hidden">
        <h2 className="font-bold border-b mb-2">Cookie (auth_user)</h2>
        <pre className="overflow-auto max-h-40">{typeof document !== 'undefined' ? document.cookie : 'N/A'}</pre>
      </section>
    </div>
  )
}
