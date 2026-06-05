import { DateRangePicker } from '@/components/ui/date-range-picker'
import { ZeiaSelect } from '@/components/ui/select'
import {
  AVAILABLE_INDICATORS,
  INTERVAL_OPTIONS,
  useEstadisticasFilters,
} from '../hooks/use-estadisticas-filters'
import { cn } from '@/lib/utils'

const INDICATOR_LABELS: Record<string, string> = {
  CO2: 'CO₂',
  TEMPERATURE: 'Temperatura',
  HUMIDITY: 'Humedad',
}

const UNIT_LABELS: Record<string, string> = {
  PPM: 'ppm',
  PERCENT: '%',
  CELSIUS: '°C',
}

export function EstadisticasFilters() {
  const { indicador, unidad, dateAfter, dateBefore, intervalo, setIndicator, setDateRange, setIntervalo } =
    useEstadisticasFilters()

  const intervalOptions = INTERVAL_OPTIONS.map((opt) => ({
    value: opt.value === null ? 'null' : String(opt.value),
    label: opt.label,
  }))

  const currentIntervalValue = intervalo === null ? 'null' : String(intervalo)

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Indicator Toggle */}
      <div className="flex flex-col gap-1.5">
        <label className="label-executive" style={{ color: '#88939b' }}>
          Indicador
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_INDICATORS.map((ind) => {
            const isActive = ind.indicator === indicador && ind.unit === unidad
            return (
              <button
                key={`${ind.indicator}-${ind.unit}`}
                type="button"
                onClick={() => setIndicator(ind.indicator, ind.unit)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-glow'
                    : 'bg-muted text-text-secondary hover:bg-primary/10 hover:text-primary border border-border'
                )}
              >
                {INDICATOR_LABELS[ind.indicator] ?? ind.indicator} ({UNIT_LABELS[ind.unit] ?? ind.unit})
              </button>
            )
          })}
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-col gap-1.5">
        <label className="label-executive" style={{ color: '#88939b' }}>
          Rango de Fechas
        </label>
        <DateRangePicker
          value={{
            startDate: dateAfter,
            endDate: dateBefore,
          }}
          onChange={(range) => setDateRange(range)}
          placeholder="Seleccionar fechas"
        />
      </div>

      {/* Interval Selector */}
      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <label className="label-executive" style={{ color: '#88939b' }}>
          Intervalo
        </label>
        <ZeiaSelect
          options={intervalOptions}
          value={currentIntervalValue}
          onChange={(val) => setIntervalo(val === 'null' ? null : Number(val))}
          placeholder="Intervalo"
        />
      </div>
    </div>
  )
}
