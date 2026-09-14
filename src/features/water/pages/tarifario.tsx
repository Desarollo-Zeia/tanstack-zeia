import { ArrowLeftRight, BarChart3 } from 'lucide-react'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { WaterTarifarioFilters } from '../components/water-tarifario-filters'
import { WaterBillingComparison } from '../components/water-billing-comparison'
import { WaterBillingCycleTable } from '../components/water-billing-cycle-table'
import { WaterBillingDetailTable } from '../components/water-billing-detail-table'
import { WaterMonthlyBillingView } from '../components/water-monthly-billing-view'
import { useWaterTarifarioFilters } from '../hooks/use-water-tarifario-filters'
import { cn } from '@/lib/utils'

export function WaterTarifarioPage() {
  const { sedeId, tab, setTab, isReady } = useWaterTarifarioFilters()
  const activeTab = tab === 'comparador' ? 'comparador' : 'mensual'

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Consumo Tarifario de Agua</h1>
            <p className="text-text-secondary">Desglose de consumo de agua por tarifa</p>
          </div>
          <WaterTarifarioFilters />
        </div>

        <div className="flex w-fit items-center gap-1 rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setTab('mensual')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'mensual'
                ? 'bg-primary text-white shadow-soft'
                : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setTab('comparador')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'comparador'
                ? 'bg-primary text-white shadow-soft'
                : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
            )}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Comparador
          </button>
        </div>

        {isReady && sedeId && (
          <>
            {activeTab === 'mensual' ? (
              <WaterMonthlyBillingView sedeId={sedeId} />
            ) : (
              <>
                <WaterBillingComparison sedeId={sedeId} />
                <WaterBillingCycleTable sedeId={sedeId} />
                <WaterBillingDetailTable sedeId={sedeId} />
              </>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}
