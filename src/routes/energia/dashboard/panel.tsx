import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap } from 'lucide-react'

export const Route = createFileRoute('/energia/dashboard/panel')({
  component: PanelPage,
})

function PanelPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Panel Dashboard</h1>
          <p className="text-text-secondary">Vista general del sistema energético</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-primary">
                  Métrica {i}
                </CardTitle>
                <Zap className="h-4 w-4 text-text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">
                  {Math.floor(Math.random() * 1000)} kW
                </div>
                <p className="text-xs text-text-muted">+{Math.floor(Math.random() * 20)}% vs mes anterior</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>
              Aquí se mostrarán los gráficos principales del dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-text-muted">
            Área de gráficos (próximamente)
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
