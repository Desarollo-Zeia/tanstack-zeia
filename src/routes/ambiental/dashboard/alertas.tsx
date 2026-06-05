import { createFileRoute } from '@tanstack/react-router'
import { OcupacionalShell } from '@/features/ambiental/components/shell'
import { ModuleTitle } from '@/features/ambiental/components/module-title'

export const Route = createFileRoute('/ambiental/dashboard/alertas')({
  component: AlertasPage,
})

function AlertasPage() {
  return (
    <OcupacionalShell>
      <ModuleTitle title="Alertas" />
    </OcupacionalShell>
  )
}
