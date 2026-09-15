import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardHeader } from './header'
import type { User } from '@/features/auth/types'

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: vi.fn() }),
  useRouterState: () => ({ location: { pathname: '/energia/dashboard/panel' } }),
}))

vi.mock('../api/peak-demand-range', () => ({
  fetchPeakDemandRange: vi.fn().mockResolvedValue({
    date: '2026-06-19',
    hour_start: '18:00',
    hour_end: '19:00',
    description: 'Rango de máxima demanda programada COES',
  }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 67,
    email: 'demo@zeia.com.pe',
    first_name: 'Zeia',
    last_name: 'Demo',
    companies: [],
    is_user_energy_monitoring: true,
    is_user_water_monitoring: false,
    energy_modules: [],
    water_modules: [],
    is_user_quality_air_auto: false,
    is_user_thermal_comfort: false,
    ...overrides,
  }
}

function setSession(auth: Record<string, unknown>) {
  localStorage.setItem('zeia-auth', JSON.stringify(auth))
}

describe('DashboardHeader — botón Máxima Demanda Nacional', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('muestra el botón cuando maxdemand es true', () => {
    setSession({ token: 'abc', user: mockUser(), maxdemand: true })

    render(<DashboardHeader />, { wrapper: createWrapper() })

    expect(
      screen.getByRole('button', { name: /máxima demanda nacional/i })
    ).toBeInTheDocument()
  })

  it('oculta el botón cuando maxdemand es false', () => {
    setSession({ token: 'abc', user: mockUser(), maxdemand: false })

    render(<DashboardHeader />, { wrapper: createWrapper() })

    expect(
      screen.queryByRole('button', { name: /máxima demanda nacional/i })
    ).not.toBeInTheDocument()
  })

  it('oculta el botón cuando la sesión no trae el flag (sesiones antiguas)', () => {
    setSession({ token: 'abc', user: mockUser() })

    render(<DashboardHeader />, { wrapper: createWrapper() })

    expect(
      screen.queryByRole('button', { name: /máxima demanda nacional/i })
    ).not.toBeInTheDocument()
  })
})
