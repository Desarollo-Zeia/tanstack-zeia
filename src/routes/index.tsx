import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: HomePage,
})

/* ------------------------------------------------------------------ */
/*  Access Card                                                        */
/* ------------------------------------------------------------------ */
interface CardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  accent: string
  accentLight: string
  accentGlow: string
  to: string
  delay: number
}

function AccessCard({ icon, title, subtitle, description, accent, accentLight, accentGlow, to, delay }: CardProps) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.navigate({ to })}
      className={cn(
        'group relative w-full text-left rounded-3xl transition-all duration-500',
        'hover:-translate-y-2 hover:shadow-glow'
      )}
      style={{ animation: `slide-up-fade 0.7s ease-out ${delay}s both` }}
    >
      <div className="relative rounded-3xl bg-[#fdfcfa] border border-[#e0dbd5] p-8 md:p-10 overflow-hidden transition-all duration-500 group-hover:bg-white group-hover:border-[#d0c8bc]">
        <div
          className="absolute top-0 left-10 right-10 h-1 rounded-b-full transition-all duration-500 group-hover:left-6 group-hover:right-6"
          style={{ background: accent }}
        />
        <div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: accentGlow, filter: 'blur(70px)' }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
              style={{ background: accentLight }}
            >
              {icon}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider" style={{ color: accent }}>
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                  style={{ backgroundColor: accent }}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: accent }} />
              </span>
              Activo
            </div>
          </div>

          <p className="text-[10px] font-mono uppercase tracking-[0.25em] mb-2" style={{ color: accent, opacity: 0.65 }}>
            {subtitle}
          </p>
          <h3 className="text-2xl font-bold tracking-tight mb-3 text-[#1C1C1E]">{title}</h3>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(60,70,80,0.65)' }}>
            {description}
          </p>

          <div
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 group-hover:gap-4 group-hover:shadow-glow"
            style={{ background: accentLight, color: accent }}
          >
            <span>Acceder al módulo</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </div>
        </div>
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Home Page                                                          */
/* ------------------------------------------------------------------ */
function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: '#F5F2EC' }}>
      {/* Soft base background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(45,160,120,0.04) 0%, transparent 60%)' }}
        />
        <div
          className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,183,202,0.03) 0%, transparent 60%)' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16">
        {/* Header / Logo */}
        <div className="text-center mb-14" style={{ animation: 'slide-up-fade 0.7s ease-out 0.15s both' }}>
          {/* Logo */}
          <div className="mb-3">
            <img
              src="/images/zeia-logo-first.png"
              alt="ZEIA"
              className="h-16 md:h-20 mx-auto object-contain"
            />
          </div>
          <p className="text-sm font-mono tracking-[0.35em] uppercase text-[#2DA078] opacity-70 mb-2">
            Plataforma de Monitoreo
          </p>

          {/* Tagline */}
          <p className="text-base max-w-lg mx-auto leading-relaxed mt-4" style={{ color: 'rgba(60,70,80,0.55)' }}>
            Tecnología al servicio de un consumo energético consciente y del bienestar ambiental.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c8c0b2]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#2DA078] opacity-40" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c8c0b2]" />
            <div className="w-1 h-1 rounded-full bg-[#c8c0b2]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#00B7CA] opacity-30" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c8c0b2]" />
          </div>
        </div>

        {/* Access cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-3xl mx-auto">
          <AccessCard
            icon={<img src="/images/energiaservice.png" alt="Energía" className="w-9 h-9 object-contain" />}
            subtitle="Módulo Principal"
            title="Monitoreo Energético"
            description="Análisis en tiempo real de consumo eléctrico, potencia, voltaje, corriente y facturación tarifaria."
            accent="#2DA078"
            accentLight="rgba(45,160,120,0.10)"
            accentGlow="rgba(45,160,120,0.18)"
            to="/energia/login"
            delay={0.5}
          />
          <AccessCard
            icon={<img src="/images/co2service.png" alt="Ambiental" className="w-9 h-9 object-contain" />}
            subtitle="Módulo Secundario"
            title="Monitoreo Ambiental"
            description="Control de calidad del aire, confort térmico, humedad, CO₂ y condiciones ambientales del espacio."
            accent="#00B7CA"
            accentLight="rgba(0,183,202,0.10)"
            accentGlow="rgba(0,183,202,0.15)"
            to="/ambiental/login"
            delay={0.7}
          />
        </div>


      </div>
    </div>
  )
}
