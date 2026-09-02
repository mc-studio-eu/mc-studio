// Force dark mode on client side
export default defineNuxtPlugin(() => {
    if (!import.meta.client) return

    const applyMode = (path: string) => {
        const isCreatorWorld = path.includes('/creators')
        const mode = isCreatorWorld ? 'light' : 'dark'
        localStorage.setItem('nuxt-color-mode', mode)
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(mode)
        document.documentElement.setAttribute('data-color-mode', mode)
    }

    const router = useRouter()
    applyMode(router.currentRoute.value.path)
    router.afterEach((to) => applyMode(to.path))
})
