<script setup lang="ts">
const { t } = useI18n();
const ctaSubtitle = computed(() => t('cta.subtitle'));
const submitButton = ref<HTMLElement | null>(null)
const submitTextWrapper = ref<HTMLElement | null>(null)

useTextSlideAnimation(submitButton, submitTextWrapper, { duration: 0.3 })

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  projectType: '',
  message: '',
  website: ''
})

const isSubmitting = ref(false)
const formStatus = ref<'idle' | 'success' | 'error'>('idle')

const submitContact = async () => {
  formStatus.value = 'idle'
  isSubmitting.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form
    })

    formStatus.value = 'success'
    Object.assign(form, {
      name: '',
      email: '',
      phone: '',
      company: '',
      projectType: '',
      message: '',
      website: ''
    })
  } catch {
    formStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section id="contact" class="py-20 px-6 bg-[var(--bg-primary)] transition-colors duration-300">
    <div class="max-w-[1216px] mx-auto">
      <!-- Header -->
      <div class="text-center mb-10 md:mb-12">
        <h2 class="section-title font-manrope text-2xl sm:text-3xl md:text-[32px] font-semibold text-[var(--text-primary)] mb-4 transition-colors duration-300" v-html="$t('cta.title')"></h2>
        <p class="font-inter text-base text-[var(--text-secondary)] max-w-[842px] mx-auto transition-colors duration-300">{{ ctaSubtitle }}</p>
      </div>

      <div class="flex flex-col gap-6">
        <div class="contact-card rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8">
          <form class="space-y-4" @submit.prevent="submitContact">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="contact-field">
                <span>{{ $t('cta.form.name') }} *</span>
                <input v-model="form.name" type="text" name="name" autocomplete="name" required minlength="2" maxlength="100" :placeholder="$t('cta.form.name_placeholder')">
              </label>
              <label class="contact-field">
                <span>{{ $t('cta.form.email') }} *</span>
                <input v-model="form.email" type="email" name="email" autocomplete="email" required maxlength="160" placeholder="vous@entreprise.fr">
              </label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="contact-field">
                <span>{{ $t('cta.form.phone') }}</span>
                <input v-model="form.phone" type="tel" name="phone" autocomplete="tel" maxlength="40" placeholder="+33 6 00 00 00 00">
              </label>
              <label class="contact-field">
                <span>{{ $t('cta.form.company') }}</span>
                <input v-model="form.company" type="text" name="company" autocomplete="organization" maxlength="120" :placeholder="$t('cta.form.company_placeholder')">
              </label>
            </div>

            <label class="contact-field">
              <span>{{ $t('cta.form.project_type') }}</span>
              <select v-model="form.projectType" name="projectType">
                <option value="">{{ $t('cta.form.project_placeholder') }}</option>
                <option value="Branding">Branding</option>
                <option value="Website">Website</option>
                <option value="Design produit">{{ $t('cta.form.project_options.product_design') }}</option>
                <option value="MVP / SaaS">MVP / SaaS</option>
                <option :value="$t('cta.form.project_options.other')">{{ $t('cta.form.project_options.other') }}</option>
              </select>
            </label>

            <label class="contact-field">
              <span>{{ $t('cta.form.message') }} *</span>
              <textarea v-model="form.message" name="message" required minlength="20" maxlength="4000" rows="6" :placeholder="$t('cta.form.message_placeholder')"></textarea>
            </label>

            <label class="sr-only" aria-hidden="true">
              Website
              <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
            </label>

            <button ref="submitButton" class="cta-primary contact-submit group" type="submit" :disabled="isSubmitting">
              <span class="text-slide-container h-5">
                <span ref="submitTextWrapper" class="text-slide-wrapper">
                  <span class="text-slide-text h-5 leading-5">{{ isSubmitting ? $t('cta.form.sending') : $t('cta.form.submit') }}</span>
                  <span class="text-slide-text h-5 leading-5">{{ isSubmitting ? $t('cta.form.sending') : $t('cta.form.submit') }}</span>
                </span>
              </span>
              <UIcon name="i-lucide-arrow-up-right" class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </button>

            <p class="font-inter text-xs text-[var(--text-muted)] leading-relaxed">
              {{ $t('cta.form.privacy') }}
            </p>

            <p v-if="formStatus === 'success'" class="form-feedback form-feedback--success" role="status" aria-live="polite">
              {{ $t('cta.form.success') }}
            </p>
            <p v-else-if="formStatus === 'error'" class="form-feedback form-feedback--error" role="alert">
              {{ $t('cta.form.error') }}
            </p>
          </form>
        </div>

        <div class="mb-16 sm:mb-24">
          <iframe
            class="block w-full min-h-[700px] border-0"
            src="https://cal.com/mc-studio/discutons-de-votre-projet?embed=true&theme=dark"
            loading="lazy"
            :title="$t('cta.calendar.iframe_title')"
          ></iframe>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-card {
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.16);
}

.contact-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: Inter, sans-serif;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
}

.contact-field input,
.contact-field select,
.contact-field textarea {
  width: 100%;
  border: 1px solid var(--border-subtle);
  border-radius: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: Inter, sans-serif;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.contact-field input,
.contact-field select {
  min-height: 3rem;
  padding: 0 0.875rem;
}

.contact-field textarea {
  min-height: 9.5rem;
  padding: 0.875rem;
  resize: vertical;
}

.contact-field input::placeholder,
.contact-field textarea::placeholder {
  color: var(--text-muted);
}

.contact-field input:focus,
.contact-field select:focus,
.contact-field textarea:focus {
  border-color: rgba(240, 191, 108, 0.75);
  box-shadow: 0 0 0 3px rgba(240, 191, 108, 0.12);
}

.contact-submit {
  display: flex;
  min-height: 2.75rem;
  width: fit-content;
  margin-left: auto;
  padding: 0.625rem 1.25rem;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  border: 0;
  border-radius: 0.75rem;
  color: #0f0f0f;
  font-family: Inter, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 180ms ease, opacity 180ms ease;
}

.contact-submit:hover:not(:disabled) {
  filter: brightness(1.04);
}

.contact-submit:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
}

.contact-submit:disabled {
  cursor: wait;
  opacity: 0.65;
}

.text-slide-container {
  display: block;
  position: relative;
  overflow: hidden;
}

.text-slide-wrapper {
  display: flex;
  flex-direction: column;
}

.text-slide-text {
  display: block;
  white-space: nowrap;
}

.form-feedback {
  border-radius: 0.75rem;
  padding: 0.75rem 0.875rem;
  font-family: Inter, sans-serif;
  font-size: 0.8rem;
  line-height: 1.5;
}

.form-feedback--success {
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.form-feedback--error {
  border: 1px solid rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.08);
  color: #fca5a5;
}

</style>
