import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Zap, Eye, EyeOff, Loader2, Activity, Lock, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { requestToken } from '@/features/auth/api/request-token'
import { useAuth } from '@/features/auth/hooks/use-auth'

export const Route = createFileRoute('/energia/login')({
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: requestToken,
    onSuccess: (data) => {
      setAuth(data)
      // Redirigir a la primera URL de energy_modules
      const firstModuleUrl = data.user.energy_modules?.[0]?.children?.[0]?.url || '/energia/dashboard/panel'
      router.navigate({ to: firstModuleUrl })
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    mutation.mutate({ email, password })
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1C1C1E] relative overflow-hidden flex-col justify-between p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #5EDFFF 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">ZEIA</span>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
            Monitoreo<br />
            <span className="text-primary">Energético</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Sistema de control y gestión de energía en tiempo real para instalaciones industriales
          </p>
        </div>

        {/* Metrics Preview */}
        <div className="relative z-10 space-y-3">
          <MetricPreview label="Potencia Activa" value="845.2 kW" trend="+2.4%" positive />
          <MetricPreview label="Factor de Potencia" value="0.94" trend="OK" ok />
          <MetricPreview label="Consumo Diario" value="12,450 kWh" trend="-1.2%" positive={false} />
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Conexión segura TLS 1.3</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">ZEIA</h1>
          </div>

          <div className="card-executive p-8">
            <button
              onClick={() => router.navigate({ to: '/' })}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a módulos</span>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-primary mb-1 tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-text-secondary">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-danger/10 border-l-4 border-danger p-3 rounded-r-lg">
                  <p className="text-sm text-danger font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="label-executive">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-executive w-full font-sans"
                  placeholder="usuario@zeia.com.pe"
                />
              </div>

              <div className="space-y-2">
                <label className="label-executive">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-executive w-full pr-10 font-sans"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className={cn(
                  "btn-executive-primary w-full",
                  mutation.isPending && "opacity-70 cursor-not-allowed"
                )}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <Activity className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricPreview({ label, value, trend, positive, ok }: { 
  label: string; 
  value: string; 
  trend: string;
  positive?: boolean;
  ok?: boolean;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>
      <div className="flex items-center justify-between">
        <p className="font-mono text-lg font-semibold text-white font-tabular">{value}</p>
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          ok ? "bg-success/20 text-success" : 
          positive ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
        )}>
          {trend}
        </span>
      </div>
    </div>
  )
}
