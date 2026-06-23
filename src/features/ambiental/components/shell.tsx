import type { ReactNode } from 'react'
import { OcupacionalHeader } from '@/features/ambiental/components/header'
import { OcupacionalSidebar } from '@/features/ambiental/components/sidebar'

interface OcupacionalShellProps {
  children: ReactNode
}

export function OcupacionalShell({ children }: OcupacionalShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F2]">
      <OcupacionalHeader />
      <div className="flex flex-1 overflow-hidden">
        <OcupacionalSidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
