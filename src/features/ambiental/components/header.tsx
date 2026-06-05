import { useRouter } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Sun, Moon, LogOut, Leaf } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { useOcupacionalAuth } from '@/features/ambiental/hooks/use-ocupacional-auth'
import { fetchOcupacionalAccountDetail } from '@/features/ambiental/api/account-detail'

export function OcupacionalHeader() {
  const { theme, toggleTheme } = useTheme()
  const { token, logout } = useOcupacionalAuth()
  const router = useRouter()

  const { data: accountDetail, isLoading } = useQuery({
    queryKey: ['ocupacional-account-detail', token],
    queryFn: fetchOcupacionalAccountDetail,
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const handleLogout = () => {
    logout()
    router.navigate({ to: '/ambiental/login' })
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Leaf className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-text-primary text-sm tracking-tight hidden sm:block">
          {isLoading ? (
            <span className="inline-block w-24 h-4 bg-muted rounded animate-pulse align-middle" />
          ) : (
            accountDetail?.name_enterprise
          )}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-secondary transition-all"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
