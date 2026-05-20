import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/energia/dashboard/desbalance')({
  component: DesbalancePage,
})

function DesbalancePage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Desbalance de Carga</h1>
          <p className="text-text-secondary">Análisis de desbalance entre fases</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Análisis de Fases</CardTitle>
            <CardDescription>
              Comparación de carga entre las diferentes fases del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center text-text-muted">
            Área de desbalance de carga (próximamente)
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
