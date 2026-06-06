import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { adminOrganizationService } from '@/services/admin/organization.service'
import {
  Building,
  ChevronLeft,
  CreditCard,
  BarChart3,
  Users,
  Shield,
  Palette,
  Layout,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { PageHeader } from '@/components/admin/shared/layout'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
export const Route = createFileRoute('/admin/organization/$orgUuid')({
  component: OrganizationDetailPage,
})

function OrganizationDetailPage() {
  const { orgUuid } = useParams({ from: '/admin/organization/$orgUuid' })
  const navigate = useNavigate()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const { data: org, isLoading } = useQuery({
    queryKey: ['admin', 'organization', orgUuid],
    queryFn: () => adminOrganizationService.getOne(orgUuid),
  })

  const confirmDelete = async () => {
    try {
      await adminOrganizationService.delete(orgUuid)
      toast.success('Organization deleted successfully')
      setIsDeleteDialogOpen(false)
      navigate({ to: '/admin/organization' })
    } catch (error) {
      toast.error('Failed to delete organization')
    }
  }

  if (isLoading)
    return (
      <AdminPage>
        <div className="p-10 text-center animate-pulse font-bold text-slate-400">
          Loading Organization Details...
        </div>
      </AdminPage>
    )
  if (!org)
    return (
      <AdminPage>
        <div className="p-10 text-center font-bold text-destructive">
          Organization not found.
        </div>
      </AdminPage>
    )

  return (
    <AdminPage>
      <PageHeader
        title={org.name}
        description={`Member since ${new Date(org.createdAt).toLocaleDateString()}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="h-10 w-10 p-0 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={() => setIsDeleteDialogOpen(true)}
              title="Delete Organization"
            >
              <Trash2 className="size-5" />
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl border-slate-200 hover:bg-slate-50 transition-all gap-2 px-4 font-bold"
            >
              <Link to="/admin/organization">
                <ChevronLeft className="size-4" /> Back to List
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Industry / Tag',
            value: org.organization_tag?.name || 'General',
            icon: Building,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            label: 'Active Students',
            value: '0',
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Course Licenses',
            value: '0',
            icon: Shield,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: 'Usage Rate',
            value: '0%',
            icon: BarChart3,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md"
          >
            <div
              className={`size-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shadow-lg shadow-current/5`}
            >
              <stat.icon className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-slate-800 mt-1.5">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 mb-8 inline-flex h-12">
          <TabsTrigger
            value="overview"
            className="h-10 px-6 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all gap-2"
          >
            <Layout className="size-4" /> Overview
          </TabsTrigger>
          <TabsTrigger
            value="licenses"
            className="h-10 px-6 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all gap-2"
          >
            <Shield className="size-4" /> Licenses
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="h-10 px-6 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all gap-2"
          >
            <Palette className="size-4" /> Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-lg font-black text-slate-800 tracking-tight mb-6 flex items-center gap-3">
                  <Building className="size-5 text-indigo-500" /> Organization Profile
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Legal Name
                    </p>
                    <p className="font-bold text-slate-700 mt-1">{org.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Parent Domain Email
                    </p>
                    <p className="font-bold text-slate-700 mt-1">
                      {org.parent_email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Contact Email
                    </p>
                    <p className="font-bold text-slate-700 mt-1">
                      {org.contact_email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Contact Phone
                    </p>
                    <p className="font-bold text-slate-700 mt-1">
                      {org.contact_phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Contact Fax
                    </p>
                    <p className="font-bold text-slate-700 mt-1">
                      {org.contact_fax || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Website
                    </p>
                    <p className="font-bold text-slate-700 mt-1">
                      {org.contents?.website || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Address
                    </p>
                    <p className="font-bold text-slate-700 mt-1">
                      {org.contents?.address || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Taxpayer ID (NPWP)
                    </p>
                    <p className="font-bold text-slate-700 mt-1">
                      {org.contents?.taxpayer_identification_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Business ID (NIB)
                    </p>
                    <p className="font-bold text-slate-700 mt-1">
                      {org.contents?.business_identification_number || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Industry
                    </p>
                    <p className="text-xl font-black mt-1">
                      {org.organization_tag?.name || 'General'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Registered At
                    </p>
                    <p className="text-sm font-bold mt-1 text-slate-300">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Building className="absolute -bottom-10 -right-10 size-40 text-white/5 rotate-12" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="licenses">
          <div className="bg-white p-12 rounded-2xl border border-dotted border-slate-200 text-center">
            <Shield className="size-16 text-slate-200 mx-auto mb-6" />
            <h4 className="text-xl font-black text-slate-800 tracking-tight">
              Manage Course Licenses
            </h4>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mt-2 font-medium">
              Provision course access to employees and track seat utilization in
              real-time.
            </p>
            <Button className="mt-8 rounded-xl h-11 px-8 font-black bg-indigo-600 shadow-indigo-600/10 shadow-lg uppercase tracking-widest text-[10px]">
              Initiate Bulk Provisioning
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="branding">
          <div className="bg-white p-12 rounded-2xl border border-dotted border-slate-200 text-center">
            <Palette className="size-16 text-slate-200 mx-auto mb-6" />
            <h4 className="text-xl font-black text-slate-800 tracking-tight">
              White-label Experience
            </h4>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mt-2 font-medium">
              Customize the platform appearance for this organization including
              logos and certificate signatures.
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-xl h-11 px-8 font-black border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
            >
              Enterprise Customization
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Organization"
        description={`Are you sure you want to delete ${org.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
      />
    </AdminPage>
  )
}
