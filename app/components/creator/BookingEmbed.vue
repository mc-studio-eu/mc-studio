<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const calendlyUrl = computed(() => config.public.calendlyUrl)

const calLink = computed(() => {
  const url = calendlyUrl.value
  if (!url) return ''
  try {
    return new URL(url).pathname.replace(/^\/+/, '').replace(/\/embed$/, '')
  } catch {
    return ''
  }
})

const containerRef = ref<HTMLElement | null>(null)

function loadCalEmbed() {
  const w = window as any
  ;(function (C: any, A: string, L: string) {
    const p = function (a: any, ar: IArguments) {
      a.q.push(ar)
    }
    const d = C.document
    C.Cal =
      C.Cal ||
      function () {
        const cal = C.Cal
        const ar = arguments
        if (!cal.loaded) {
          cal.ns = {}
          cal.q = cal.q || []
          const script = d.createElement('script')
          script.src = A
          script.async = true
          d.head.appendChild(script)
          cal.loaded = true
        }
        if (ar[0] === L) {
          const api = function () {
            p(api, arguments)
          }
          const namespace = ar[1]
          api.q = api.q || []
          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api
            p(cal.ns[namespace], ar)
            p(cal, ['initNamespace', namespace] as any)
          } else {
            p(cal, ar)
          }
          return
        }
        p(cal, ar)
      }
  })(w, 'https://app.cal.com/embed/embed.js', 'init')
}

onMounted(async () => {
  if (!calLink.value || !containerRef.value) return

  loadCalEmbed()
  const w = window as any
  // Minimal init based on Cal.com's official snippet shape.
  const Cal = w.Cal
  if (typeof Cal !== 'function') return
  Cal('init', 'booking', { origin: 'https://cal.com' })
  Cal.ns.booking('inline', {
    elementOrSelector: containerRef.value,
    calLink: calLink.value,
    layout: 'month_view',
    config: { theme: 'light' }
  })
  Cal.ns.booking('ui', {
    hideEventTypeDetails: false,
    layout: 'month_view',
    styles: {
      body: { background: '#ffffff' },
      eventTypeListItem: { background: '#ffffff' }
    },
    cssVarsPerTheme: {
      light: {
        'cal-bg': '#ffffff',
        'cal-bg-subtle': '#ffffff',
        'cal-bg-muted': '#ffffff',
        'cal-border-booker': '#ebebeb',
        'cal-border-booker-width': '1px'
      }
    }
  })
})
</script>

<template>
  <section class="mx-auto w-[calc(100%_-_40px)] pb-[clamp(72px,9vw,96px)] pt-9 max-sm:w-[calc(100%_-_28px)] max-sm:pt-4" aria-labelledby="booking-heading">
    <NuxtLink
      :to="localePath('/')"
      :aria-label="t('common.backHome')"
      class="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-ink)] shadow-sm transition-all hover:-translate-x-0.5 hover:border-[var(--color-ink)]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </NuxtLink>
    <CreatorPageHero id="booking-heading" :title="t('call.title')" background="/assets/creator/booking-bg.png">
      <div
        class="cal-booking-frame relative z-10 mt-10 w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-[0_24px_70px_rgba(31,31,31,0.08)] max-sm:mt-8 max-sm:max-h-[calc(100svh-156px)] max-sm:overflow-y-auto max-sm:overscroll-contain"
      >
        <div ref="containerRef" class="cal-booking-embed h-[clamp(680px,86svh,820px)] w-full max-sm:min-h-[920px]" />
      </div>
    </CreatorPageHero>
  </section>
</template>

<style scoped>
:deep(.cal-embed) {
  background: #ffffff !important;
  visibility: visible !important;
}

@media (max-width: 639px) {
  .cal-booking-frame {
    scrollbar-gutter: stable;
    -webkit-overflow-scrolling: touch;
  }

  .cal-booking-embed :deep(.cal-embed),
  .cal-booking-embed :deep(iframe) {
    min-height: 920px !important;
  }
}
</style>
