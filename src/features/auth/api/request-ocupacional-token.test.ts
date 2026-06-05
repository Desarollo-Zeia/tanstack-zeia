import { describe, it, expect } from 'vitest'
import { requestOcupacionalToken, OcupacionalAuthError } from './request-ocupacional-token'

describe('requestOcupacionalToken — fetch real al endpoint', () => {
  it('debe lanzar OcupacionalAuthError (SERVER_ERROR) con credenciales inválidas', async () => {
    await expect(
      requestOcupacionalToken({ email: 'invalid@test.com', password: 'wrongpassword' })
    ).rejects.toThrow(OcupacionalAuthError)

    try {
      await requestOcupacionalToken({ email: 'invalid@test.com', password: 'wrongpassword' })
    } catch (err) {
      expect(err).toBeInstanceOf(OcupacionalAuthError)
      expect((err as OcupacionalAuthError).code).toBe('SERVER_ERROR')
      expect((err as OcupacionalAuthError).message.length).toBeGreaterThan(0)
    }
  })

  it('debe lanzar OcupacionalAuthError con body vacío', async () => {
    await expect(
      requestOcupacionalToken({ email: '', password: '' })
    ).rejects.toThrow(OcupacionalAuthError)

    try {
      await requestOcupacionalToken({ email: '', password: '' })
    } catch (err) {
      const code = (err as OcupacionalAuthError).code
      expect(['SERVER_ERROR', 'INVALID_RESPONSE']).toContain(code)
    }
  })

  it.skip('debe retornar OcupacionalAuthResponse con credenciales válidas (requiere credenciales reales)', async () => {
    // const result = await requestOcupacionalToken({ email: 'tu@email.com', password: 'tu_password' })
    // expect(result.token).toBeDefined()
    // expect(result.user_id).toBeGreaterThan(0)
  })
})
