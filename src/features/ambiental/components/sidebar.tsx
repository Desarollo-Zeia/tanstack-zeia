import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useOcupacionalAuth } from '@/features/ambiental/hooks/use-ocupacional-auth'
import { OCUPACIONAL_MODULES } from '@/features/ambiental/modules'
import { cn } from '@/lib/utils'

export function OcupacionalSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useOcupacionalAuth()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <aside
      className={cn(
        'flex flex-col bg-card border-r border-border shrink-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-16 border-b border-border flex items-center justify-end px-4 shrink-0">
        <button
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-secondary transition-all',
            collapsed && 'mx-auto'
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {OCUPACIONAL_MODULES.map((module) => {
          const hasChildren = !!module.children && module.children.length > 0
          const isModuleActive =
            currentPath === module.url ||
            module.children?.some((child) => currentPath === child.url)

          return (
            <div key={module.id} className="mb-1">
              <Link
                to={module.url}
                onClick={(e) => {
                  if (currentPath === module.url) {
                    e.preventDefault()
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group',
                  isModuleActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-secondary',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? module.label : undefined}
              >
                {isModuleActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <module.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="font-medium truncate">{module.label}</span>}
              </Link>

              {hasChildren && !collapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {module.children!.map((child) => {
                    const isChildActive = currentPath === child.url
                    return (
                      <Link
                        key={child.id}
                        to={child.url}
                        onClick={(e) => {
                          if (currentPath === child.url) {
                            e.preventDefault()
                          }
                        }}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative',
                          isChildActive
                            ? 'bg-primary/5 text-primary font-semibold'
                            : 'text-text-secondary hover:text-text-primary hover:bg-secondary'
                        )}
                      >
                        {isChildActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full" />
                        )}
                        <child.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-border p-3 shrink-0">
        {!collapsed && user && (
          <div className="px-2 py-1">
            <p className="text-sm font-medium text-text-primary truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
