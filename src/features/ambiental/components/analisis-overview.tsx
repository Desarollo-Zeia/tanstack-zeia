import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  AlertTriangle,
  PieChart,
  BarChart3,
  ArrowRight,
  Building2,
  DoorOpen,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchOcupacionalHeadquarters } from '@/features/ambiental/api/headquarters'
import { fetchOcupacionalRooms } from '@/features/ambiental/api/rooms'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  accentColor: string
  accentBg: string
  features: string[]
  to: string
}

function ModuleCard({ title, description, icon, accentColor, accentBg, features, to }: ModuleCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-medium hover:-translate-y-1 border-border bg-card">
      <CardHeader className="pb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110', accentBg)}>
          <div className={accentColor}>{icon}</div>
        </div>
        <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-2.5">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link to={to} className="block">
          <Button variant="outline" className="w-full group/btn">
            <span>Ver detalle</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function KpiCard({
  label,
  value,
  icon,
  isLoading,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  isLoading?: boolean
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <div className="text-primary">{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
          {isLoading ? (
            <div className="h-6 w-16 bg-muted rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-text-primary font-mono tracking-tight">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalisisOverview() {
  const { data: headquartersData, isLoading: isLoadingHeadquarters } = useQuery({
    queryKey: ['ocupacional-headquarters'],
    queryFn: fetchOcupacionalHeadquarters,
  })

  const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['ocupacional-rooms-all', 'overview'],
    queryFn: () => fetchOcupacionalRooms({ limit: 1000, offset: 0 }),
  })

  const headquarters = useMemo(() => headquartersData?.results ?? [], [headquartersData])
  const rooms = useMemo(() => roomsData?.results ?? [], [roomsData])
  const activeRooms = useMemo(() => rooms.filter((r) => r.is_activated).length, [rooms])

  const isLoading = isLoadingHeadquarters || isLoadingRooms

  const modules: ModuleCardProps[] = [
    {
      title: 'Indicadores',
      description: 'Historial completo de lecturas ambientales organizadas por sala, con filtros de indicador y fechas.',
      icon: <TrendingUp className="w-6 h-6" />,
      accentColor: 'text-primary',
      accentBg: 'bg-primary/10',
      features: [
        'Lecturas paginadas por sala e indicador',
        'Visualización de umbrales y estados',
        'Filtrado por sede, sala, indicador y rango de fechas',
      ],
      to: '/ambiental/dashboard/analisis/indicadores',
    },
    {
      title: 'Picos Históricos',
      description: 'Identifica los valores máximos y mínimos históricos por sala para cada indicador ambiental.',
      icon: <AlertTriangle className="w-6 h-6" />,
      accentColor: 'text-warning',
      accentBg: 'bg-warning/10',
      features: [
        'Top valores más altos por sala',
        'Top valores más bajos por sala',
        'Contexto de umbrales para cada medición',
      ],
      to: '/ambiental/dashboard/analisis/picoshistoricos',
    },
    {
      title: 'Estadísticas',
      description: 'Análisis de tendencias y distribución temporal de indicadores ambientales por sala.',
      icon: <PieChart className="w-6 h-6" />,
      accentColor: 'text-success',
      accentBg: 'bg-success/10',
      features: [
        'Gráficos de líneas por sala o por fecha',
        'Intervalos de agregación configurables',
        'Visualización comparativa de tendencias',
      ],
      to: '/ambiental/dashboard/analisis/estadisticas',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Análisis</h1>
            <p className="text-text-secondary text-sm">
              Vistazo general de los módulos de análisis ambiental
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Sedes"
          value={headquarters.length}
          icon={<Building2 className="w-5 h-5" />}
          isLoading={isLoading}
        />
        <KpiCard
          label="Salas"
          value={rooms.length}
          icon={<DoorOpen className="w-5 h-5" />}
          isLoading={isLoading}
        />
        <KpiCard
          label="Salas Activas"
          value={activeRooms}
          icon={<CheckCircle2 className="w-5 h-5" />}
          isLoading={isLoading}
        />
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </div>

      {/* Bottom hint */}
      <div className="card-executive p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <BarChart3 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Consejo de navegación</h3>
          <p className="text-sm text-text-secondary mt-1">
            Seleccione cualquiera de las tarjetas superiores para explorar los datos detallados de cada módulo.
            Cada sección permite filtrar por sede, sala, indicador y rango de fechas para obtener información precisa.
          </p>
        </div>
      </div>
    </div>
  )
}
