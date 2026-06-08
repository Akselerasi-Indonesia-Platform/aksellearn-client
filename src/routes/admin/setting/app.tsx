import { createFileRoute } from '@tanstack/react-router'
import {
  Globe,
  HardDrive,
  Settings2,
  Monitor,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Mail,
  ExternalLink,
  Activity,
  Clock,
  Loader2,
  AlertCircle,
  Terminal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { appService } from '@/services/admin/app.service'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { QueueMonitorResponse } from '@/types/queue-monitor'

const pkg = { version: '1.0.0' }
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import apiClient from '@/lib/api-client'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'

export const Route = createFileRoute('/admin/setting/app')({
  component: AppSettingsPage,
})

function AppSettingsPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>(
    'checking',
  )
  const [browserInfo, setBrowserInfo] = useState('')

  useEffect(() => {
    // Check API Connection
    apiClient
      .get('/api/admin/user', { params: { limit: 1 } })
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))

    // Get Browser Info
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent
      if (ua.includes('Chrome')) setBrowserInfo('Google Chrome')
      else if (ua.includes('Firefox')) setBrowserInfo('Mozilla Firefox')
      else if (ua.includes('Safari')) setBrowserInfo('Apple Safari')
      else setBrowserInfo('Web Browser')
    }
  }, [])

  const [monitorData, setMonitorData] = useState<QueueMonitorResponse | null>(
    null,
  )
  const [isLoadingMonitor, setIsLoadingMonitor] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_LIMIT = 4

  const fetchMonitorData = async (page = currentPage) => {
    try {
      const data = await appService.getMonitorQueue(page, PAGE_LIMIT)
      setMonitorData(data)
    } catch (error) {
      console.error('Failed to fetch monitor data:', error)
    } finally {
      setIsLoadingMonitor(false)
    }
  }

  useEffect(() => {
    fetchMonitorData(currentPage)
    const interval = setInterval(() => fetchMonitorData(currentPage), 5000)
    return () => clearInterval(interval)
  }, [currentPage])

  const handleClearCache = async () => {
    try {
      toast.promise(appService.clearCache(), {
        loading: 'Refreshing system cache...',
        success: 'System cache refreshed successfully',
        error: (err: any) =>
          `Failed to refresh cache: ${err.response?.data?.message || err.message}`,
      })
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  const handleTestEmail = async () => {
    try {
      toast.promise(appService.testEmail(), {
        loading: 'Sending test email...',
        success: (res: any) =>
          res.data?.message ||
          'Test email sent successfully! Please check your inbox.',
        error: (err: any) =>
          `Failed to send test email: ${err.response?.data?.message || err.message}`,
      })
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  const envMode = import.meta.env.MODE
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  return (
    <AdminPage className="mx-auto flex w-full max-w-4xl flex-col">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">App Settings</h1>
        <p className="text-muted-foreground">
          Manage application performance and view system information for the
          Aksellearn Platform.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
        {/* Maintenance Card */}
        <Card className="overflow-hidden py-0 border-primary/10 shadow-md transition-all hover:shadow-lg">
          <CardHeader className="bg-primary/5 p-6">
            <div className="flex items-center gap-2 text-primary">
              <Settings2 className="h-5 w-5" />
              <CardTitle>System Refresh</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Maintenance tools to keep the application running smoothly.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Cache Refresh */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <HardDrive className="size-3.5 text-muted-foreground" />
                  Clear Application Cache
                </h4>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  Flush temporary data and cached API responses. This is helpful
                  if you notice outdated information or after a system update.
                </p>
              </div>
              <Button
                className="shrink-0 gap-2 shadow-sm transition-all active:scale-95"
                size="sm"
                variant="outline"
                onClick={handleClearCache}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Cache
              </Button>
            </div>

            <Separator className="opacity-50" />

            {/* Test Email */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  Email Integration Test
                </h4>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  Verify your SMTP configuration by sending a test message to
                  the system administrator.
                </p>
              </div>
              <Button
                className="shrink-0 gap-2 shadow-sm transition-all active:scale-95"
                size="sm"
                variant="outline"
                onClick={handleTestEmail}
              >
                <Mail className="h-4 w-4" />
                Send Test Email
              </Button>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 p-4 px-6 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>
              Tip: Use this action if data synchronization issues occur.
            </span>
            {monitorData?.meta.summary.system.dead_letter_count ? (
              <Badge variant="destructive" className="text-[9px] h-4">
                {monitorData.meta.summary.system.dead_letter_count} Dead Letter
                Jobs
              </Badge>
            ) : null}
          </CardFooter>
        </Card>

        {/* Queue Monitor Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">
                Queue Pipeline
              </h2>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold animate-pulse">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              LIVE MONITORING
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-blue-500/5 border-blue-500/10">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">
                    Pending
                  </span>
                  <Clock className="size-3 text-blue-500" />
                </div>
                <div className="text-2xl font-black">
                  {monitorData?.meta.summary.pipeline.pending ?? 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/10">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-500 uppercase">
                    Processing
                  </span>
                  <RefreshCw
                    className={cn(
                      'size-3 text-amber-500',
                      monitorData?.meta.summary.pipeline.processing &&
                        'animate-spin',
                    )}
                  />
                </div>
                <div className="text-2xl font-black">
                  {monitorData?.meta.summary.pipeline.processing ?? 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-500/5 border-emerald-500/10">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">
                    Completed
                  </span>
                  <CheckCircle2 className="size-3 text-emerald-500" />
                </div>
                <div className="text-2xl font-black">
                  {monitorData?.meta.summary.pipeline.completed ?? 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-destructive/5 border-destructive/10">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-destructive uppercase">
                    Failed
                  </span>
                  <AlertCircle className="size-3 text-destructive" />
                </div>
                <div className="text-2xl font-black text-destructive">
                  {monitorData?.meta.summary.pipeline.failed ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-sm">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold">
                Recent Video Jobs
              </CardTitle>
              {monitorData && monitorData.meta.total > PAGE_LIMIT && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Page {currentPage} of{' '}
                    {Math.ceil(monitorData.meta.total / PAGE_LIMIT)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="size-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(
                            Math.ceil(monitorData.meta.total / PAGE_LIMIT),
                            p + 1,
                          ),
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(monitorData.meta.total / PAGE_LIMIT)
                      }
                    >
                      <ChevronRight className="size-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {isLoadingMonitor && !monitorData ? (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="text-xs">Loading queue state...</span>
                  </div>
                ) : monitorData?.data?.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs italic">
                    Pipeline is currently quiet. No active video jobs found.
                  </div>
                ) : (
                  monitorData?.data.map((job) => (
                    <div
                      key={job.uuid}
                      className={cn(
                        'p-4 flex flex-col gap-3 transition-opacity',
                        isLoadingMonitor && 'opacity-50',
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold truncate max-w-[200px] sm:max-w-md">
                            {job.original_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {job.uuid}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(job.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          <Badge
                            variant={
                              job.status === 'completed'
                                ? 'outline'
                                : job.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className={cn(
                              'text-[9px] uppercase font-bold h-5 px-1.5',
                              job.status === 'completed' &&
                                'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                              job.status === 'processing' && 'animate-pulse',
                            )}
                          >
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">
                              Progress
                            </span>
                            <span className="text-[10px] font-black">
                              {job.progress}%
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground italic">
                            {job.duration}s
                          </span>
                        </div>
                        <Progress value={job.progress} className="h-1.5" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Info Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Version Info */}
          <Card className="shadow-sm py-0 overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                App Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Frontend Version
                </span>
                <code className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                  v{pkg.version}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Environment
                </span>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground">
                  {envMode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  API Status
                </span>
                {apiStatus === 'checking' ? (
                  <span className="text-[10px] animate-pulse text-muted-foreground">
                    Checking...
                  </span>
                ) : apiStatus === 'online' ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                    <CheckCircle2 className="size-3" /> ONLINE
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-destructive">
                    <XCircle className="size-3" /> OFFLINE
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Info */}
          <Card className="shadow-sm py-0 overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20">
              <CardTitle className="text-sm flex items-center gap-2">
                <Monitor className="size-4 text-primary" />
                Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                  API Base URL
                </span>
                <p className="text-[10px] font-mono truncate text-muted-foreground bg-muted p-1 rounded border">
                  {apiUrl}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                    Engine
                  </span>
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <HardDrive className="size-3 text-primary" />
                    {monitorData?.meta.summary.engine.connection ?? 'Redis'}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                    Queue
                  </span>
                  <p className="text-xs font-mono text-muted-foreground">
                    {monitorData?.meta.summary.engine.queue ?? 'default'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                  Session Platform
                </span>
                <p className="text-xs font-medium text-foreground">
                  {browserInfo}
                </p>
              </div>
              {monitorData?.meta.summary.engine.inspect && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 flex items-center gap-1.5">
                    <Terminal className="size-3" /> Inspect Command
                  </span>
                  <div
                    className="group relative cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        monitorData.meta.summary.engine.inspect,
                      )
                      toast.success('Command copied to clipboard')
                    }}
                  >
                    <code className="text-[9px] block w-full bg-slate-950 text-slate-300 p-2 rounded border border-slate-800 font-mono transition-colors group-hover:bg-slate-900">
                      {monitorData.meta.summary.engine.inspect}
                    </code>
                    <div className="absolute inset-y-0 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] bg-primary text-primary-foreground px-1 rounded">
                        COPY
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Support Card */}
        <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="size-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Technical Support</h4>
                  <p className="text-xs text-muted-foreground">
                    Encountered an issue or have technical questions?
                  </p>
                </div>
              </div>
              <a
                href="mailto:me@madacoda.dev"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow transition-all hover:opacity-90 active:scale-95"
              >
                Contact madacoda
                <ExternalLink className="size-3" />
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            Tip: Deployment version {pkg.version} includes the latest security
            patches for your platform.
          </p>
        </div>
      </div>
    </AdminPage>
  )
}
