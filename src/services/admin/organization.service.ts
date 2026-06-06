import apiClient from '@/lib/api-client'
import type {
  Organization,
  OrganizationLicense,
  OrganizationLicenseActivity,
  ProvisioningBatch,
} from '@/types/organization'

export const adminOrganizationService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    org_type?: string
  }): Promise<{
    organizations: Organization[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/organization', { params })
    return {
      organizations: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10 },
    }
  },

  async getOne(uuid: string): Promise<Organization> {
    const response = await apiClient.get(`/api/admin/organization/${uuid}`)
    return response.data.data || response.data
  },

  async create(data: Partial<Organization>): Promise<Organization> {
    const response = await apiClient.post('/api/admin/organization', data)
    return response.data.data
  },

  async update(
    uuid: string,
    data: Partial<Organization>,
  ): Promise<Organization> {
    const response = await apiClient.put(
      `/api/admin/organization/${uuid}`,
      data,
    )
    return response.data.data
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/organization/${uuid}`)
  },

  // B2B Specific
  async getLicenses(orgUuid: string): Promise<OrganizationLicense[]> {
    const response = await apiClient.get(
      `/api/admin/organization/${orgUuid}/license`,
    )
    return response.data.data || []
  },

  async getLicenseActivities(
    orgUuid: string,
    licenseId: number,
  ): Promise<OrganizationLicenseActivity[]> {
    const response = await apiClient.get(
      `/api/admin/organization/${orgUuid}/license/${licenseId}/activity`,
    )
    return response.data.data || []
  },

  async provisionBulk(data: {
    emails: string[]
    course_id: number
    organization_id: number
    period_days?: number
  }): Promise<ProvisioningBatch> {
    const response = await apiClient.post('/api/admin/b2b/provision', data)
    return response.data.data
  },

  async getProvisioningBatchStatus(
    batchUuid: string,
  ): Promise<ProvisioningBatch> {
    const response = await apiClient.get(
      `/api/admin/b2b/provision/${batchUuid}/status`,
    )
    return response.data.data
  },

  async updateBranding(
    orgUuid: string,
    data: { logo_url?: string; signature_url?: string },
  ): Promise<Organization> {
    const response = await apiClient.put(
      `/api/admin/organization/${orgUuid}/branding`,
      data,
    )
    return response.data.data
  },
}
