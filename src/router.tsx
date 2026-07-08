import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { analytics, inferModule } from './lib/analytics'

export const router = createRouter({ routeTree })

router.subscribe('onResolved', (event) => {
  if (!analytics) return

  analytics.capture('$pageview', {
    $current_url: window.location.href,
    $pathname: event.toLocation.pathname,
    module: inferModule(event.toLocation.pathname),
    environment: import.meta.env.VITE_POSTHOG_ENVIRONMENT ?? 'development',
  })
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
