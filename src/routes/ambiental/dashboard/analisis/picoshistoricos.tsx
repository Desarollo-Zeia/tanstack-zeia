import { createFileRoute } from '@tanstack/react-router'
import { OcupacionalShell } from '@/features/ambiental/components/shell'
import { ModuleTitle } from '@/features/ambiental/components/module-title'

export const Route = createFileRoute('/ambiental/dashboard/analisis/picoshistoricos')({
  component: PicosHistoricosPage,
})

function PicosHistoricosPage() {
  return (
    <OcupacionalShell>
      <ModuleTitle title="Picos Históricos" />
    </OcupacionalShell>
  )
}
