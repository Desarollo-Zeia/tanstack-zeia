import { DoorOpen } from 'lucide-react'
import { ZeiaSelect } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useAlertsFilters } from '../hooks/use-alerts-filters'

export function AlertsFilters() {
  const { rooms, roomId, setRoomId, dateAfter, dateBefore, setDateRange, isLoadingRooms } =
    useAlertsFilters()

  const roomOptions = rooms.map((r) => ({
    value: String(r.id),
    label: r.name,
  }))

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label className="label-executive" style={{ color: '#88939b' }}>
          Sala
        </label>
        {isLoadingRooms ? (
          <div className="w-full h-[43px] rounded-lg border border-border bg-card animate-pulse" />
        ) : (
          <ZeiaSelect
            options={roomOptions}
            value={roomId ? String(roomId) : ''}
            onChange={(val) => setRoomId(Number(val))}
            placeholder="Seleccionar sala"
            icon={DoorOpen}
          />
        )}
      </div>

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
