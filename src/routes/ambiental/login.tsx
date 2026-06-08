import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { requestOcupacionalToken, OcupacionalAuthError } from '@/features/auth/api/request-ocupacional-token'
import { useOcupacionalAuth } from '@/features/ambiental/hooks/use-ocupacional-auth'
import { OCUPACIONAL_DEFAULT_ROUTE } from '@/features/ambiental/modules'

export const Route = createFileRoute('/ambiental/login')({
  component: AmbientalLoginPage,
})

export function AmbientalLoginPage() {
  const router = useRouter()
  const { setAuth } = useOcupacionalAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: requestOcupacionalToken,
    onSuccess: (data) => {
      setAuth(data)
      router.navigate({ to: OCUPACIONAL_DEFAULT_ROUTE })
    },
    onError: (err: Error) => {
      if (err instanceof OcupacionalAuthError) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado. Intente nuevamente más tarde.')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    mutation.mutate({ email, password })
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img
          src="/images/LOGIN-AMBIENTAL.webp"
          alt="Monitoreo Ambiental"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
            Monitoreo<br />
            <span className="text-primary">Ambiental</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm">
            Sistema de monitoreo de condiciones ambientales y de confort en tiempo real para instalaciones industriales
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="relative flex-1 flex items-center justify-center p-6">
        <button
          type="button"
          onClick={() => router.navigate({ to: '/' })}
          className={cn(
            'absolute top-6 left-6 z-20 inline-flex items-center gap-2',
            'px-4 py-2.5 rounded-xl',
            'bg-card border border-border shadow-soft',
            'text-sm font-medium text-text-primary',
            'hover:shadow-medium hover:border-primary/40 hover:-translate-x-0.5',
            'transition-all duration-200'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a módulos</span>
        </button>

        <div className="w-full max-w-lg">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
              <img src="/images/co2service.png" alt="Ambiental" className="w-6 h-6 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">ZEIA</h1>
          </div>

          <div className="card-executive p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-primary mb-1 tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-text-secondary">
                Ingrese sus credenciales para acceder al monitoreo ocupacional
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-r-lg">
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
                  'btn-executive-primary w-full',
                  mutation.isPending && 'opacity-70 cursor-not-allowed'
                )}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </form>


          </div>
        </div>
      </div>
    </div>
  )
}
