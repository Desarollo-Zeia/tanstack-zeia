import { useState } from 'react'
import { Building2, Zap, Activity, Tag, Star, FileSpreadsheet, FileText } from 'lucide-react'
import { ZeiaSelect } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useHomeFilters, VALID_CATEGORIES } from '../hooks/use-home-filters'
import type { Category } from '../hooks/use-home-filters'
import type { ReportFileFormat } from '../api/download-report'
import { cn } from '@/lib/utils'


const CATEGORY_LABELS: Record<Category, string> = {
  power: 'Potencia',
  energy: 'Energía',
  current: 'Corriente',
  voltage: 'Voltaje',
}

const FILE_FORMATS: Array<{ value: ReportFileFormat; label: string; icon: typeof FileSpreadsheet }> = [
  { value: 'xlsx', label: 'XLSX', icon: FileSpreadsheet },
  { value: 'csv', label: 'CSV', icon: FileText },
]

interface HomeFiltersProps {
  onDownloadExcel?: (format: ReportFileFormat) => void
  isDownloadingExcel?: boolean
  canDownload?: boolean
}

export function HomeFilters({ onDownloadExcel, isDownloadingExcel, canDownload }: HomeFiltersProps) {
  const [fileFormat, setFileFormat] = useState<ReportFileFormat>('xlsx')
  const {
    headquarters,
    panels,
    measurementPoints,
    favoritePoints,
    sedeId,
    panelId,
    puntoId,
    category,
    dateAfter,
    dateBefore,
    selectedFavoriteId,
    setSedeId,
    setPanelId,
    setPuntoId,
    setCategory,
    setDateRange,
    setFavoritePoint,
    isLoadingHeadquarters,
    isLoadingMeasurementPoints,
    isLoadingFavoritePoints,
  } = useHomeFilters()

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

  const categoryOptions = VALID_CATEGORIES.map((c: Category) => ({
    value: c,
    label: CATEGORY_LABELS[c],
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
        <label className="label-executive text-text-muted">Sede</label>
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
        <label className="label-executive text-text-muted">Panel Eléctrico</label>
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
        <label className="label-executive text-text-muted">Punto de Monitoreo</label>
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

      {/* Category Selector */}
      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <label className="label-executive text-text-muted">Indicador</label>
        <ZeiaSelect
          options={categoryOptions}
          value={category ?? ''}
          onChange={(val) => setCategory(val as Category)}
          placeholder="Seleccionar categoría"
          icon={Tag}
        />
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-col gap-1.5">
        <label className="label-executive text-text-muted">Rango de Fechas</label>
        <DateRangePicker
          value={{
            startDate: dateAfter,
            endDate: dateBefore,
          }}
          onChange={(range) => setDateRange(range)}
          placeholder="Seleccionar fechas"
        />
      </div>

      {/* Download: Format segmented control + button */}
      {onDownloadExcel && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="label-executive text-text-muted">Formato de Descarga</label>
            <div
              role="radiogroup"
              aria-label="Formato de descarga"
              className="inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-card h-[43px]"
            >
              {FILE_FORMATS.map(({ value, label, icon: Icon }) => {
                const isActive = fileFormat === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setFileFormat(value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 rounded-md text-sm font-semibold transition-all duration-200 h-[33px]',
                      isActive
                        ? 'bg-green-600 text-white shadow-soft'
                        : 'text-text-muted hover:text-text-primary hover:bg-muted'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label-executive text-text-muted opacity-0 select-none">Descargar</label>
            <button
              onClick={() => onDownloadExcel(fileFormat)}
              disabled={isDownloadingExcel || !canDownload}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors h-[43px]',
                'bg-green-600 text-white hover:bg-green-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {fileFormat === 'xlsx' ? (
                <img src="/excel.png" alt="Excel" className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isDownloadingExcel ? 'Descargando...' : `Descargar ${fileFormat.toUpperCase()}`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
