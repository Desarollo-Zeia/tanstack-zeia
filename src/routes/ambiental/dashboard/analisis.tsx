import { createFileRoute, Outlet, useChildMatches } from '@tanstack/react-router'
import { OcupacionalShell } from '@/features/ambiental/components/shell'
import { AnalisisOverview } from '@/features/ambiental/components/analisis-overview'

export const Route = createFileRoute('/ambiental/dashboard/analisis')({
  component: AnalisisPage,
})

function AnalisisPage() {
  const childMatches = useChildMatches()
  const hasChild = childMatches.length > 0

  return (
    <OcupacionalShell>
      {hasChild ? <Outlet /> : <AnalisisOverview />}
    </OcupacionalShell>
  )
}
