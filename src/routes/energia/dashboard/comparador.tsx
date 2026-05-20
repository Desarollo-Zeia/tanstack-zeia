import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/energia/dashboard/comparador')({
  component: ComparadorPage,
})

function ComparadorPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Comparación por Día</h1>
          <p className="text-text-secondary">Comparativa de consumo entre diferentes días</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparador Temporal</CardTitle>
            <CardDescription>
              Comparación de métricas entre fechas seleccionadas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center text-text-muted">
            Área de comparación por día (próximamente)
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
