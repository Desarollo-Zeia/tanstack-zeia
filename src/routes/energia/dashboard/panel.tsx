import { createFileRoute } from '@tanstack/react-router'
import { PanelPage } from '@/features/dashboard/pages/panel'

export const Route = createFileRoute('/energia/dashboard/panel')({
  component: PanelPage,
  validateSearch: (search) => {
    return {
      sede: typeof search.sede === 'string' ? search.sede : undefined,
      panel: typeof search.panel === 'string' ? search.panel : undefined,
      desde: typeof search.desde === 'string' ? search.desde : undefined,
      hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
    }
  },
})
