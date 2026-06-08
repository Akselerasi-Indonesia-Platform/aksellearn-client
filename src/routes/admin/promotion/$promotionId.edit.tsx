import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Tag } from 'lucide-react'
import { toast } from 'sonner'

import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { adminPromotionService, Promotion } from '@/services/admin/promotion.service'
import { adminCourseService } from '@/services/admin/course.service'
import { adminCourseCategoryService } from '@/services/admin/course-category.service'
import { PromotionForm } from '@/components/admin/promotions/promotion-form'
import { useAuthStore } from '@/hooks/use-auth'

export const Route = createFileRoute('/admin/promotion/$promotionId/edit')({
  head: () => ({
    meta: [{ title: 'Aksellearn | Edit Promotion' }],
  }),
  component: PromotionEditPage,
})

const extractValidationErrors = (responseErrors: any): Record<string, string> => {
  const result: Record<string, string> = {}
  if (!responseErrors || typeof responseErrors !== 'object') return result

  for (const [field, rules] of Object.entries(responseErrors)) {
    if (rules && typeof rules === 'object') {
      const firstMsg = Object.values(rules)[0]
      if (typeof firstMsg === 'string') {
        result[field] = firstMsg
      }
    } else if (typeof rules === 'string') {
      result[field] = rules
    }
  }
  return result
}

function PromotionEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { promotionId } = Route.useParams()
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string> | null>(null)

  const { user: authUser } = useAuthStore()
  const isInstructorOnly = React.useMemo(() => {
    if (!authUser) return false
    const roleNames = authUser.roles?.map((role: any) => typeof role === 'string' ? role : role.name) || []
    return (roleNames.includes('Teacher') || roleNames.includes('Instructor')) && 
           !roleNames.includes('Super Admin') && 
           !roleNames.includes('Admin')
  }, [authUser])

  const { data: promotion, isLoading: isLoadingPromotion, error: promotionError } = useQuery({
    queryKey: ['admin', 'promotion', promotionId],
    queryFn: () => adminPromotionService.getOne(promotionId),
    enabled: !!promotionId,
  })

  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['admin', 'courses-dropdown'],
    queryFn: () => adminCourseService.getAll({ limit: 100 }),
  })
  const coursesOptions = (coursesData?.courses || []).map((c: any) => ({
    label: c.title,
    value: c.uuid || '',
    db_id: c.db_id,
  }))

  const { data: catsData, isLoading: isLoadingCats } = useQuery({
    queryKey: ['admin', 'categories-dropdown'],
    queryFn: () => adminCourseCategoryService.getAll({ limit: 100 }),
  })
  const categoriesOptions = (catsData?.categories || []).map((c: any) => ({
    label: c.name,
    value: c.id || '',
    db_id: c.db_id,
  }))

  // The BE now returns scope_uuids directly — no manual resolution needed.
  const promotionWithUuids = React.useMemo(() => {
    if (!promotion) return null
    return {
      ...promotion,
      scope_uuids: promotion.scope_uuids || [],
    }
  }, [promotion])

  const updateMutation = useMutation({
    mutationFn: (payload: any) =>
      adminPromotionService.update(promotionId, payload),
    onMutate: () => {
      setValidationErrors(null)
    },
    onSuccess: () => {
      toast.success(t('common.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotion', promotionId] })
      navigate({ to: '/admin/promotion' })
    },
    onError: (err: any) => {
      const responseData = err.response?.data
      if (responseData?.errors) {
        setValidationErrors(extractValidationErrors(responseData.errors))
      } else {
        toast.error(responseData?.message || t('common.updateError'))
      }
    },
  })

  if (promotionError && (promotionError as any).response?.status === 403) {
    return (
      <AdminPage>
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
          <div className="size-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2">
            <Tag className="size-6" />
          </div>
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to edit this promotion. It may belong to another instructor.
          </p>
          <Button onClick={() => navigate({ to: '/admin/promotion' })} className="mt-4">
            <ArrowLeft className="size-4 mr-2" /> Back to Promotions
          </Button>
        </div>
      </AdminPage>
    )
  }

  return (
    <AdminPage>
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/admin/promotion' })}
          className="h-9 w-9 rounded-xl hover:bg-muted shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Tag className="size-5" />
          </div>
          <div className="min-w-0">
            {isLoadingPromotion ? (
              <Skeleton className="h-7 w-48 mb-1" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">
                {promotion?.title || 'Edit Promotion'}
              </h1>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Update discount rules, scope, and scheduling.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto">
        {isLoadingPromotion || isLoadingCourses || isLoadingCats ? (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
            <Skeleton className="h-11 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-11 w-40" />
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <PromotionForm
              promotion={promotionWithUuids}
              isPending={updateMutation.isPending}
              coursesOptions={coursesOptions}
              categoriesOptions={categoriesOptions}
              promotionType={(promotion?.type as 'automatic' | 'voucher') || 'automatic'}
              errors={validationErrors}
              isInstructorOnly={isInstructorOnly}
              onSubmit={(payload) => updateMutation.mutate(payload)}
              onCancel={() => navigate({ to: '/admin/promotion' })}
            />
          </div>
        )}
      </div>
    </AdminPage>
  )
}
