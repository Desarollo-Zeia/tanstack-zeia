import { Activity } from 'lucide-react'
import type { RoomDetail, RoomThresholdLevel } from '../types'

interface IndicadoresThresholdsProps {
  roomDetail: RoomDetail | undefined
  isLoading: boolean
}

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

const LEVEL_LABELS: Record<string, string> = {
  GOOD: 'Bueno',
  MODERATE: 'Moderado',
  UNHEALTHY: 'No Saludable',
  DANGEROUS: 'Peligroso',
  CRITICAL: 'Crítico',
  TEMP_MIN: 'Mínima',
  TEMP_MAX: 'Máxima',
  HUMIDITY_MIN: 'Mínima',
  HUMIDITY_MAX: 'Máxima',
}

const LEVEL_COLORS: Record<string, string> = {
  GOOD: '#2EC4B6',
  MODERATE: '#FFB800',
  UNHEALTHY: '#FF6B35',
  DANGEROUS: '#E71D36',
  CRITICAL: '#991B1B',
  TEMP_MIN: '#00B7CA',
  TEMP_MAX: '#E71D36',
  HUMIDITY_MIN: '#00B7CA',
  HUMIDITY_MAX: '#E71D36',
}

export function IndicadoresThresholds({ roomDetail, isLoading }: IndicadoresThresholdsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!roomDetail) {
    return (
      <div className="card-executive p-6 flex items-center justify-center text-center min-h-[200px]">
        <div className="space-y-2">
          <Activity className="w-10 h-10 mx-auto text-text-muted/40" />
          <p className="text-sm text-text-muted">
            Seleccione una sala para ver los umbrales
          </p>
        </div>
      </div>
    )
  }

  const thresholdEntries = Object.entries(roomDetail.thresholds)

  if (thresholdEntries.length === 0) {
    return (
      <div className="card-executive p-6 flex items-center justify-center text-center min-h-[200px]">
        <p className="text-sm text-text-muted">
          No hay umbrales configurados para esta sala
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
        Umbrales — {roomDetail.name}
      </h3>
      {thresholdEntries.map(([indicator, config]) => (
        <div key={indicator} className="card-executive p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#00B7CA' }}
            />
            <span className="font-semibold text-text-primary text-sm">
              {INDICATOR_LABELS[indicator] ?? indicator}
            </span>
            <span className="text-xs text-text-muted ml-auto">
              {UNIT_LABELS[config.unit] ?? config.unit}
            </span>
          </div>
          <div className="space-y-2">
            {config.levels.map((level: RoomThresholdLevel) => {
              const color = LEVEL_COLORS[level.level] ?? '#8E8E93'
              return (
                <div key={level.level} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-text-secondary">
                      {LEVEL_LABELS[level.level] ?? level.level}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-text-primary">
                    {level.value.toLocaleString('es-PE', { maximumFractionDigits: 1 })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
