import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { TarifarioFilters } from '@/features/dashboard/components/tarifario-filters'
// import { TotalConsumptionCard } from '@/features/dashboard/components/total-consumption-card'
import { BillingComparison } from '@/features/dashboard/components/billing-comparison'
// import { BillingCycleTable } from '@/features/dashboard/components/billing-cycle-table'
import { BillingDetailTable } from '@/features/dashboard/components/billing-detail-table'
import { useTarifarioFilters } from '@/features/dashboard/hooks/use-tarifario-filters'

export const Route = createFileRoute('/energia/dashboard/tarifario')({
  component: TarifarioPage,
  validateSearch: (search) => ({
    sede: typeof search.sede === 'string' ? search.sede : undefined,
  }),
})

function TarifarioPage() {
  const { sedeId, isReady } = useTarifarioFilters()

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Consumo Tarifario</h1>
            <p className="text-text-secondary">Desglose de consumo por tarifa y horario</p>
          </div>
          <TarifarioFilters />
        </div>

        {isReady && sedeId && (
          <>
            {/* <TotalConsumptionCard sedeId={sedeId} /> */}
            <BillingComparison sedeId={sedeId} />
            {/* <BillingCycleTable sedeId={sedeId} /> */}
            <BillingDetailTable sedeId={sedeId} />
          </>
        )}
      </div>
    </DashboardShell>
  )
}
