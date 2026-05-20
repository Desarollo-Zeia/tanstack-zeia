import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/energia/dashboard/monitoreo')({
  component: MonitoreoPage,
})

function MonitoreoPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Monitoreo de Potencia</h1>
          <p className="text-text-secondary">Seguimiento en tiempo real de la potencia consumida</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gráfico de Potencia</CardTitle>
            <CardDescription>
              Monitoreo continuo de los niveles de potencia
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center text-text-muted">
            Área de monitoreo de potencia (próximamente)
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
