import { Building2, Zap, Activity, Tag } from 'lucide-react'
import { ZeiaSelect } from '@/components/ui/select'
import {
  usePanelReadingsFilters,
  WEEKDAY_OPTIONS,
  WEEKDAY_LABELS,
  MONTHS_ES,
  buildAnioOptions,
  type Weekday,
} from '../hooks/use-panel-readings-filters'
import { getElectricParameter as getElectricParameterFromCatalog } from '@/lib/electric-parameters'
import { cn } from '@/lib/utils'

const ENERGY_INDICATORS = [
  'EPpos',
  'EPneg',
  'EQpos',
  'EQneg',
] as const

const ENERGY_INDICATOR_OPTIONS = ENERGY_INDICATORS.map((key) => {
  const param = getElectricParameterFromCatalog(key)
  return {
    value: key,
    label: param ? `${param.parameter} (${param.unit})` : key,
  }
})

export function PanelReadingsFilters() {
  const {
    headquarters,
    panels,
    measurementPoints,
    sedeId,
    panelId,
    puntoId,
    indicador,
    weekday,
    anio,
    mes,
    isLoadingHeadquarters,
    isLoadingMeasurementPoints,
    setSedeId,
    setPanelId,
    setPuntoId,
    setIndicador,
    setWeekday,
    setAnio,
    setMes,
  } = usePanelReadingsFilters()

  const sedeOptions = headquarters.map((h) => ({ value: String(h.id), label: h.name }))
  const panelOptions = panels.map((p) => ({ value: String(p.id), label: p.name }))
  const puntoOptions = measurementPoints.map((mp) => ({ value: String(mp.id), label: mp.name }))

  const anioOptions = buildAnioOptions(new Date().getFullYear()).map((y) => ({
    value: String(y),
    label: String(y),
  }))

  const mesOptions = MONTHS_ES.map((label, index) => ({
    value: String(index),
    label,
  }))

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Sede */}
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

      {/* Panel */}
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

      {/* Punto de monitoreo */}
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

      {/* Indicador (solo 4 opciones de energía) */}
      <div className="flex flex-col gap-1.5 min-w-[260px]">
        <label className="label-executive" style={{ color: '#88939b' }}>Indicador</label>
        <ZeiaSelect
          options={ENERGY_INDICATOR_OPTIONS}
          value={indicador}
          onChange={(val) => setIndicador(val)}
          placeholder="Seleccionar indicador"
          icon={Tag}
        />
      </div>

      {/* Weekday toggle */}
      <div className="flex flex-col gap-1.5">
        <label className="label-executive" style={{ color: '#88939b' }}>Días</label>
        <div
          role="group"
          aria-label="Filtro de días de la semana"
          className="flex h-[43px] rounded-lg border border-border overflow-hidden bg-card"
        >
          {WEEKDAY_OPTIONS.map((opt: Weekday) => {
            const isActive = opt === weekday
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setWeekday(opt)}
                aria-pressed={isActive}
                className={cn(
                  'px-4 text-sm font-semibold transition-colors duration-150',
                  'border-r border-border last:border-r-0',
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-card text-text-secondary hover:bg-primary/10 hover:text-text-primary'
                )}
                title={WEEKDAY_LABELS[opt]}
              >
                {WEEKDAY_LABELS[opt]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Year + Month pickers */}
      <div className="flex flex-col gap-1.5">
        <label className="label-executive" style={{ color: '#88939b' }}>Periodo</label>
        <div className="flex gap-2">
          <div className="min-w-[110px]">
            <ZeiaSelect
              options={anioOptions}
              value={String(anio)}
              onChange={(val) => setAnio(Number(val))}
              placeholder="Año"
            />
          </div>
          <div className="min-w-[160px]">
            <ZeiaSelect
              options={mesOptions}
              value={String(mes)}
              onChange={(val) => setMes(Number(val))}
              placeholder="Mes"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
