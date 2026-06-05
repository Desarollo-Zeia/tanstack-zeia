import { Activity } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { ZeiaSelect } from '@/components/ui/select'
import {
  AVAILABLE_INDICATORS,
  useMonitoreoFilters,
} from '../hooks/use-monitoreo-filters'

export function MonitoreoFilters() {
  const { indicator, isReady } = useMonitoreoFilters()
  const navigate = useNavigate({ from: '/ambiental/dashboard/monitoreo' })

  const indicatorOptions = AVAILABLE_INDICATORS.map((i) => {
    const labelMap: Record<string, string> = {
      CO2: 'CO₂',
      TEMPERATURE: 'Temperatura',
      HUMIDITY: 'Humedad',
    }
    const unitMap: Record<string, string> = {
      PPM: 'ppm',
      PERCENT: '%',
      CELSIUS: '°C',
    }
    return {
      value: i.indicator,
      label: `${labelMap[i.indicator] ?? i.indicator} (${unitMap[i.unit] ?? i.unit})`,
    }
  })

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label className="label-executive" style={{ color: '#88939b' }}>
          Indicador
        </label>
        {!isReady ? (
          <div className="w-full h-[43px] rounded-lg border border-border bg-card animate-pulse" />
        ) : (
          <ZeiaSelect
            options={indicatorOptions}
            value={indicator ?? ''}
            onChange={(val) => {
              const selected = AVAILABLE_INDICATORS.find(
                (i) => i.indicator === val
              )
              if (selected) {
                navigate({
                  search: {
                    indicador: selected.indicator,
                    unidad: selected.unit,
                  },
                })
              }
            }}
            placeholder="Seleccionar indicador"
            icon={Activity}
          />
        )}
      </div>
    </div>
  )
}
