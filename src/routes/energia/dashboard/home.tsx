import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/energia/dashboard/home')({
  component: HomeDashboardPage,
})

function HomeDashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Análisis por Indicador</h1>
          <p className="text-text-secondary">Métricas e indicadores de rendimiento energético</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores Principales</CardTitle>
            <CardDescription>
              Visualización de indicadores clave de desempeño energético
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center text-text-muted">
            Área de análisis de indicadores (próximamente)
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
