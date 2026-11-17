import type { MaybeRefOrGetter } from 'vue'

export function useStudioSeo(
  title: MaybeRefOrGetter<string>,
  description: MaybeRefOrGetter<string>,
) {
  const route = useRoute()
  const url = computed(
    () => `https://www.mc-studio.eu${route.path === '/' ? '' : route.path}`,
  )
  useSeoMeta({
    title: () => toValue(title),
    description: () => toValue(description),
    ogTitle: () => toValue(title),
    ogDescription: () => toValue(description),
    ogUrl: () => url.value,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(title),
    twitterDescription: () => toValue(description),
  })
  useHead(() => ({
    htmlAttrs: { lang: 'fr' },
    link: [{ rel: 'canonical', href: url.value }],
  }))
}
