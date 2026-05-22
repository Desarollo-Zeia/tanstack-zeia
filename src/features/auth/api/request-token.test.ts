import { describe, it, expect } from 'vitest'
import { requestToken, AuthError } from '../api/request-token'

describe('requestToken — fetch real al endpoint', () => {
  it('debe lanzar AuthError (SERVER_ERROR) con credenciales inválidas', async () => {
    await expect(
      requestToken({ email: 'invalid@test.com', password: 'wrongpassword' })
    ).rejects.toThrow(AuthError)

    try {
      await requestToken({ email: 'invalid@test.com', password: 'wrongpassword' })
    } catch (err) {
      expect(err).toBeInstanceOf(AuthError)
      expect((err as AuthError).code).toBe('SERVER_ERROR')
      expect((err as AuthError).message.length).toBeGreaterThan(0)
    }
  })

  it('debe lanzar AuthError (SERVER_ERROR) con body vacío / malformado', async () => {
    // El endpoint real probablemente devolverá 400 con JSON de error
    await expect(
      requestToken({ email: '', password: '' })
    ).rejects.toThrow(AuthError)

    try {
      await requestToken({ email: '', password: '' })
    } catch (err) {
      expect(err).toBeInstanceOf(AuthError)
      const code = (err as AuthError).code
      expect(['SERVER_ERROR', 'INVALID_RESPONSE']).toContain(code)
    }
  })

  it.skip('debe retornar AuthResponse con credenciales válidas (requiere credenciales reales)', async () => {
    // Descomenta y reemplaza con credenciales reales para probar el flujo exitoso:
    // const result = await requestToken({ email: 'tu@email.com', password: 'tu_password' })
    // expect(result.token).toBeDefined()
    // expect(result.token.length).toBeGreaterThan(0)
    // expect(result.user).toBeDefined()
    // expect(result.user.email).toBe('tu@email.com')
  })
})
