// Force dark mode on client side, except on cream-themed routes (e.g. /creator)
const CREAM_ROUTES = ['/creator', '/en/creator']

export default defineNuxtPlugin(() => {
    if (!import.meta.client) return

    const route = useRoute()

    const apply = () => {
        const isCream = CREAM_ROUTES.includes(route.path)
        if (isCream) {
            localStorage.setItem('nuxt-color-mode', 'light')
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light', 'creator-cream')
            document.documentElement.setAttribute('data-color-mode', 'light')
        } else {
            localStorage.setItem('nuxt-color-mode', 'dark')
            document.documentElement.classList.remove('light', 'creator-cream')
            document.documentElement.classList.add('dark')
            document.documentElement.setAttribute('data-color-mode', 'dark')
        }
    }

    apply()
    watch(() => route.path, apply)
})
