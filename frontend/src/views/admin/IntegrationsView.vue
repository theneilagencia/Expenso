<template>
  <DefaultLayout>
    <div class="integrations">
      <div class="integrations__header">
        <div class="integrations__header-left">
          <h2 class="integrations__title">{{ t('admin.integrations.title') }}</h2>
          <p class="integrations__subtitle">{{ t('admin.integrations.subtitle') }}</p>
        </div>
        <button
          class="integrations__create-btn"
          @click="openCreateModal"
        >
          {{ t('admin.integrations.create') }}
        </button>
      </div>

      <div
        v-if="loading"
        class="integrations__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!integrations.length"
        class="integrations__empty"
      >
        {{ t('admin.integrations.empty') }}
      </div>

      <!-- Cards Layout -->
      <div
        v-else
        class="integrations__grid"
      >
        <div
          v-for="integration in integrations"
          :key="integration.id"
          class="integrations__card"
        >
          <div class="integrations__card-header">
            <div class="integrations__card-info">
              <div class="integrations__card-icon">
                {{ getIconLetter(integration.name) }}
              </div>
              <div>
                <h3 class="integrations__card-name">{{ integration.name }}</h3>
                <span class="integrations__card-type">{{ integration.type || integration.provider }}</span>
              </div>
            </div>
            <span :class="['integrations__card-status', integration.connected ? 'integrations__card-status--connected' : 'integrations__card-status--disconnected']">
              <span class="integrations__card-status-dot" />
              {{ integration.connected ? t('admin.integrations.connected') : t('admin.integrations.disconnected') }}
            </span>
          </div>

          <p
            v-if="integration.description"
            class="integrations__card-description"
          >
            {{ integration.description }}
          </p>

          <div
            v-if="integration.last_sync_at"
            class="integrations__card-sync"
          >
            <span class="integrations__card-sync-label">{{ t('admin.integrations.lastSync') }}</span>
            <span class="integrations__card-sync-value">{{ formatDate(integration.last_sync_at) }}</span>
          </div>

          <div class="integrations__card-actions">
            <button
              class="integrations__card-btn"
              @click="openConfigModal(integration)"
            >
              {{ t('admin.integrations.configure') }}
            </button>
            <button
              class="integrations__card-btn integrations__card-btn--test"
              :disabled="testing === integration.id"
              @click="testConnection(integration)"
            >
              {{ testing === integration.id ? t('admin.integrations.testing') : t('admin.integrations.testConnection') }}
            </button>
            <button
              class="integrations__card-btn integrations__card-btn--danger"
              @click="removeIntegration(integration)"
            >
              {{ t('common.remove') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Configure / Create Modal -->
      <div
        v-if="showModal"
        class="integrations__modal-overlay"
        @click.self="closeModal"
      >
        <div class="integrations__modal">
          <div class="integrations__modal-header">
            <h3 class="integrations__modal-title">
              {{ editingIntegration ? t('admin.integrations.configureIntegration') : t('admin.integrations.createIntegration') }}
            </h3>
            <button
              class="integrations__modal-close"
              @click="closeModal"
            >
              &times;
            </button>
          </div>
          <form
            class="integrations__modal-form"
            @submit.prevent="handleSubmit"
          >
            <div class="integrations__form-group">
              <label class="integrations__form-label">{{ t('admin.integrations.form.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="integrations__form-input"
                required
              />
            </div>
            <div class="integrations__form-group">
              <label class="integrations__form-label">{{ t('admin.integrations.form.provider') }}</label>
              <select
                v-model="form.provider"
                class="integrations__form-select"
                required
              >
                <option value="">{{ t('admin.integrations.form.selectProvider') }}</option>
                <option value="revolut">Revolut</option>
                <option value="stripe">Stripe</option>
                <option value="wise">Wise</option>
                <option value="bank_transfer">{{ t('admin.integrations.providers.bankTransfer') }}</option>
                <option value="other">{{ t('admin.integrations.providers.other') }}</option>
              </select>
            </div>
            <div class="integrations__form-group">
              <label class="integrations__form-label">{{ t('admin.integrations.form.description') }}</label>
              <textarea
                v-model="form.description"
                class="integrations__form-textarea"
                rows="2"
              />
            </div>
            <div class="integrations__form-group">
              <label class="integrations__form-label">{{ t('admin.integrations.form.apiKey') }}</label>
              <input
                v-model="form.api_key"
                type="password"
                class="integrations__form-input"
                :placeholder="editingIntegration ? t('admin.integrations.form.apiKeyUnchanged') : ''"
              />
            </div>
            <div class="integrations__form-group">
              <label class="integrations__form-label">{{ t('admin.integrations.form.webhookUrl') }}</label>
              <input
                v-model="form.webhook_url"
                type="url"
                class="integrations__form-input"
              />
            </div>
            <div class="integrations__form-group">
              <label class="integrations__form-checkbox-label">
                <input
                  v-model="form.active"
                  type="checkbox"
                  class="integrations__form-checkbox"
                />
                {{ t('admin.integrations.form.active') }}
              </label>
            </div>
            <div class="integrations__modal-actions">
              <button
                type="button"
                class="integrations__modal-btn integrations__modal-btn--cancel"
                @click="closeModal"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="integrations__modal-btn integrations__modal-btn--submit"
                :disabled="submitting"
              >
                {{ editingIntegration ? t('common.save') : t('common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { adminIntegrationsService } from '@/services/admin/integrations'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const testing = ref(null)
const integrations = ref([])
const showModal = ref(false)
const editingIntegration = ref(null)

const form = reactive({
  name: '',
  provider: '',
  description: '',
  api_key: '',
  webhook_url: '',
  active: true
})

async function fetchIntegrations() {
  loading.value = true
  try {
    const data = await adminIntegrationsService.list()
    integrations.value = data.items || data || []
  } catch {
    toast.error(t('admin.integrations.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

function getIconLetter(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}

function openCreateModal() {
  editingIntegration.value = null
  form.name = ''
  form.provider = ''
  form.description = ''
  form.api_key = ''
  form.webhook_url = ''
  form.active = true
  showModal.value = true
}

function openConfigModal(integration) {
  editingIntegration.value = integration
  form.name = integration.name
  form.provider = integration.provider || ''
  form.description = integration.description || ''
  form.api_key = ''
  form.webhook_url = integration.webhook_url || ''
  form.active = integration.active !== false
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingIntegration.value = null
}

async function handleSubmit() {
  submitting.value = true
  try {
    const payload = { ...form }
    if (editingIntegration.value && !payload.api_key) {
      delete payload.api_key
    }

    if (editingIntegration.value) {
      await adminIntegrationsService.update(editingIntegration.value.id, payload)
      toast.success(t('admin.integrations.messages.updated'))
    } else {
      await adminIntegrationsService.create(payload)
      toast.success(t('admin.integrations.messages.created'))
    }
    closeModal()
    await fetchIntegrations()
  } catch {
    toast.error(t('admin.integrations.messages.saveError'))
  } finally {
    submitting.value = false
  }
}

async function testConnection(integration) {
  testing.value = integration.id
  try {
    await adminIntegrationsService.test(integration.id)
    toast.success(t('admin.integrations.messages.testSuccess'))
  } catch {
    toast.error(t('admin.integrations.messages.testFailed'))
  } finally {
    testing.value = null
  }
}

async function removeIntegration(integration) {
  try {
    await adminIntegrationsService.remove(integration.id)
    toast.success(t('admin.integrations.messages.removed'))
    await fetchIntegrations()
  } catch {
    toast.error(t('admin.integrations.messages.removeError'))
  }
}

onMounted(() => {
  fetchIntegrations()
})
</script>

<style lang="scss" scoped>
.integrations {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $gray-900;
  }

  &__subtitle {
    color: $gray-500;
    margin-top: $spacing-xs;
  }

  &__create-btn {
    padding: $spacing-sm $spacing-lg;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: $primary-dark;
    }
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-lg;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    gap: $spacing-lg;
  }

  &__card {
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: $shadow-md;
    }
  }

  &__card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  &__card-info {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  &__card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: $radius-md;
    background: $primary-light;
    color: $primary;
    font-size: $font-size-lg;
    font-weight: 700;
  }

  &__card-name {
    font-size: $font-size-base;
    font-weight: 600;
    color: $gray-800;
  }

  &__card-type {
    font-size: $font-size-xs;
    color: $gray-500;
  }

  &__card-status {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-xs;
    font-weight: 500;

    &--connected {
      color: $success;
    }

    &--disconnected {
      color: $gray-400;
    }
  }

  &__card-status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: $radius-full;

    .integrations__card-status--connected & {
      background: $success;
    }

    .integrations__card-status--disconnected & {
      background: $gray-400;
    }
  }

  &__card-description {
    font-size: $font-size-sm;
    color: $gray-600;
    line-height: 1.5;
    margin: 0;
  }

  &__card-sync {
    display: flex;
    justify-content: space-between;
    padding-top: $spacing-sm;
    border-top: 1px solid $gray-100;
  }

  &__card-sync-label {
    font-size: $font-size-xs;
    color: $gray-500;
  }

  &__card-sync-value {
    font-size: $font-size-xs;
    color: $gray-600;
    font-weight: 500;
  }

  &__card-actions {
    display: flex;
    gap: $spacing-xs;
    padding-top: $spacing-sm;
    border-top: 1px solid $gray-100;
  }

  &__card-btn {
    flex: 1;
    padding: $spacing-sm;
    border: 1px solid $gray-300;
    border-radius: $radius-sm;
    background: $white;
    color: $gray-600;
    font-size: $font-size-xs;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: $primary;
      color: $primary;
    }

    &--test {
      &:hover:not(:disabled) {
        border-color: $info;
        color: $info;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &--danger {
      &:hover {
        border-color: $danger;
        color: $danger;
      }
    }
  }

  // Modal
  &__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba($gray-900, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: $z-modal;
  }

  &__modal {
    width: 100%;
    max-width: 32rem;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    overflow: hidden;
  }

  &__modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg;
    border-bottom: 1px solid $gray-200;
  }

  &__modal-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
  }

  &__modal-close {
    background: none;
    border: none;
    font-size: $font-size-2xl;
    color: $gray-400;
    cursor: pointer;
    line-height: 1;

    &:hover {
      color: $gray-600;
    }
  }

  &__modal-form {
    padding: $spacing-lg;
  }

  &__form-group {
    margin-bottom: $spacing-md;
  }

  &__form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-700;
    margin-bottom: $spacing-xs;
  }

  &__form-input,
  &__form-select,
  &__form-textarea {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }
  }

  &__form-textarea {
    resize: vertical;
  }

  &__form-checkbox-label {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-sm;
    color: $gray-700;
    cursor: pointer;
  }

  &__form-checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: $primary;
  }

  &__modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
    padding-top: $spacing-md;
    border-top: 1px solid $gray-100;
    margin-top: $spacing-lg;
  }

  &__modal-btn {
    padding: $spacing-sm $spacing-lg;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &--cancel {
      background: $white;
      color: $gray-600;
      border: 1px solid $gray-300;

      &:hover {
        background: $gray-50;
      }
    }

    &--submit {
      background: $primary;
      color: $white;

      &:hover:not(:disabled) {
        background: $primary-dark;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
