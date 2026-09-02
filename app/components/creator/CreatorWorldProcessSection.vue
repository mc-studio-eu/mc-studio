<script setup lang="ts">
const { t, tm, rt } = useI18n()

type Step = { title: unknown, description: unknown, tags: unknown[] }

const steps = computed(() => tm('home.process.steps') as unknown as Step[])
</script>

<template>
  <section class="mx-auto w-[min(1024px,calc(100%-40px))] pt-[clamp(56px,8vw,96px)] pb-[clamp(24px,3vw,40px)]" aria-labelledby="process-title">
    <h2
      id="process-title"
      class="m-0 text-center font-[var(--font-body)] text-[clamp(22px,2.4vw,28px)] leading-[1.42] text-[var(--color-ink)]"
    >
      <CreatorMark variant="title" :delay="0.2">
        {{ t('home.process.eyebrow') }}
      </CreatorMark>
    </h2>

    <ol class="relative isolate m-0 mt-[clamp(32px,5vw,76px)] flex list-none flex-col gap-[max(24px,calc(100svh-clamp(64px,8vw,96px)-clamp(260px,42svh,360px)))] p-0 pb-[clamp(24px,6svh,72px)]">
      <li
        v-for="(step, index) in steps"
        :key="index"
        class="sticky flex min-h-[clamp(260px,42svh,360px)] flex-col justify-between gap-[clamp(28px,4vw,48px)] rounded-[16px] p-[clamp(24px,3vw,32px)] shadow-[0_-8px_24px_rgba(31,31,31,0.06)]"
        :class="index % 2 === 0 ? 'bg-[#be98ff]' : 'bg-[#4d4f51]'"
        :style="{
          zIndex: index + 1,
          top: `calc(clamp(64px, 8vw, 96px) + ${index * 12}px)`
        }"
      >
        <div class="flex flex-col gap-[clamp(12px,1.6vw,20px)]">
          <h3 class="m-0 font-[var(--font-body)] text-[clamp(28px,3.6vw,40px)] font-normal leading-[1.25] text-white">
            {{ rt(step.title as string) }}
          </h3>
          <p
            class="m-0 max-w-[453px] font-[Inter,var(--font-body)] text-[clamp(15px,1.8vw,18px)] font-medium leading-[1.5] tracking-[-0.02em] text-white"
          >
            {{ rt(step.description as string) }}
          </p>
        </div>

        <ul class="m-0 flex list-none flex-wrap items-center gap-[12px] p-0">
          <li
            v-for="(tag, tagIndex) in step.tags"
            :key="tagIndex"
            class="flex h-6 items-center rounded-[4px] bg-white px-[6px] font-[Inter,var(--font-body)] text-[10px] font-medium leading-[12px] text-[#0f0f0f]"
          >
            {{ rt(tag as string) }}
          </li>
        </ul>
      </li>
    </ol>
  </section>
</template>
