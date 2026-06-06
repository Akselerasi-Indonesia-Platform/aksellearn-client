'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormInput, FormSelect } from '@/components/admin/shared/form'
import type { Organization } from '@/types/organization'
import { adminOrganizationTagService } from '@/services/admin/organization-tag.service'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tag: z.string().min(1, 'Tenant type is required'),
  organization_tag_uuid: z.string().min(1, 'Industry tag is required'),
  parent_email: z.string().email('Invalid email').optional().or(z.literal('')),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  contact_phone: z.string().optional().nullable(),
  contact_fax: z.string().optional().nullable(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional().nullable(),
  taxpayer_identification_number: z.string().optional().nullable(),
  business_identification_number: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface OrganizationFormProps {
  organization?: Organization
  onSubmit: (data: FormValues) => void
  onCancel: () => void
}

export function OrganizationForm({
  organization,
  onSubmit,
  onCancel,
}: OrganizationFormProps) {
  const { t } = useTranslation()
  const [tagOptions, setTagOptions] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    adminOrganizationTagService.getOptions().then((options) => {
      setTagOptions(options)
    })
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization?.name || '',
      tag: organization?.tag || 'business',
      organization_tag_uuid: organization?.organization_tag_uuid || organization?.organization_tag?.uuid || '',
      parent_email: organization?.parent_email || '',
      contact_email: organization?.contact_email || '',
      contact_phone: organization?.contact_phone || '',
      contact_fax: organization?.contact_fax || '',
      website: organization?.contents?.website || '',
      address: organization?.contents?.address || '',
      taxpayer_identification_number: organization?.contents?.taxpayer_identification_number || '',
      business_identification_number: organization?.contents?.business_identification_number || '',
    },
  })

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || '',
        tag: organization.tag || 'business',
        organization_tag_uuid: organization.organization_tag_uuid || organization.organization_tag?.uuid || '',
        parent_email: organization.parent_email || '',
        contact_email: organization.contact_email || '',
        contact_phone: organization.contact_phone || '',
        contact_fax: organization.contact_fax || '',
        website: organization.contents?.website || '',
        address: organization.contents?.address || '',
        taxpayer_identification_number: organization.contents?.taxpayer_identification_number || '',
        business_identification_number: organization.contents?.business_identification_number || '',
      })
    }
  }, [organization, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            control={form.control}
            label="Organization Name"
            name="name"
            placeholder="e.g. Acme Corp"
            required
          />
          <FormSelect
            control={form.control}
            label="Industry Tag"
            name="organization_tag_uuid"
            options={tagOptions}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            control={form.control}
            label="Parent Domain Email"
            name="parent_email"
            placeholder="e.g. @acme.com"
          />
          <FormInput
            control={form.control}
            label="Contact Email"
            name="contact_email"
            placeholder="e.g. billing@acme.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            control={form.control}
            label="Contact Phone"
            name="contact_phone"
            placeholder="e.g. +6281234567"
          />
          <FormInput
            control={form.control}
            label="Contact Fax"
            name="contact_fax"
            placeholder="e.g. 021-5551234"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            control={form.control}
            label="Website URL"
            name="website"
            placeholder="e.g. https://acme.com"
          />
        </div>

        <FormInput
          control={form.control}
          label="Address"
          name="address"
          placeholder="e.g. 123 Business Ave, Jakarta"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            control={form.control}
            label="Taxpayer ID (NPWP)"
            name="taxpayer_identification_number"
            placeholder="e.g. 12.345.678.9-012.000"
          />
          <FormInput
            control={form.control}
            label="Business ID (NIB)"
            name="business_identification_number"
            placeholder="e.g. 1234567890123"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="rounded-xl"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-bold"
          >
            {organization ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
