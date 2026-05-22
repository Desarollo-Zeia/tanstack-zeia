import type { ReactNode } from 'react'
import { DashboardHeader } from '@/features/dashboard/components/header'
import { DashboardSidebar } from '@/features/dashboard/components/sidebar'

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
