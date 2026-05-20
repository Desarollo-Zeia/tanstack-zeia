import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Zap, ArrowRight, Activity, Shield } from 'lucide-react'


export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />
      
      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Main Card */}
        <div className="card-executive p-10 text-center animate-fade-in">
          {/* Logo Area */}
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

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border" />
            <Activity className="w-4 h-4 text-primary" />
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Plataforma de Monitoreo Energético
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Gestión inteligente de consumo eléctrico en tiempo real para instalaciones industriales
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => router.navigate({ to: '/energia/login' })}
            className="btn-executive-primary w-full group"
          >
            <span>Acceder al Sistema</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
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

        {/* Version */}
        <p className="text-center text-xs text-text-muted mt-6">
          v2.4.1 — ZEIA Technologies Perú
        </p>
      </div>
    </div>
  )
}
