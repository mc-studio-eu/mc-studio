<script setup lang="ts">
import type { PortalStorageStatus } from '#shared/portal-storage'
import { PORTAL_ASSET_QUOTA_BYTES, PORTAL_FILE_QUOTA_BYTES } from '#shared/portal-upload'

const snapshot = ref<PortalStorageStatus>()
const loading = ref(false)
const error = ref('')
const count = new Intl.NumberFormat('fr-FR')
const amount = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })
const timestamp = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' })
const operationLabels = {
  upload: 'Liens de dépôt (PUT)',
  head: 'Vérifications de dépôt (HEAD)',
  copy: 'Tentatives de copie',
  download: 'Liens de téléchargement (GET)'
}
const storageLabels = {
  r2Files: 'Fichiers référencés sur R2',
  r2Assets: 'Images référencées sur R2',
  databaseFiles: 'Fichiers en base',
  databaseAssets: 'Images en base'
}
const inventoryRows = computed(() => {
  const inventory = snapshot.value?.inventory
  if (!inventory) return []
  return (Object.keys(storageLabels) as (keyof typeof storageLabels)[]).map(key => ({
    label: storageLabels[key],
    ...inventory[key]
  }))
})
const hasInventory = computed(() => inventoryRows.value.some(row => row.count > 0))
const remainingBytes = computed(() => {
  const budget = snapshot.value?.budget
  if (!budget || budget.reservedBytes === null || budget.limitBytes === null) return null
  return Math.max(0, budget.limitBytes - budget.reservedBytes)
})

function bytes(value: number) {
  const units = ['o', 'Kio', 'Mio', 'Gio', 'Tio']
  let unit = 0
  while (Math.abs(value) >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${amount.format(value)} ${units[unit]}`
}

async function refresh() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    snapshot.value = await $fetch<PortalStorageStatus>('/api/portal/admin/storage')
  } catch {
    error.value = snapshot.value
      ? 'Actualisation impossible. Les dernières données chargées restent affichées.'
      : 'Le rapport de stockage est indisponible. Réessayez avec le bouton Actualiser.'
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>

<template>
  <section class="storage" aria-labelledby="admin-storage-title">
    <div class="storage-heading">
      <div>
        <h1 id="admin-storage-title">Stockage</h1>
        <p>Suivez les fichiers du portail et les limites appliquées aux dépôts.</p>
      </div>
      <button type="button" :disabled="loading" @click="refresh">
        <UIcon name="i-tabler-refresh" aria-hidden="true" />
        {{ loading ? 'Actualisation…' : 'Actualiser' }}
      </button>
    </div>

    <p v-if="error" class="storage-message storage-error" role="alert">{{ error }}</p>
    <p v-if="loading && !snapshot" class="storage-message" role="status">Chargement du stockage…</p>
    <template v-if="snapshot">
      <p class="storage-updated" role="status">
        Données relevées le <time :datetime="snapshot.updatedAt">{{ timestamp.format(new Date(snapshot.updatedAt)) }} UTC</time>
      </p>
      <p class="storage-message">
        <UIcon name="i-tabler-info-circle" aria-hidden="true" />
        Les chiffres proviennent de la base du portail. Pour connaître l’espace réellement occupé dans le bucket et les opérations facturées sur le compte, consultez Cloudflare.
      </p>

      <div class="storage-summary">
        <section class="storage-card" aria-labelledby="storage-budget-title">
          <h2 id="storage-budget-title">Budget de réservation R2</h2>
          <p class="storage-badge" :class="{ 'storage-enabled': snapshot.r2Configured && snapshot.r2UploadsRequested }">
            {{ snapshot.r2UploadsRequested ? (snapshot.r2Configured ? 'Dépôts R2 activés' : 'Configuration R2 incomplète') : 'Dépôts R2 désactivés' }}
          </p>
          <dl class="storage-metrics">
            <div>
              <dt>Réservations cumulées</dt>
              <dd>{{ snapshot.budget.reservedBytes === null ? 'Compteur non initialisé' : bytes(snapshot.budget.reservedBytes) }}</dd>
            </div>
            <div>
              <dt>Plafond global</dt>
              <dd>{{ snapshot.budget.limitBytes === null ? 'Configuration invalide' : bytes(snapshot.budget.limitBytes) }}</dd>
            </div>
            <div v-if="remainingBytes !== null">
              <dt>Budget restant</dt>
              <dd>{{ bytes(remainingBytes) }}</dd>
            </div>
          </dl>
          <progress
            v-if="snapshot.budget.reservedBytes !== null && snapshot.budget.limitBytes !== null && snapshot.budget.limitBytes > 0"
            aria-label="Budget global de réservation utilisé"
            :value="Math.min(snapshot.budget.reservedBytes, snapshot.budget.limitBytes)"
            :max="snapshot.budget.limitBytes"
          />
          <p class="storage-note">Le compteur couvre les réservations pour les dépôts temporaires et les copies. Les suppressions ne libèrent pas ce budget, qui se cumule sans remise à zéro mensuelle.</p>
        </section>

        <section class="storage-card" aria-labelledby="storage-operations-title">
          <h2 id="storage-operations-title">Opérations quotidiennes R2</h2>
          <p class="storage-note"><time :datetime="snapshot.utcDay">{{ snapshot.utcDay }}</time> UTC · Remise à zéro à minuit UTC.</p>
          <dl class="storage-metrics">
            <div v-for="item in snapshot.budget.operations" :key="item.operation">
              <dt>{{ operationLabels[item.operation] }}</dt>
              <dd>{{ count.format(item.used) }} / {{ item.limit === null ? 'configuration invalide' : count.format(item.limit) }}</dd>
            </div>
          </dl>
          <p class="storage-note">Les liens signés sont comptés à leur création. Le portail ne voit pas leurs accès directs ultérieurs.</p>
        </section>
      </div>

      <section class="storage-card" aria-labelledby="storage-inventory-title">
        <h2 id="storage-inventory-title">Fichiers enregistrés</h2>
        <p class="storage-note">Tailles des fichiers enregistrées en base, archives comprises. Les volumes excluent les transferts temporaires et les objets orphelins.</p>
        <div v-if="hasInventory" class="storage-table">
          <table aria-labelledby="storage-inventory-title">
            <thead>
              <tr>
                <th scope="col">Catégorie</th>
                <th scope="col">Nombre</th>
                <th scope="col">Volume connu</th>
                <th scope="col">Taille inconnue</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in inventoryRows" :key="row.label">
                <th scope="row">{{ row.label }}</th>
                <td>{{ count.format(row.count) }}</td>
                <td>{{ row.count && row.unknownSizeCount === row.count ? '—' : bytes(row.knownBytes) }}</td>
                <td>{{ count.format(row.unknownSizeCount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="storage-note">Aucun fichier ni image enregistré dans le portail.</p>
        <p class="storage-note">
          Objets R2 orphelins suivis en base (sans fichier ni image associé) <strong>{{ count.format(snapshot.inventory.orphanObjects) }}</strong>.
          Leur taille est inconnue.
        </p>
      </section>

      <section class="storage-card" aria-labelledby="storage-projects-title">
        <h2 id="storage-projects-title">Quotas par projet</h2>
        <p class="storage-note">Les transferts en cours sont inclus dans l’occupation du quota tant que leur réservation est valide.</p>
        <div v-if="snapshot.projects.length" class="storage-table">
          <table aria-labelledby="storage-projects-title">
            <thead>
              <tr>
                <th scope="col">Projet</th>
                <th scope="col">Fichiers</th>
                <th scope="col">Médiathèque</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in snapshot.projects" :key="project.id">
                <th scope="row">{{ project.name }}<small>{{ project.organization }}</small></th>
                <td>
                  {{ bytes(project.fileBytes + project.pendingFileBytes) }} / {{ bytes(PORTAL_FILE_QUOTA_BYTES) }}
                  <small v-if="project.pendingFileBytes">dont {{ bytes(project.pendingFileBytes) }} en cours</small>
                </td>
                <td>
                  {{ bytes(project.assetBytes + project.pendingAssetBytes) }} / {{ bytes(PORTAL_ASSET_QUOTA_BYTES) }}
                  <small v-if="project.pendingAssetBytes">dont {{ bytes(project.pendingAssetBytes) }} en cours</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="storage-note">Aucun quota projet utilisé.</p>
      </section>
    </template>
  </section>
</template>

<style scoped>
.storage { display: grid; gap: 18px; font-size: 13px; }
.storage-heading, .storage-metrics div { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.storage-heading h1 { margin: 0 0 6px; font-size: 25px; line-height: 1.25; }
.storage-heading p, .storage-updated, .storage-note { margin: 0; color: var(--portal-muted); line-height: 1.6; }
.storage-heading button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: none;
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid var(--portal-line);
  border-radius: var(--portal-radius);
  background: var(--portal-control);
  color: var(--portal-text);
}
.storage-heading button:hover { background: var(--portal-hover); }
.storage-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  padding: 12px 16px;
  border-radius: var(--portal-radius);
  background: var(--portal-info-soft);
  color: var(--portal-info);
  line-height: 1.6;
}
.storage-message .iconify { flex: none; margin-top: 3px; }
.storage-error { background: var(--portal-danger-soft); color: var(--portal-danger); }
.storage-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.storage-card {
  display: grid;
  align-content: start;
  gap: 12px;
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--portal-line);
  border-radius: var(--portal-radius);
  background: var(--portal-surface);
}
.storage-card h2 { margin: 0; font-size: 17px; line-height: 1.35; }
.storage-badge {
  justify-self: start;
  margin: 0;
  padding: 4px 8px;
  border-radius: var(--portal-radius);
  background: var(--portal-warning-soft);
  color: var(--portal-warning);
  font-size: 12px;
}
.storage-enabled { background: var(--portal-success-soft); color: var(--portal-success); }
.storage-metrics { display: grid; margin: 0; }
.storage-metrics div { padding: 8px 0; border-bottom: 1px solid var(--portal-line); }
.storage-metrics dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
.storage progress { width: 100%; height: 8px; accent-color: var(--portal-accent-deep); }
.storage-table { min-width: 0; overflow-x: auto; }
.storage-table table { width: 100%; text-align: left; border-collapse: collapse; }
.storage-table :is(th, td) { padding: 10px 12px 10px 0; vertical-align: top; border-bottom: 1px solid var(--portal-line); }
.storage-table :is(th, td):last-child { padding-right: 0; }
.storage-table thead th { font-size: 12px; color: var(--portal-muted); }
.storage-table tbody th { overflow-wrap: anywhere; font-weight: 500; }
.storage-table td { font-variant-numeric: tabular-nums; }
.storage-table small { display: block; margin-top: 3px; color: var(--portal-muted); }
@media (max-width: 980px) {
  .storage-summary { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 480px) {
  .storage-heading { flex-direction: column; gap: 12px; }
  .storage-card { padding: 14px; }
}
</style>
