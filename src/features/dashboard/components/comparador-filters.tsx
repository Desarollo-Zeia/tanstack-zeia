import { Building2, Zap, Activity } from 'lucide-react'
import { ZeiaSelect } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useComparadorFilters } from '../hooks/use-comparador-filters'

export function ComparadorFilters() {
  const {
    headquarters,
    panels,
    measurementPoints,
    sedeId,
    panelId,
    puntoId,
    dateAfter,
    dateBefore,
    setSedeId,
    setPanelId,
    setPuntoId,
    setDateRange,
    isLoadingHeadquarters,
    isLoadingMeasurementPoints,
  } = useComparadorFilters()

  const sedeOptions = headquarters.map((h) => ({
    value: String(h.id),
    label: h.name,
  }))

  const panelOptions = panels.map((p) => ({
    value: String(p.id),
    label: p.name,
  }))

  const puntoOptions = measurementPoints.map((mp) => ({
    value: String(mp.id),
    label: mp.name,
  }))

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label className="label-executive" style={{ color: '#88939b' }}>Sede</label>
        {isLoadingHeadquarters ? (
          <div className="w-full h-[43px] rounded-lg border border-border bg-card animate-pulse" />
        ) : (
          <ZeiaSelect
            options={sedeOptions}
            value={sedeId ? String(sedeId) : ''}
            onChange={(val) => setSedeId(Number(val))}
            placeholder="Seleccionar sede"
            icon={Building2}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5 min-w-[240px]">
        <label className="label-executive" style={{ color: '#88939b' }}>Panel Eléctrico</label>
        {panels.length === 0 ? (
          <div className="w-full h-[43px] rounded-lg border border-border bg-card flex items-center px-4 text-sm text-text-muted">
            Seleccione una sede primero
          </div>
        ) : (
          <ZeiaSelect
            options={panelOptions}
            value={panelId ? String(panelId) : ''}
            onChange={(val) => setPanelId(Number(val))}
            placeholder="Seleccionar panel"
            icon={Zap}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5 min-w-[240px]">
        <label className="label-executive" style={{ color: '#88939b' }}>Punto de Monitoreo</label>
        {isLoadingMeasurementPoints || panels.length === 0 ? (
          <div className="w-full h-[43px] rounded-lg border border-border bg-card flex items-center px-4 text-sm text-text-muted">
            {panels.length === 0 ? 'Seleccione un panel primero' : 'Cargando puntos...'}
          </div>
        ) : (
          <ZeiaSelect
            options={puntoOptions}
            value={puntoId ? String(puntoId) : ''}
            onChange={(val) => setPuntoId(Number(val))}
            placeholder="Seleccionar punto"
            icon={Activity}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="label-executive" style={{ color: '#88939b' }}>Rango de Fechas</label>
        <DateRangePicker
          value={{
            startDate: dateAfter,
            endDate: dateBefore,
          }}
          onChange={(range) => setDateRange(range)}
          placeholder="Seleccionar fechas"
        />
      </div>
    </div>
  )
}
