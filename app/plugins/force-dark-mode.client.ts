// Force dark mode on client side
export default defineNuxtPlugin(() => {
    // Force dark mode in localStorage
    if (import.meta.client) {
        localStorage.setItem('nuxt-color-mode', 'dark')

        // Ensure the html element has dark class
        document.documentElement.classList.remove('light')
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-color-mode', 'dark')
    }
})
