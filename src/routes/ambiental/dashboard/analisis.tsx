import { createFileRoute, Outlet } from '@tanstack/react-router'
import { OcupacionalShell } from '@/features/ambiental/components/shell'

export const Route = createFileRoute('/ambiental/dashboard/analisis')({
  component: AnalisisPage,
})

function AnalisisPage() {
  return (
    <OcupacionalShell>
      <Outlet />
    </OcupacionalShell>
  )
}
