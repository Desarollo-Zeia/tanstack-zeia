import { Building2 } from 'lucide-react'
import { ZeiaSelect } from '@/components/ui/select'
import { useRoomsFilters } from '../hooks/use-rooms-filters'

export function RoomsFilters() {
  const { headquarters, sedeId, setSedeId, isLoadingHeadquarters } =
    useRoomsFilters()

  const sedeOptions = headquarters.map((h) => ({
    value: String(h.id),
    label: h.name,
  }))

  return (
    <div className="flex flex-wrap items-end gap-3">
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
    </div>
  )
}
