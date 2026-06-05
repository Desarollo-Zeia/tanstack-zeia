import type { ComponentType } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Zap, Leaf, ArrowRight, Activity, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        <div className="card-executive p-8 md:p-10 text-center animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
              <Zap className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-4xl font-bold text-text-primary mb-2 tracking-tight">
              ZEIA
            </h1>
            <p className="text-sm font-medium text-text-muted tracking-[0.2em] uppercase">
              Energy Monitor
            </p>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border" />
            <Activity className="w-4 h-4 text-primary" />
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Seleccione un módulo
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Acceda a las plataformas de monitoreo disponibles para su organización
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-left">
            <ModuleCard
              icon={Zap}
              title="Energía"
              description="Monitoreo y análisis de consumo eléctrico en tiempo real"
              to="/energia/login"
            />
            <ModuleCard
              icon={Leaf}
              title="Monitoreo Ambiental"
              description="Calidad del aire, confort térmico y condiciones ambientales"
              to="/ambiental/login"
            />
          </div>

          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-6 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span>Sistema Activo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>Conexión Segura</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          v2.4.1 — ZEIA Technologies Perú
        </p>
      </div>
    </div>
  )
}

interface ModuleCardProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  to: string
}

function ModuleCard({ icon: Icon, title, description, to }: ModuleCardProps) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.navigate({ to })}
      className={cn(
        'group flex flex-col items-start p-5 rounded-xl',
        'border border-border bg-card text-left',
        'hover:border-primary/40 hover:shadow-medium hover:-translate-y-0.5',
        'transition-all duration-200'
      )}
    >
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-text-secondary leading-relaxed mb-4 flex-1">
        {description}
      </p>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
        Acceder
        <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </button>
  )
}
