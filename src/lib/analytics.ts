import posthog from 'posthog-js'
import type { PostHogConfig } from 'posthog-js'
import type { User, OcupacionalAuthResponse } from '@/features/auth/types'

const POSTHOG_HOST = 'https://us.i.posthog.com'
const ENVIRONMENT = import.meta.env.VITE_POSTHOG_ENVIRONMENT ?? 'development'

const isBrowser = typeof window !== 'undefined'
const isLocalhost =
  isBrowser &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN

const baseConfig: Partial<PostHogConfig> = {
  api_host: POSTHOG_HOST,
  defaults: '2026-05-30',
  capture_pageview: 'history_change',
  capture_pageleave: true,
  autocapture: true,
  person_profiles: 'identified_only',
  session_recording: {
    maskAllInputs: true,
  },
  persistence: 'localStorage+cookie',
  loaded: (ph) => {
    if (import.meta.env.DEV) {
      ph.debug()
    }
  },
}

export const analytics =
  token && !isLocalhost ? posthog.init(token, baseConfig) : null

export function inferModule(pathname: string): 'energy' | 'ambiental' | 'landing' {
  if (pathname.startsWith('/energia')) return 'energy'
  if (pathname.startsWith('/ambiental')) return 'ambiental'
  return 'landing'
}

export function identifyEnergyUser(user: User): void {
  if (!analytics) return

  analytics.identify(user.email, {
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    company_id: user.companies[0]?.id,
    company_name: user.companies[0]?.name,
    module: 'energy',
    environment: ENVIRONMENT,
  })
}

export function identifyAmbientalUser(user: OcupacionalAuthResponse): void {
  if (!analytics) return

  analytics.identify(user.email, {
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    user_id: user.user_id,
    module: 'ambiental',
    environment: ENVIRONMENT,
  })
}

export function resetEnergyAnalytics(): void {
  if (!analytics) return

  analytics.capture('user logged out', { module: 'energy' })
  analytics.reset()
}

export function resetAmbientalAnalytics(): void {
  if (!analytics) return

  analytics.capture('user logged out', { module: 'ambiental' })
  analytics.reset()
}
