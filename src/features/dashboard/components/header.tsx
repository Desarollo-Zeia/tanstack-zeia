import { Sun, Moon, LogOut, Zap } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useRouter } from '@tanstack/react-router'


export function DashboardHeader() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.navigate({ to: '/energia/login' })
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-text-primary text-sm tracking-tight hidden sm:block">
            {user?.companies?.[0]?.name || 'ZEIA Energy'}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-secondary transition-all"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Logout */}
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
