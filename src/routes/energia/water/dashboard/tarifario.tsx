import { createFileRoute } from '@tanstack/react-router'
import { WaterTarifarioPage } from '@/features/water/pages/tarifario'

export const Route = createFileRoute('/energia/water/dashboard/tarifario')({
  component: WaterTarifarioPage,
  validateSearch: (search) => ({
    sede: typeof search.sede === 'string' ? search.sede : undefined,
    tab: search.tab === 'comparador' || search.tab === 'mensual' ? search.tab : undefined,
  }),
})
