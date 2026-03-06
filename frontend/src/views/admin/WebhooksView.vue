<template>
  <DefaultLayout>
    <div class="webhooks">
      <div class="webhooks__header">
        <div class="webhooks__header-left">
          <h2 class="webhooks__title">{{ t('admin.webhooks.title') }}</h2>
          <p class="webhooks__subtitle">{{ t('admin.webhooks.subtitle') }}</p>
        </div>
        <button
          class="webhooks__create-btn"
          @click="openCreateModal"
        >
          {{ t('admin.webhooks.create') }}
        </button>
      </div>

      <div
        v-if="loading"
        class="webhooks__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!webhooks.length"
        class="webhooks__empty"
      >
        {{ t('admin.webhooks.empty') }}
      </div>

      <table
        v-else
        class="webhooks__table"
      >
        <thead class="webhooks__table-head">
          <tr>
            <th class="webhooks__th">{{ t('admin.webhooks.table.url') }}</th>
            <th class="webhooks__th">{{ t('admin.webhooks.table.events') }}</th>
            <th class="webhooks__th">{{ t('admin.webhooks.table.active') }}</th>
            <th class="webhooks__th">{{ t('admin.webhooks.table.lastStatus') }}</th>
            <th class="webhooks__th">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="webhooks__table-body">
          <tr
            v-for="webhook in webhooks"
            :key="webhook.id"
            class="webhooks__row"
          >
            <td class="webhooks__td">
              <span class="webhooks__url">{{ webhook.url }}</span>
            </td>
            <td class="webhooks__td">
              <div class="webhooks__events">
                <span
                  v-for="event in (webhook.events || [])"
                  :key="event"
                  class="webhooks__event-badge"
                >
                  {{ event }}
                </span>
                <span
                  v-if="!webhook.events?.length"
                  class="webhooks__no-events"
                >
                  -
                </span>
              </div>
            </td>
            <td class="webhooks__td">
              <label class="webhooks__toggle-label">
                <input
                  type="checkbox"
                  class="webhooks__toggle"
                  :checked="webhook.active"
                  @change="toggleActive(webhook)"
                />
                <span class="webhooks__toggle-text">
                  {{ webhook.active ? t('common.active') : t('common.inactive') }}
                </span>
              </label>
            </td>
            <td class="webhooks__td">
              <span
                v-if="webhook.last_status"
                :class="['webhooks__status-badge', getStatusClass(webhook.last_status)]"
              >
                {{ webhook.last_status }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="webhooks__td">
              <div class="webhooks__actions-cell">
                <button
                  class="webhooks__action-btn"
                  @click="openEditModal(webhook)"
                >
                  {{ t('common.edit') }}
                </button>
                <button
                  class="webhooks__action-btn webhooks__action-btn--secondary"
                  :disabled="testingId === webhook.id"
                  @click="testWebhook(webhook)"
                >
                  {{ testingId === webhook.id ? t('admin.webhooks.testing') : t('admin.webhooks.test') }}
                </button>
                <button
                  class="webhooks__action-btn webhooks__action-btn--danger"
                  @click="confirmDelete(webhook)"
                >
                  {{ t('common.delete') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="totalPages > 1"
        class="webhooks__pagination"
      >
        <button
          class="webhooks__page-btn"
          :disabled="!hasPrev"
          @click="prevPage"
        >
          {{ t('common.previous') }}
        </button>
        <span class="webhooks__page-info">
          {{ t('common.page') }} {{ page }} {{ t('common.of') }} {{ totalPages }}
        </span>
        <button
          class="webhooks__page-btn"
          :disabled="!hasNext"
          @click="nextPage"
        >
          {{ t('common.next') }}
        </button>
      </div>

      <!-- Create/Edit Modal -->
      <div
        v-if="showModal"
        class="webhooks__modal-overlay"
        @click.self="closeModal"
      >
        <div class="webhooks__modal">
          <div class="webhooks__modal-header">
            <h3 class="webhooks__modal-title">
              {{ editingWebhook ? t('admin.webhooks.editWebhook') : t('admin.webhooks.createWebhook') }}
            </h3>
            <button
              class="webhooks__modal-close"
              @click="closeModal"
            >
              &times;
            </button>
          </div>
          <form
            class="webhooks__modal-form"
            @submit.prevent="handleSubmit"
          >
            <div class="webhooks__form-group">
              <label class="webhooks__form-label">{{ t('admin.webhooks.form.url') }}</label>
              <input
                v-model="form.url"
                type="url"
                class="webhooks__form-input"
                placeholder="https://"
                required
              />
            </div>
            <div class="webhooks__form-group">
              <label class="webhooks__form-label">{{ t('admin.webhooks.form.events') }}</label>
              <div class="webhooks__events-grid">
                <label
                  v-for="event in availableEvents"
                  :key="event"
                  class="webhooks__event-option"
                >
                  <input
                    v-model="form.events"
                    type="checkbox"
                    :value="event"
                    class="webhooks__event-checkbox"
                  />
                  <span>{{ event }}</span>
                </label>
              </div>
            </div>
            <div class="webhooks__form-group">
              <label class="webhooks__form-checkbox-label">
                <input
                  v-model="form.active"
                  type="checkbox"
                  class="webhooks__form-checkbox"
                />
                {{ t('common.active') }}
              </label>
            </div>
            <div class="webhooks__modal-actions">
              <button
                type="button"
                class="webhooks__modal-btn webhooks__modal-btn--cancel"
                @click="closeModal"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="webhooks__modal-btn webhooks__modal-btn--submit"
                :disabled="submitting"
              >
                {{ editingWebhook ? t('common.save') : t('common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div
        v-if="showDeleteConfirm"
        class="webhooks__modal-overlay"
        @click.self="cancelDelete"
      >
        <div class="webhooks__modal webhooks__modal--sm">
          <div class="webhooks__modal-header">
            <h3 class="webhooks__modal-title">{{ t('common.confirm.title') }}</h3>
            <button
              class="webhooks__modal-close"
              @click="cancelDelete"
            >
              &times;
            </button>
          </div>
          <div class="webhooks__modal-form">
            <p class="webhooks__confirm-text">{{ t('admin.webhooks.messages.deleteConfirm') }}</p>
            <div class="webhooks__modal-actions">
              <button
                type="button"
                class="webhooks__modal-btn webhooks__modal-btn--cancel"
                @click="cancelDelete"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="button"
                class="webhooks__modal-btn webhooks__modal-btn--danger"
                :disabled="submitting"
                @click="handleDelete"
              >
                {{ t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { adminWebhooksService } from '@/services/admin/webhooks'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const testingId = ref(null)
const webhooks = ref([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingWebhook = ref(null)
const deletingWebhook = ref(null)

const availableEvents = [
  'request.created',
  'request.submitted',
  'request.approved',
  'request.rejected',
  'request.paid',
  'payment.completed',
  'payment.failed',
  'user.created',
  'user.updated'
]

const form = reactive({
  url: '',
  events: [],
  active: true
})

async function fetchWebhooks(params = {}) {
  loading.value = true
  try {
    const data = await adminWebhooksService.list(params)
    webhooks.value = data.items || data || []
    if (data.meta?.total) {
      setTotal(data.meta.total)
    }
  } catch {
    toast.error(t('admin.webhooks.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

const {
  page,
  totalPages,
  hasNext,
  hasPrev,
  nextPage,
  prevPage,
  setTotal
} = usePagination(fetchWebhooks)

function getStatusClass(status) {
  if (status >= 200 && status < 300) return 'webhooks__status-badge--success'
  if (status >= 400) return 'webhooks__status-badge--error'
  return 'webhooks__status-badge--warning'
}

function openCreateModal() {
  editingWebhook.value = null
  form.url = ''
  form.events = []
  form.active = true
  showModal.value = true
}

function openEditModal(webhook) {
  editingWebhook.value = webhook
  form.url = webhook.url
  form.events = [...(webhook.events || [])]
  form.active = webhook.active !== false
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingWebhook.value = null
}

function confirmDelete(webhook) {
  deletingWebhook.value = webhook
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  deletingWebhook.value = null
}

async function handleSubmit() {
  submitting.value = true
  try {
    const payload = {
      url: form.url,
      events: form.events,
      active: form.active
    }

    if (editingWebhook.value) {
      await adminWebhooksService.update(editingWebhook.value.id, payload)
      toast.success(t('admin.webhooks.messages.updated'))
    } else {
      await adminWebhooksService.create(payload)
      toast.success(t('admin.webhooks.messages.created'))
    }
    closeModal()
    await fetchWebhooks()
  } catch {
    toast.error(t('admin.webhooks.messages.saveError'))
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!deletingWebhook.value) return
  submitting.value = true
  try {
    await adminWebhooksService.remove(deletingWebhook.value.id)
    toast.success(t('admin.webhooks.messages.deleted'))
    cancelDelete()
    await fetchWebhooks()
  } catch {
    toast.error(t('admin.webhooks.messages.deleteError'))
  } finally {
    submitting.value = false
  }
}

async function toggleActive(webhook) {
  try {
    await adminWebhooksService.update(webhook.id, { active: !webhook.active })
    webhook.active = !webhook.active
    toast.success(t('admin.webhooks.messages.toggled'))
  } catch {
    toast.error(t('admin.webhooks.messages.toggleError'))
  }
}

async function testWebhook(webhook) {
  testingId.value = webhook.id
  try {
    await adminWebhooksService.test(webhook.id)
    toast.success(t('admin.webhooks.messages.testSuccess'))
    await fetchWebhooks()
  } catch {
    toast.error(t('admin.webhooks.messages.testFailed'))
  } finally {
    testingId.value = null
  }
}

onMounted(() => {
  fetchWebhooks()
})
</script>

<style lang="scss" scoped>
.webhooks {
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

  &__table {
    width: 100%;
    border-collapse: collapse;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  &__table-head {
    background: $gray-50;
  }

  &__th {
    padding: $spacing-md $spacing-lg;
    text-align: left;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-600;
    border-bottom: 1px solid $gray-200;
  }

  &__row {
    &:not(:last-child) {
      border-bottom: 1px solid $gray-100;
    }

    &:hover {
      background: $gray-50;
    }
  }

  &__td {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-sm;
    color: $gray-700;
  }

  &__url {
    font-family: monospace;
    font-size: $font-size-xs;
    color: $gray-600;
    word-break: break-all;
  }

  &__events {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__event-badge {
    display: inline-block;
    padding: 2px $spacing-xs;
    border-radius: $radius-sm;
    font-size: 10px;
    font-weight: 500;
    background: rgba($primary, 0.1);
    color: $primary;
  }

  &__no-events {
    color: $gray-400;
  }

  &__toggle-label {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    cursor: pointer;
  }

  &__toggle {
    width: 1rem;
    height: 1rem;
    accent-color: $primary;
  }

  &__toggle-text {
    font-size: $font-size-xs;
  }

  &__status-badge {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;

    &--success {
      background: rgba($success, 0.1);
      color: $success;
    }

    &--error {
      background: rgba($danger, 0.1);
      color: $danger;
    }

    &--warning {
      background: rgba($warning, 0.1);
      color: $warning;
    }
  }

  &__actions-cell {
    display: flex;
    gap: $spacing-xs;
  }

  &__action-btn {
    padding: $spacing-xs $spacing-sm;
    border: 1px solid $gray-300;
    border-radius: $radius-sm;
    background: $white;
    color: $gray-600;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: $primary;
      color: $primary;
    }

    &--secondary {
      &:hover {
        border-color: $gray-500;
        color: $gray-700;
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

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    margin-top: $spacing-lg;
  }

  &__page-btn {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    background: $white;
    color: $gray-700;
    font-size: $font-size-sm;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: $gray-50;
      border-color: $primary;
      color: $primary;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__page-info {
    font-size: $font-size-sm;
    color: $gray-600;
  }

  &__confirm-text {
    font-size: $font-size-sm;
    color: $gray-700;
    margin-bottom: $spacing-lg;
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

    &--sm {
      max-width: 24rem;
    }
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

  &__form-input {
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

  &__events-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-xs;
  }

  &__event-option {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-xs;
    color: $gray-700;
    cursor: pointer;
    padding: $spacing-xs;
    border-radius: $radius-sm;

    &:hover {
      background: $gray-50;
    }
  }

  &__event-checkbox {
    width: 0.875rem;
    height: 0.875rem;
    accent-color: $primary;
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

    &--danger {
      background: $danger;
      color: $white;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
