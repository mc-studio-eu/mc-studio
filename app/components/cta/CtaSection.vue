<script setup lang="ts">
const { t } = useI18n();
const activeContactMethod = ref<'form' | 'calendar'>('calendar')
const hasOpenedCalendar = ref(true)

const selectContactMethod = (method: 'form' | 'calendar') => {
  activeContactMethod.value = method
  if (method === 'calendar') hasOpenedCalendar.value = true
}

const form = reactive({
  audience: '',
  name: '',
  email: '',
  phone: '',
  company: '',
  social: '',
  projectType: '',
  message: '',
  website: ''
})

const companyLabel = computed(() => form.audience === 'creator' ? t('cta.form.creator_name') : t('cta.form.company'))
const companyPlaceholder = computed(() => form.audience === 'creator' ? t('cta.form.creator_name_placeholder') : t('cta.form.company_placeholder'))
const messagePlaceholder = computed(() => form.audience === 'creator' ? t('cta.form.message_placeholder_creator') : t('cta.form.message_placeholder_business'))
const nameLabel = computed(() => form.audience === 'creator' ? t('cta.form.creator_name') : t('cta.form.name'))
const namePlaceholder = computed(() => form.audience === 'creator' ? t('cta.form.creator_name_placeholder') : t('cta.form.name_placeholder'))

watch(() => form.audience, (audience, previousAudience) => {
  if (previousAudience && audience !== previousAudience) {
    form.company = ''
    form.social = ''
    form.projectType = ''
  }
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
      audience: '',
      name: '',
      email: '',
      phone: '',
      company: '',
      social: '',
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
  <section
    id="contact"
    class="contact-section px-6 py-20 transition-colors duration-300"
    :class="{
      'contact-section--business': form.audience === 'business',
      'contact-section--creator': form.audience === 'creator'
    }"
  >
    <div class="contact-container mx-auto">
      <!-- Header -->
      <div class="text-center mb-10 md:mb-12">
        <h2 class="section-title font-manrope text-2xl sm:text-3xl md:text-[32px] font-semibold text-[var(--text-primary)] mb-4 transition-colors duration-300" v-html="$t('cta.title')"></h2>
      </div>

      <div class="contact-tabs" role="tablist" :aria-label="$t('cta.tabs.label')">
        <button
          id="contact-calendar-tab"
          type="button"
          role="tab"
          class="contact-tab"
          :class="{ 'contact-tab--active': activeContactMethod === 'calendar' }"
          :aria-selected="activeContactMethod === 'calendar'"
          aria-controls="contact-calendar-panel"
          @click="selectContactMethod('calendar')"
        >
          <UIcon name="i-lucide-calendar-days" class="h-4 w-4" aria-hidden="true" />
          <span>{{ $t('cta.tabs.calendar') }}</span>
        </button>
        <button
          id="contact-form-tab"
          type="button"
          role="tab"
          class="contact-tab"
          :class="{ 'contact-tab--active': activeContactMethod === 'form' }"
          :aria-selected="activeContactMethod === 'form'"
          aria-controls="contact-form-panel"
          @click="selectContactMethod('form')"
        >
          <UIcon name="i-lucide-send" class="h-4 w-4" aria-hidden="true" />
          <span>{{ $t('cta.tabs.form') }}</span>
        </button>
      </div>

      <div class="mb-16 sm:mb-24">
        <div
          v-show="activeContactMethod === 'form'"
          id="contact-form-panel"
          class="contact-card rounded-3xl border"
          role="tabpanel"
          aria-labelledby="contact-form-tab"
        >
          <form class="contact-form" @submit.prevent="submitContact">
            <fieldset class="contact-field contact-audience-field">
              <legend>{{ $t('cta.form.audience') }} *</legend>
              <div class="contact-audience-grid">
                <label class="contact-audience" :class="{ 'contact-audience--active': form.audience === 'business' }">
                  <input v-model="form.audience" type="radio" name="audience" value="business" required>
                  <span class="contact-audience__radio" aria-hidden="true" />
                  <span class="contact-audience__copy">
                    <strong>{{ $t('cta.form.audience_options.business') }}</strong>
                    <small>{{ $t('cta.form.audience_options.business_hint') }}</small>
                  </span>
                  <span class="contact-audience__arrow" aria-hidden="true">↗</span>
                </label>
                <label class="contact-audience" :class="{ 'contact-audience--active': form.audience === 'creator' }">
                  <input v-model="form.audience" type="radio" name="audience" value="creator" required>
                  <span class="contact-audience__radio" aria-hidden="true" />
                  <span class="contact-audience__copy">
                    <strong>{{ $t('cta.form.audience_options.creator') }}</strong>
                    <small>{{ $t('cta.form.audience_options.creator_hint') }}</small>
                  </span>
                  <span class="contact-audience__arrow" aria-hidden="true">↗</span>
                </label>
              </div>
            </fieldset>

            <div v-if="form.audience" class="contact-form-fields">
              <div class="contact-field-row">
                <label class="contact-field">
                  <span>{{ nameLabel }} *</span>
                  <input v-model="form.name" type="text" name="name" autocomplete="name" required minlength="2" maxlength="100" :placeholder="namePlaceholder">
                </label>
                <label class="contact-field">
                  <span>{{ $t('cta.form.email') }} *</span>
                  <input v-model="form.email" type="email" name="email" autocomplete="email" required maxlength="160" :placeholder="$t('cta.form.email_placeholder')">
                </label>
              </div>

              <div class="contact-field-row">
                <label class="contact-field">
                  <span>{{ $t('cta.form.phone') }}<template v-if="form.audience === 'creator'"> *</template></span>
                  <input v-model="form.phone" type="tel" name="phone" autocomplete="tel" maxlength="40" placeholder="+33 6 00 00 00 00" :required="form.audience === 'creator'">
                </label>
                <label v-if="form.audience === 'business'" class="contact-field">
                  <span>{{ companyLabel }} *</span>
                  <input v-model="form.company" type="text" name="company" autocomplete="organization" maxlength="120" required :placeholder="companyPlaceholder">
                </label>
                <label v-else class="contact-field">
                  <span>{{ $t('cta.form.social') }} *</span>
                  <input v-model="form.social" type="url" name="social" autocomplete="url" maxlength="300" required :placeholder="$t('cta.form.social_placeholder')">
                </label>
              </div>

              <label v-if="form.audience === 'business'" class="contact-field">
                <span>{{ $t('cta.form.project_type') }}</span>
                <select v-model="form.projectType" name="projectType">
                  <option value="">{{ $t('cta.form.project_placeholder') }}</option>
                  <option value="Branding">Branding</option>
                  <option value="Landing page">{{ $t('cta.form.project_options.landing_page') }}</option>
                  <option value="Site internet">{{ $t('cta.form.project_options.website') }}</option>
                  <option value="CRM">CRM</option>
                  <option value="Application web">{{ $t('cta.form.project_options.web_app') }}</option>
                  <option value="Application mobile">{{ $t('cta.form.project_options.mobile_app') }}</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Design produit">{{ $t('cta.form.project_options.product_design') }}</option>
                  <option :value="$t('cta.form.project_options.other')">{{ $t('cta.form.project_options.other') }}</option>
                </select>
              </label>

              <label class="contact-field">
                <span>{{ $t('cta.form.message') }} *</span>
                <textarea v-model="form.message" name="message" required minlength="20" maxlength="4000" rows="6" :placeholder="messagePlaceholder"></textarea>
              </label>
            </div>

            <label class="sr-only" aria-hidden="true">
              Website
              <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
            </label>

            <div class="contact-form-actions">
              <button class="contact-submit" type="submit" :disabled="isSubmitting">
                <span>{{ isSubmitting ? $t('cta.form.sending') : $t('cta.form.submit') }}</span>
                <span aria-hidden="true">→</span>
              </button>
              <p v-if="formStatus === 'success'" class="form-feedback form-feedback--success" role="status" aria-live="polite">
                {{ $t('cta.form.success') }}
              </p>
              <p v-else-if="formStatus === 'error'" class="form-feedback form-feedback--error" role="alert">
                {{ $t('cta.form.error') }}
              </p>
            </div>
          </form>
        </div>

        <div
          v-if="hasOpenedCalendar"
          v-show="activeContactMethod === 'calendar'"
          id="contact-calendar-panel"
          role="tabpanel"
          aria-labelledby="contact-calendar-tab"
        >
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
.contact-section {
  --contact-surface: #171717;
  --contact-field: #0f0f0f;
  --contact-label: rgba(255, 255, 255, 0.68);
  --contact-muted: #6f7b91;
  --contact-border: rgba(255, 255, 255, 0.12);
  --contact-accent: #f0bf6c;
  --contact-accent-soft: rgba(240, 191, 108, 0.1);
  background: #0f0f0f;
}

.contact-section--creator {
  --contact-surface: #ffffff;
  --contact-field: #ffffff;
  --contact-label: #1f1834;
  --contact-muted: #8d8998;
  --contact-border: rgba(31, 24, 52, 0.12);
  --contact-accent: #9568ed;
  --contact-accent-soft: rgba(149, 104, 237, 0.1);
}

.contact-container {
  width: min(100%, 70rem);
}

.contact-card {
  padding: clamp(1.5rem, 3vw, 2.5rem);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.16);
  border-color: var(--contact-border) !important;
  background: var(--contact-surface) !important;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.contact-form-fields {
  display: grid;
  gap: 1.25rem;
}

.contact-field-row,
.contact-audience-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.contact-field-row {
  gap: 1.25rem;
}

.contact-audience-grid {
  gap: 1rem;
}

.contact-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: fit-content;
  margin: 0 auto 1.5rem;
  padding: 0.25rem;
  border: 1px solid var(--border-subtle);
  border-radius: 0.875rem;
  background: var(--bg-secondary);
}

.contact-tab {
  display: inline-flex;
  min-height: 2.625rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  border: 0;
  border-radius: 0.675rem;
  background: transparent;
  color: var(--text-secondary);
  font-family: Inter, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.contact-tab:hover:not(.contact-tab--active) {
  color: var(--text-primary);
}

.contact-tab--active {
  background: linear-gradient(270deg, var(--contact-accent) 0%, #fff 72%);
  color: #0f0f0f;
  box-shadow: 0 6px 18px var(--contact-accent-soft);
}

.contact-tab:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

.contact-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: Inter, sans-serif;
  color: var(--contact-label);
  font-size: 0.75rem;
  font-weight: 500;
}

.contact-field input,
.contact-field select,
.contact-field textarea {
  width: 100%;
  border: 1px solid var(--contact-border);
  border-radius: 0.875rem;
  background: var(--contact-field);
  color: var(--contact-label);
  font-family: Inter, sans-serif;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.contact-audience-field {
  border: 0;
  margin: 0;
  padding: 0;
}

.contact-audience-field legend {
  margin-bottom: 0.75rem;
}

.contact-audience {
  position: relative;
  display: flex;
  min-height: 7rem;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--contact-border);
  border-radius: 0.875rem;
  background: var(--contact-field);
  color: var(--contact-label);
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
}

.contact-audience input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  opacity: 0;
}

.contact-audience--active {
  border-color: var(--contact-accent);
  background: var(--contact-accent-soft);
  color: var(--contact-label);
  box-shadow: 0 0 0 3px var(--contact-accent-soft);
}

.contact-audience__radio {
  display: grid;
  width: 1.15rem;
  height: 1.15rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 50%;
  opacity: 0.55;
}

.contact-audience--active .contact-audience__radio {
  border-color: var(--contact-accent);
  opacity: 1;
}

.contact-audience--active .contact-audience__radio::after {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--contact-accent);
  content: '';
}

.contact-audience__copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.contact-audience__copy strong {
  font-size: 0.875rem;
}

.contact-audience__copy small {
  color: var(--contact-muted);
  font-size: 0.75rem;
  line-height: 1.4;
}

.contact-audience__arrow {
  margin-left: auto;
  align-self: flex-start;
  color: var(--contact-accent);
  font-size: 1.2rem;
}

.contact-field input,
.contact-field select {
  min-height: 3.25rem;
  padding: 0 1rem;
}

.contact-field textarea {
  min-height: 9.5rem;
  padding: 1rem;
  resize: vertical;
}

.contact-field input::placeholder,
.contact-field textarea::placeholder {
  color: var(--contact-muted);
}

.contact-field input:focus,
.contact-field select:focus,
.contact-field textarea:focus {
  border-color: var(--contact-accent);
  box-shadow: 0 0 0 3px var(--contact-accent-soft);
}

.contact-submit {
  display: flex;
  min-height: 3.125rem;
  width: fit-content;
  min-width: 13.5rem;
  padding: 0 1.5rem;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: 0;
  border-radius: 0.875rem;
  background: linear-gradient(270deg, var(--contact-accent) 0%, #fff 72%);
  color: #0f0f0f;
  font-family: Inter, sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 180ms ease, filter 180ms ease, opacity 180ms ease;
}

.contact-form-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.contact-form-actions .form-feedback {
  order: -1;
  flex: 1 1 20rem;
}

.contact-section--creator .contact-submit {
  background: var(--contact-accent);
  color: #fff;
}

.contact-submit:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-1px);
}

.contact-submit:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
}

.contact-submit:disabled {
  cursor: wait;
  opacity: 0.65;
}

.form-feedback {
  border-radius: 0.75rem;
  padding: 0.75rem 0.875rem;
  font-family: Inter, sans-serif;
  font-size: 0.8rem;
  line-height: 1.5;
}

@media (max-width: 639px) {
  .contact-form {
    gap: 1.5rem;
  }

  .contact-form-fields {
    gap: 1rem;
  }

  .contact-field-row,
  .contact-audience-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }

  .contact-tabs {
    width: 100%;
  }

  .contact-tab {
    padding-inline: 0.75rem;
    font-size: 0.8rem;
  }

  .contact-submit {
    width: 100%;
  }
}

</style>
