<template>
  <DefaultLayout>
    <div class="vendors">
      <div class="vendors__header">
        <div class="vendors__header-left">
          <h2 class="vendors__title">{{ t('admin.vendors.title') }}</h2>
          <p class="vendors__subtitle">{{ t('admin.vendors.subtitle') }}</p>
        </div>
        <button
          class="vendors__create-btn"
          @click="openCreateModal"
        >
          {{ t('admin.vendors.create') }}
        </button>
      </div>

      <!-- Filter -->
      <div class="vendors__filters">
        <div class="vendors__filter-group">
          <select
            v-model="filterListType"
            class="vendors__filter-select"
            @change="handleFilter"
          >
            <option value="">{{ t('admin.vendors.allTypes') }}</option>
            <option value="WHITELIST">{{ t('admin.vendors.listTypes.WHITELIST') }}</option>
            <option value="BLACKLIST">{{ t('admin.vendors.listTypes.BLACKLIST') }}</option>
          </select>
        </div>
      </div>

      <div
        v-if="loading"
        class="vendors__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!vendors.length"
        class="vendors__empty"
      >
        {{ t('admin.vendors.empty') }}
      </div>

      <table
        v-else
        class="vendors__table"
      >
        <thead class="vendors__table-head">
          <tr>
            <th class="vendors__th">{{ t('admin.vendors.table.name') }}</th>
            <th class="vendors__th">{{ t('admin.vendors.table.document') }}</th>
            <th class="vendors__th">{{ t('admin.vendors.table.listType') }}</th>
            <th class="vendors__th">{{ t('admin.vendors.table.category') }}</th>
            <th class="vendors__th">{{ t('admin.vendors.table.reason') }}</th>
            <th class="vendors__th">{{ t('admin.vendors.table.validFrom') }}</th>
            <th class="vendors__th">{{ t('admin.vendors.table.validUntil') }}</th>
            <th class="vendors__th">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="vendors__table-body">
          <tr
            v-for="vendor in vendors"
            :key="vendor.id"
            class="vendors__row"
          >
            <td class="vendors__td">
              <span class="vendors__name">{{ vendor.name }}</span>
            </td>
            <td class="vendors__td">{{ vendor.document || '-' }}</td>
            <td class="vendors__td">
              <span :class="['vendors__badge', `vendors__badge--${vendor.list_type?.toLowerCase()}`]">
                {{ t(`admin.vendors.listTypes.${vendor.list_type}`) }}
              </span>
            </td>
            <td class="vendors__td">{{ vendor.category_name || '-' }}</td>
            <td class="vendors__td">
              <span class="vendors__reason">{{ vendor.reason || '-' }}</span>
            </td>
            <td class="vendors__td">{{ formatDate(vendor.valid_from) }}</td>
            <td class="vendors__td">{{ formatDate(vendor.valid_until) }}</td>
            <td class="vendors__td">
              <div class="vendors__actions-cell">
                <button
                  class="vendors__action-btn"
                  @click="openEditModal(vendor)"
                >
                  {{ t('common.edit') }}
                </button>
                <button
                  class="vendors__action-btn vendors__action-btn--danger"
                  @click="confirmDelete(vendor)"
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
        class="vendors__pagination"
      >
        <button
          class="vendors__page-btn"
          :disabled="!hasPrev"
          @click="prevPage"
        >
          {{ t('common.previous') }}
        </button>
        <span class="vendors__page-info">
          {{ t('common.page') }} {{ page }} {{ t('common.of') }} {{ totalPages }}
        </span>
        <button
          class="vendors__page-btn"
          :disabled="!hasNext"
          @click="nextPage"
        >
          {{ t('common.next') }}
        </button>
      </div>

      <!-- Create/Edit Modal -->
      <div
        v-if="showModal"
        class="vendors__modal-overlay"
        @click.self="closeModal"
      >
        <div class="vendors__modal">
          <div class="vendors__modal-header">
            <h3 class="vendors__modal-title">
              {{ editingVendor ? t('admin.vendors.editVendor') : t('admin.vendors.createVendor') }}
            </h3>
            <button
              class="vendors__modal-close"
              @click="closeModal"
            >
              &times;
            </button>
          </div>
          <form
            class="vendors__modal-form"
            @submit.prevent="handleSubmit"
          >
            <div class="vendors__form-group">
              <label class="vendors__form-label">{{ t('admin.vendors.form.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="vendors__form-input"
                required
              />
            </div>
            <div class="vendors__form-group">
              <label class="vendors__form-label">{{ t('admin.vendors.form.document') }}</label>
              <input
                v-model="form.document"
                type="text"
                class="vendors__form-input"
              />
            </div>
            <div class="vendors__form-group">
              <label class="vendors__form-label">{{ t('admin.vendors.form.listType') }}</label>
              <select
                v-model="form.list_type"
                class="vendors__form-select"
                required
              >
                <option value="WHITELIST">{{ t('admin.vendors.listTypes.WHITELIST') }}</option>
                <option value="BLACKLIST">{{ t('admin.vendors.listTypes.BLACKLIST') }}</option>
              </select>
            </div>
            <div class="vendors__form-group">
              <label class="vendors__form-label">{{ t('admin.vendors.form.category') }}</label>
              <input
                v-model="form.category"
                type="text"
                class="vendors__form-input"
              />
            </div>
            <div class="vendors__form-group">
              <label class="vendors__form-label">{{ t('admin.vendors.form.reason') }}</label>
              <textarea
                v-model="form.reason"
                class="vendors__form-textarea"
                rows="3"
              />
            </div>
            <div class="vendors__form-group">
              <label class="vendors__form-label">{{ t('admin.vendors.form.validFrom') }}</label>
              <input
                v-model="form.valid_from"
                type="date"
                class="vendors__form-input"
              />
            </div>
            <div class="vendors__form-group">
              <label class="vendors__form-label">{{ t('admin.vendors.form.validUntil') }}</label>
              <input
                v-model="form.valid_until"
                type="date"
                class="vendors__form-input"
              />
            </div>
            <div class="vendors__modal-actions">
              <button
                type="button"
                class="vendors__modal-btn vendors__modal-btn--cancel"
                @click="closeModal"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="vendors__modal-btn vendors__modal-btn--submit"
                :disabled="submitting"
              >
                {{ editingVendor ? t('common.save') : t('common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div
        v-if="showDeleteConfirm"
        class="vendors__modal-overlay"
        @click.self="cancelDelete"
      >
        <div class="vendors__modal vendors__modal--sm">
          <div class="vendors__modal-header">
            <h3 class="vendors__modal-title">{{ t('common.confirm.title') }}</h3>
            <button
              class="vendors__modal-close"
              @click="cancelDelete"
            >
              &times;
            </button>
          </div>
          <div class="vendors__modal-form">
            <p class="vendors__confirm-text">{{ t('admin.vendors.messages.deleteConfirm') }}</p>
            <div class="vendors__modal-actions">
              <button
                type="button"
                class="vendors__modal-btn vendors__modal-btn--cancel"
                @click="cancelDelete"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="button"
                class="vendors__modal-btn vendors__modal-btn--danger"
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
import { adminVendorsService } from '@/services/admin/vendors'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const vendors = ref([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingVendor = ref(null)
const deletingVendor = ref(null)
const filterListType = ref('')

const form = reactive({
  name: '',
  document: '',
  list_type: 'WHITELIST',
  category: '',
  reason: '',
  valid_from: '',
  valid_until: ''
})

async function fetchVendors(params = {}) {
  loading.value = true
  try {
    const data = await adminVendorsService.list({
      ...params,
      list_type: filterListType.value || undefined
    })
    vendors.value = data.items || data || []
    if (data.meta?.total) {
      setTotal(data.meta.total)
    }
  } catch {
    toast.error(t('admin.vendors.messages.fetchError'))
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
} = usePagination(fetchVendors)

function handleFilter() {
  fetchVendors()
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateStr))
}

function openCreateModal() {
  editingVendor.value = null
  form.name = ''
  form.document = ''
  form.list_type = 'WHITELIST'
  form.category = ''
  form.reason = ''
  form.valid_from = ''
  form.valid_until = ''
  showModal.value = true
}

function openEditModal(vendor) {
  editingVendor.value = vendor
  form.name = vendor.name
  form.document = vendor.document || ''
  form.list_type = vendor.list_type
  form.category = vendor.category || ''
  form.reason = vendor.reason || ''
  form.valid_from = vendor.valid_from || ''
  form.valid_until = vendor.valid_until || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingVendor.value = null
}

function confirmDelete(vendor) {
  deletingVendor.value = vendor
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  deletingVendor.value = null
}

async function handleSubmit() {
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      document: form.document || null,
      list_type: form.list_type,
      category: form.category || null,
      reason: form.reason || null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null
    }

    if (editingVendor.value) {
      await adminVendorsService.update(editingVendor.value.id, payload)
      toast.success(t('admin.vendors.messages.updated'))
    } else {
      await adminVendorsService.create(payload)
      toast.success(t('admin.vendors.messages.created'))
    }
    closeModal()
    await fetchVendors()
  } catch {
    toast.error(t('admin.vendors.messages.saveError'))
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!deletingVendor.value) return
  submitting.value = true
  try {
    await adminVendorsService.remove(deletingVendor.value.id)
    toast.success(t('admin.vendors.messages.deleted'))
    cancelDelete()
    await fetchVendors()
  } catch {
    toast.error(t('admin.vendors.messages.deleteError'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchVendors()
})
</script>

<style lang="scss" scoped>
.vendors {
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

  &__filters {
    display: flex;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  &__filter-select {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;
    background: $white;
    min-width: 10rem;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
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

  &__name {
    font-weight: 500;
    color: $gray-800;
  }

  &__reason {
    color: $gray-500;
    font-size: $font-size-xs;
  }

  &__badge {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;

    &--whitelist {
      background: rgba($success, 0.1);
      color: $success;
    }

    &--blacklist {
      background: rgba($danger, 0.1);
      color: $danger;
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
