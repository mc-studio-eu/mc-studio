export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path.replace(/\/$/, '')
  const prefix = path.startsWith('/en/') ? '/en' : ''
  const portalPath = path.slice(prefix.length)
  if (!['/portal', '/portal/admin', '/portal/login'].includes(portalPath)) return

  // Forward the session cookie during SSR and recheck it on client navigation.
  const requestFetch = useRequestFetch()
  const { user } = await requestFetch<{ user: { role: string } | null }>('/api/portal/auth/me')
  if (!user) {
    if (portalPath !== '/portal/login') return navigateTo(`${prefix}/portal/login`, { replace: true })
    return
  }

  const home = user.role === 'admin' ? '/portal/admin' : '/portal'
  if (portalPath === '/portal/login' || portalPath !== home) {
    return navigateTo({ path: `${prefix}${home}`, query: portalPath === '/portal/login' ? {} : to.query }, { replace: true })
  }
})
