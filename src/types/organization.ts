export interface OrganizationTag {
  uuid: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Organization {
  id: number | string
  uuid: string
  name: string
  tag: string // business, edu, partner
  logo_id?: number
  logoUrl?: string
  signatureUrl?: string
  contents?: {
    website?: string
    address?: string
    taxpayer_identification_number?: string
    business_identification_number?: string
  }
  parent_email?: string
  contact_email?: string
  contact_phone?: string
  contact_fax?: string
  organization_tag_uuid?: string
  organization_tag?: OrganizationTag
  creditBalance?: number // excluded for security, keep optional
  taxId?: string // excluded for security, keep optional
  createdAt: string
  updatedAt: string
}

export interface OrganizationLicense {
  id: number
  uuid: string
  courseId: number
  organizationId: number
  totalSeats: number
  usedSeats: number
  status: 'active' | 'expired' | 'suspended'
  expiresAt?: string
  createdAt: string
  course?: {
    id: number
    uuid: string
    title: string
  }
}

export interface OrganizationLicenseActivity {
  id: number
  licenseId: number
  action: string // 'add', 'deduct', 'reset'
  amount: number
  previousBalance: number
  newBalance: number
  note?: string
  createdAt: string
}

export interface ProvisioningBatch {
  id: number
  uuid: string
  organizationId?: number
  courseId: number
  totalItems: number
  processedItems: number
  failedItems: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}
