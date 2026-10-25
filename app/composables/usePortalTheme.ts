import { computed } from 'vue'
import { useCookie } from '#app'

export function usePortalTheme() {
  const preference = useCookie<string>('mc-portal-theme', {
    default: () => 'dark',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  const theme = computed(() => preference.value === 'light' ? 'light' : 'dark')
  const toggleTheme = () => { preference.value = theme.value === 'dark' ? 'light' : 'dark' }
  return { theme, toggleTheme }
}
