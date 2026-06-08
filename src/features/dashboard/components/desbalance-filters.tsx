import { Building2, Zap, Activity, Star } from 'lucide-react'
import { ZeiaSelect } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useDesbalanceFilters } from '../hooks/use-desbalance-filters'
import { cn } from '@/lib/utils'

export function DesbalanceFilters() {
  const {
    headquarters,
    panels,
    measurementPoints,
    favoritePoints,
    sedeId,
    panelId,
    puntoId,
    dateAfter,
    dateBefore,
    selectedFavoriteId,
    setSedeId,
    setPanelId,
    setPuntoId,
    setDateRange,
    setFavoritePoint,
    isLoadingHeadquarters,
    isLoadingMeasurementPoints,
    isLoadingFavoritePoints,
  } = useDesbalanceFilters()

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

  const favoriteOptions = favoritePoints.map((f) => ({
    value: String(f.id),
    label: f.name,
  }))

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Favorite Points Selector — destacado */}
      {favoritePoints.length > 0 && (
        <div className="flex flex-col gap-1 min-w-[220px] border-l-4 border-l-primary bg-primary/5 rounded-lg p-2 shadow-glow">
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-primary fill-primary" />
            <label className="label-executive text-primary">Favoritos</label>
          </div>
          <span className="text-[10px] text-primary/80 font-medium -mt-0.5 ml-[1.1rem]">
            Acceso rápido a tus puntos
          </span>
          {isLoadingFavoritePoints ? (
            <div className="w-full h-[43px] rounded-lg border border-primary/30 bg-card animate-pulse mt-1" />
          ) : (
            <div className="mt-1">
              <ZeiaSelect
                options={favoriteOptions}
                value={selectedFavoriteId ? String(selectedFavoriteId) : ''}
                onChange={(val) => setFavoritePoint(Number(val))}
                placeholder="Seleccionar favorito"
                icon={Star}
              />
            </div>
          )}
        </div>
      )}

      {/* Manual selectors — apagados visualmente */}
      <div className="flex flex-col gap-1.5 min-w-[200px] opacity-70 hover:opacity-100 transition-opacity">
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

      {/* Panel Selector */}
      <div className={cn(
        "flex flex-col gap-1.5 min-w-[240px] transition-opacity",
        selectedFavoriteId ? "opacity-60" : "opacity-70 hover:opacity-100"
      )}>
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

      {/* Measurement Point Selector */}
      <div className={cn(
        "flex flex-col gap-1.5 min-w-[240px] transition-opacity",
        selectedFavoriteId ? "opacity-60" : "opacity-70 hover:opacity-100"
      )}>
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

      {/* Date Range Picker */}
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
