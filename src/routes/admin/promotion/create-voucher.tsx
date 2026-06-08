import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Ticket } from 'lucide-react'
import { toast } from 'sonner'

import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Button } from '@/components/ui/button'
import { adminPromotionService } from '@/services/admin/promotion.service'
import { adminCourseService } from '@/services/admin/course.service'
import { adminCourseCategoryService } from '@/services/admin/course-category.service'
import { PromotionForm } from '@/components/admin/promotions/promotion-form'

export const Route = createFileRoute('/admin/promotion/create-voucher')({
  head: () => ({
    meta: [{ title: 'Aksellearn | New Coupon' }],
  }),
  component: VoucherCreatePage,
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

function VoucherCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string> | null>(null)

  const { data: coursesData } = useQuery({
    queryKey: ['admin', 'courses-dropdown'],
    queryFn: () => adminCourseService.getAll({ limit: 100 }),
  })
  const coursesOptions = (coursesData?.courses || []).map((c: any) => ({
    label: c.title,
    value: c.uuid || '',
  }))

  const { data: catsData } = useQuery({
    queryKey: ['admin', 'categories-dropdown'],
    queryFn: () => adminCourseCategoryService.getAll({ limit: 100 }),
  })
  const categoriesOptions = (catsData?.categories || []).map((c: any) => ({
    label: c.name,
    value: c.id || '',
  }))

  const createMutation = useMutation({
    mutationFn: (payload: any) => adminPromotionService.create(payload),
    onMutate: () => {
      setValidationErrors(null)
    },
    onSuccess: () => {
      toast.success(t('common.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      navigate({ to: '/admin/promotion/coupon' })
    },
    onError: (err: any) => {
      const responseData = err.response?.data
      if (responseData?.errors) {
        setValidationErrors(extractValidationErrors(responseData.errors))
      } else {
        toast.error(responseData?.message || t('common.createError'))
      }
    },
  })

  return (
    <AdminPage>
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/admin/promotion/coupon' })}
          className="h-9 w-9 rounded-xl hover:bg-muted shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Ticket className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">
              New Coupon
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create a promotional coupon with a linked code for students.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <PromotionForm
            promotion={null}
            isPending={createMutation.isPending}
            coursesOptions={coursesOptions}
            categoriesOptions={categoriesOptions}
            promotionType="voucher"
            errors={validationErrors}
            onSubmit={(payload) => createMutation.mutate(payload)}
            onCancel={() => navigate({ to: '/admin/promotion/coupon' })}
          />
        </div>
      </div>
    </AdminPage>
  )
}
