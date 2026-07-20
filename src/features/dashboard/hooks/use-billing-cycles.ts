import { useQuery } from '@tanstack/react-query'
import { fetchBillingCycles } from '../api/billing-cycles'

export function useBillingCycles(sedeId: number) {
  return useQuery({
    queryKey: ['billing-cycles', sedeId],
    queryFn: () => fetchBillingCycles(sedeId),
    enabled: !!sedeId,
  })
}
