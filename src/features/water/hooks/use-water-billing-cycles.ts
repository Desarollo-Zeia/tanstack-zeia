import { useQuery } from '@tanstack/react-query'
import { fetchWaterBillingCycles } from '../api/water-billing-cycles'

export function useWaterBillingCycles(sedeId: number) {
  return useQuery({
    queryKey: ['water-billing-cycles', sedeId],
    queryFn: () => fetchWaterBillingCycles(sedeId),
    enabled: !!sedeId,
  })
}
