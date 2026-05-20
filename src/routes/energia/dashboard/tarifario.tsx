import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/energia/dashboard/tarifario')({
  component: TarifarioPage,
})

function TarifarioPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Consumo Tarifario</h1>
          <p className="text-text-secondary">Desglose de consumo por tarifa y horario</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Distribución Tarifaria</CardTitle>
            <CardDescription>
              Análisis del consumo segmentado por tipo de tarifa
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center text-text-muted">
            Área de consumo tarifario (próximamente)
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
