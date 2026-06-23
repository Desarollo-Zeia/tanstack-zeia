import { useRouter } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useOcupacionalAuth } from '@/features/ambiental/hooks/use-ocupacional-auth'

export function OcupacionalHeader() {
  // const { theme, toggleTheme } = useTheme()
  const { logout } = useOcupacionalAuth()
  const router = useRouter()

  // const { data: accountDetail, isLoading } = useQuery({
  //   queryKey: ['ocupacional-account-detail', token],
  //   queryFn: fetchOcupacionalAccountDetail,
  //   enabled: !!token,
  //   staleTime: 1000 * 60 * 5,
  //   retry: 1,
  // })

  const handleLogout = () => {
    logout()
    router.navigate({ to: '/ambiental/login' })
  }

  return (
    <header className="h-16 bg-[#F2F2F2] border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2.5">
        <img
          src="/images/zeia-logo-first.png"
          alt="ZEIA"
          className="h-8 w-auto object-contain"
        />
      
      </div>

      <div className="flex items-center gap-1">
        {/* <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-secondary transition-all"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button> */}
        <button
          onClick={handleLogout}
          className="h-9 px-3 flex items-center gap-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-all"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  )
}
