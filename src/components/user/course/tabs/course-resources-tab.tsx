import { FileText, Download, Paperclip } from 'lucide-react'
import { EmptyState } from '@/components/public/ui/empty-state'
import { Button } from '@/components/ui/button'

interface CourseResourcesTabProps {
  attachments: any[] | undefined
}

export function CourseResourcesTab({ attachments }: CourseResourcesTabProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <EmptyState
        icon={Paperclip}
        title="No Resources Available"
        description="There are currently no downloadable resources attached to this curriculum."
        variant="ice-blue"
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h4 className="text-lg font-bold text-slate-900 tracking-tight">
          Downloadable Resources
        </h4>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          {attachments.length} {attachments.length === 1 ? 'File' : 'Files'} available
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {attachments.map((att) => (
          <div
            key={att.uuid}
            className="p-6 flex items-center justify-between hover:bg-[#F0F7FF]/50 transition-colors group"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0 pr-6">
              <div className="size-12 rounded-xl bg-[#056FAE]/10 text-[#056FAE] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-[#0D3A6E] tracking-tight truncate">
                  {att.title}
                </h5>
                {att.description && (
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {att.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-black text-[#056FAE]/60 uppercase tracking-widest bg-[#056FAE]/5 px-2 py-0.5 rounded leading-none">
                    {att.media?.mime_type || 'File'}
                  </span>
                  {att.media?.size && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {(att.media.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open(att.media?.url || '', '_blank')}
              className="shrink-0 h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-[#056FAE] border-[#056FAE]/20 hover:bg-[#056FAE] hover:text-white transition-all shadow-sm"
            >
              <Download className="size-4 mr-2" />
              Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
