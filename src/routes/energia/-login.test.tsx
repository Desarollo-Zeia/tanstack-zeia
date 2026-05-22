import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from './login'

// Mock useRouter from tanstack/react-router
const navigateMock = vi.fn()
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...actual,
    useRouter: () => ({
      navigate: navigateMock,
    }),
  }
})

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('LoginPage — flujo crítico', () => {
  beforeEach(() => {
    localStorage.clear()
    navigateMock.mockClear()
  })

  it('renderiza formulario de login', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByPlaceholderText(/usuario@zeia.com.pe/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra error al enviar credenciales inválidas (fetch real)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/usuario@zeia.com.pe/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(emailInput, 'fake@email.com')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitBtn)

    // Esperamos a que aparezca el mensaje de error del servidor real
    await waitFor(() => {
      expect(
        screen.getByText('Error al iniciar sesión. Verifique sus credenciales.')
      ).toBeInTheDocument()
    })
  })

  it('toggle de mostrar/ocultar contraseña funciona', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement
    // El botón del ojo no tiene aria-label; buscamos por el icono o role genérico
    const toggleBtn = passwordInput.parentElement?.querySelector('button[type="button"]')
    if (!toggleBtn) throw new Error('Toggle button not found')

    expect(passwordInput.type).toBe('password')

    await user.click(toggleBtn)
    expect(passwordInput.type).toBe('text')

    await user.click(toggleBtn)
    expect(passwordInput.type).toBe('password')
  })
})
