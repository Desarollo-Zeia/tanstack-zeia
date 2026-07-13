import { DateRangePicker } from '@/components/ui/date-range-picker'
import { ZeiaSelect } from '@/components/ui/select'
import {
  AVAILABLE_INDICATORS,
  INTERVAL_OPTIONS,
  useEstadisticasFilters,
} from '../hooks/use-estadisticas-filters'
import { formatDateShort } from '@/lib/date-utils'
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

const ROOM_COLORS = [
  '#00B7CA',
  '#2EC4B6',
  '#FF6B35',
  '#E71D36',
  '#8B5CF6',
  '#F59E0B',
  '#10B981',
  '#6366F1',
  '#EC4899',
  '#84CC16',
  '#06B6D4',
  '#F97316',
]

function CheckboxButton({
  label,
  color,
  checked,
  onChange,
}: {
  label: string
  color?: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
        'border hover:shadow-soft',
        checked
          ? 'border-primary/30 bg-primary/5 text-text-primary'
          : 'border-border bg-card text-text-muted'
      )}
    >
      <div
        className={cn(
          'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
          checked
            ? 'border-primary bg-primary text-white'
            : 'border-border bg-transparent'
        )}
      >
        {checked && (
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      {color && (
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="font-medium">{label}</span>
    </button>
  )
}

export function EstadisticasFilters() {
  const {
    headquarters,
    rooms,
    sedeId,
    salaId,
    salaIds,
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    selectedDates,
    datesInRange,
    intervalo,
    viewMode,
    setSedeId,
    setSalaId,
    toggleSala,
    selectAllSalas,
    clearSalas,
    setIndicator,
    setDateRange,
    toggleFecha,
    selectAllFechas,
    clearFechas,
    setIntervalo,
    isLoadingHeadquarters,
    isLoadingRooms,
  } = useEstadisticasFilters()

  const sedeOptions = headquarters.map((h) => ({
    value: String(h.id),
    label: h.name,
  }))

  const salaOptions = rooms.map((r) => ({
    value: String(r.id),
    label: r.name,
  }))

  const intervalOptions = INTERVAL_OPTIONS.map((opt) => ({
    value: opt.value === null ? 'null' : String(opt.value),
    label: opt.label,
  }))

  const currentIntervalValue = intervalo === null ? 'null' : String(intervalo)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Sede Selector */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="label-executive" style={{ color: '#88939b' }}>
            Sede
          </label>
          {isLoadingHeadquarters ? (
            <div className="h-9 bg-muted rounded-lg animate-pulse" />
          ) : (
            <ZeiaSelect
              options={sedeOptions}
              value={sedeId ? String(sedeId) : ''}
              onChange={(val) => setSedeId(Number(val))}
              placeholder="Seleccionar sede"
            />
          )}
        </div>

        {/* Sala Selector - Only visible in single-room modes */}
        {viewMode !== 'combined' && (
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="label-executive" style={{ color: '#88939b' }}>
              Sala
            </label>
            {isLoadingRooms ? (
              <div className="h-9 bg-muted rounded-lg animate-pulse" />
            ) : (
              <ZeiaSelect
                options={salaOptions}
                value={salaId ? String(salaId) : ''}
                onChange={(val) => setSalaId(Number(val))}
                placeholder="Seleccionar sala"
              />
            )}
          </div>
        )}

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
                  {INDICATOR_LABELS[ind.indicator] ?? ind.indicator} (
                  {UNIT_LABELS[ind.unit] ?? ind.unit})
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

      {/* Room Checkboxes - Combined mode */}
      {viewMode === 'combined' && rooms.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-text-secondary">
              Salas a mostrar en la gráfica:
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllSalas}
                className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Seleccionar todas
              </button>
              <span className="text-text-muted">·</span>
              <button
                type="button"
                onClick={clearSalas}
                className="text-xs text-text-muted hover:text-danger transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {rooms.map((room, index) => {
              const color = ROOM_COLORS[index % ROOM_COLORS.length]
              return (
                <CheckboxButton
                  key={room.id}
                  label={room.name}
                  color={color}
                  checked={salaIds.includes(room.id)}
                  onChange={() => toggleSala(room.id)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Date Checkboxes - Combined mode */}
      {viewMode === 'combined' && datesInRange.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-text-secondary">
              Fechas a mostrar en la gráfica:
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllFechas}
                className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Seleccionar todas
              </button>
              <span className="text-text-muted">·</span>
              <button
                type="button"
                onClick={clearFechas}
                className="text-xs text-text-muted hover:text-danger transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {datesInRange.map((date) => (
              <CheckboxButton
                key={date}
                label={formatDateShort(date)}
                checked={selectedDates.includes(date)}
                onChange={() => toggleFecha(date)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
