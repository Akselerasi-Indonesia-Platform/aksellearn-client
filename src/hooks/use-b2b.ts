import { useQuery } from '@tanstack/react-query'
import { adminOrganizationService } from '@/services/admin/organization.service'

export function useProvisioningBatchStatus(batchUuid?: string) {
  return useQuery({
    queryKey: ['admin', 'b2b', 'provisioning-status', batchUuid],
    queryFn: () =>
      adminOrganizationService.getProvisioningBatchStatus(batchUuid!),
    enabled: !!batchUuid,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data && (data.status === 'completed' || data.status === 'failed')) {
        return false
      }
      return 3000 // Poll every 3 seconds while processing
    },
  })
}
