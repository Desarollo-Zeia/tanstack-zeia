import type { ComponentType } from 'react'
import {
  DoorOpen,
  Activity,
  BarChart3,
  Bell,
  TrendingUp,
  AlertTriangle,
  PieChart,
} from 'lucide-react'

export interface OcupacionalModuleItem {
  id: string
  label: string
  url: string
  icon: ComponentType<{ className?: string }>
}

export interface OcupacionalModule extends OcupacionalModuleItem {
  children?: OcupacionalModuleItem[]
}

export const OCUPACIONAL_MODULES: OcupacionalModule[] = [
  {
    id: 'rooms',
    label: 'Listado de Salas',
    url: '/ambiental/dashboard/rooms',
    icon: DoorOpen,
  },
  {
    id: 'monitoreo',
    label: 'Monitoreo',
    url: '/ambiental/dashboard/monitoreo',
    icon: Activity,
  },
  {
    id: 'analisis',
    label: 'Análisis',
    url: '/ambiental/dashboard/analisis',
    icon: BarChart3,
    children: [
      {
        id: 'indicadores',
        label: 'Indicadores',
        url: '/ambiental/dashboard/analisis/indicadores',
        icon: TrendingUp,
      },
      {
        id: 'picosHistoricos',
        label: 'Picos Históricos',
        url: '/ambiental/dashboard/analisis/picoshistoricos',
        icon: AlertTriangle,
      },
      {
        id: 'estadisticas',
        label: 'Estadísticas',
        url: '/ambiental/dashboard/analisis/estadisticas',
        icon: PieChart,
      },
    ],
  },
  {
    id: 'alertas',
    label: 'Alertas',
    url: '/ambiental/dashboard/alertas',
    icon: Bell,
  },
]

export const OCUPACIONAL_DEFAULT_ROUTE = OCUPACIONAL_MODULES[0].url
