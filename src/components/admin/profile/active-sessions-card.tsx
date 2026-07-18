import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Monitor, Smartphone, Globe, AlertCircle, Loader2 } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function ActiveSessionsCard() {
  const queryClient = useQueryClient()

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => authService.getSessions(),
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => authService.revokeSession(id),
    onSuccess: () => {
      toast.success('Session revoked successfully')
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke session')
    }
  })

  const revokeAllMutation = useMutation({
    mutationFn: () => authService.revokeAllSessions(),
    onSuccess: () => {
      toast.success('All other sessions revoked successfully')
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke sessions')
    }
  })

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />
    }
    return <Monitor className="w-5 h-5" />
  }

  const getBrowser = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes('chrome')) return 'Chrome'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('safari')) return 'Safari'
    if (ua.includes('edge')) return 'Edge'
    return 'Unknown Browser'
  }

  return (
    <Card className="border border-border shadow-filament rounded-xl overflow-hidden mt-8">
      <CardHeader className="bg-muted/30 border-b pb-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-black uppercase tracking-tight">
            Active Sessions
          </CardTitle>
          <CardDescription className="font-medium text-xs">
            Manage and revoke your active sessions across other browsers and devices.
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="font-bold border-destructive/20 text-destructive hover:bg-destructive/10"
          onClick={() => revokeAllMutation.mutate()}
          disabled={revokeAllMutation.isPending || !sessions || sessions.length <= 1}
        >
          {revokeAllMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Revoke All Others
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/50 text-destructive p-4 flex items-start gap-3 bg-destructive/10">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <h5 className="font-bold tracking-tight">Error</h5>
              <p className="text-sm font-medium opacity-90">Failed to load active sessions.</p>
            </div>
          </div>
        ) : !Array.isArray(sessions) || sessions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">No active sessions found.</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session: any) => (
              <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-card gap-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${session.is_current ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {getDeviceIcon(session.user_agent)}
                  </div>
                  <div>
                    <p className="font-bold text-sm flex items-center gap-2">
                      {getBrowser(session.user_agent)} on {session.ip}
                      {session.is_current && (
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          This Device
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Started {format(new Date(session.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => revokeMutation.mutate(session.id)}
                    disabled={revokeMutation.isPending}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
