import { createFileRoute } from '@tanstack/react-router'
import { ModuleTitle } from '@/features/ambiental/components/module-title'

export const Route = createFileRoute('/ambiental/dashboard/analisis/estadisticas')({
  component: EstadisticasPage,
})

function EstadisticasPage() {
  return (
    <ModuleTitle title="Estadísticas" />
  )
}
