import { Building2, DoorOpen } from 'lucide-react'
import { ZeiaSelect } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useIndicadoresFilters } from '../hooks/use-indicadores-filters'

export function IndicadoresFilters() {
  const {
    headquarters,
    rooms,
    sedeId,
    salaId,
    dateAfter,
    dateBefore,
    setSedeId,
    setSalaId,
    setDateRange,
    isLoadingHeadquarters,
    isLoadingRooms,
  } = useIndicadoresFilters()

  const sedeOptions = headquarters.map((h) => ({
    value: String(h.id),
    label: h.name,
  }))

  const salaOptions = rooms.map((r) => ({
    value: String(r.id),
    label: r.name,
  }))

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Sede Selector */}
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label className="label-executive" style={{ color: '#88939b' }}>
          Sede
        </label>
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

      {/* Sala Selector */}
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label className="label-executive" style={{ color: '#88939b' }}>
          Sala
        </label>
        {!sedeId || isLoadingRooms ? (
          <div className="w-full h-[43px] rounded-lg border border-border bg-card flex items-center px-4 text-sm text-text-muted">
            Seleccione una sede primero
          </div>
        ) : (
          <ZeiaSelect
            options={salaOptions}
            value={salaId ? String(salaId) : ''}
            onChange={(val) => setSalaId(Number(val))}
            placeholder="Seleccionar sala"
            icon={DoorOpen}
          />
        )}
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
    </div>
  )
}
