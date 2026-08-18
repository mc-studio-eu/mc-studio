// Keep the public site on the warm light palette, including for returning
// visitors who still have the previous forced-dark preference in storage.
export default defineNuxtPlugin((nuxtApp) => {
  const colorMode = useColorMode()

  const applyLightMode = () => {
    colorMode.preference = 'light'
    colorMode.value = 'light'
    localStorage.setItem('nuxt-color-mode', 'light')
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    document.documentElement.setAttribute('data-color-mode', 'light')
  }

  applyLightMode()
  nuxtApp.hook('app:mounted', applyLightMode)
})
