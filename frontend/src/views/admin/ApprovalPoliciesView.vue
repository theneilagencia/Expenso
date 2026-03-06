<template>
  <DefaultLayout>
    <div class="policies">
      <div class="policies__header">
        <div class="policies__header-left">
          <h2 class="policies__title">{{ t('admin.approvalPolicies.title') }}</h2>
          <p class="policies__subtitle">{{ t('admin.approvalPolicies.subtitle') }}</p>
        </div>
        <button
          class="policies__create-btn"
          @click="openCreateModal"
        >
          {{ t('admin.approvalPolicies.create') }}
        </button>
      </div>

      <div
        v-if="loading"
        class="policies__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!policies.length"
        class="policies__empty"
      >
        {{ t('admin.approvalPolicies.empty') }}
      </div>

      <table
        v-else
        class="policies__table"
      >
        <thead class="policies__table-head">
          <tr>
            <th class="policies__th">{{ t('admin.approvalPolicies.table.name') }}</th>
            <th class="policies__th">{{ t('admin.approvalPolicies.table.department') }}</th>
            <th class="policies__th">{{ t('admin.approvalPolicies.table.minAmount') }}</th>
            <th class="policies__th">{{ t('admin.approvalPolicies.table.maxAmount') }}</th>
            <th class="policies__th">{{ t('admin.approvalPolicies.table.approvalFlow') }}</th>
            <th class="policies__th">{{ t('admin.approvalPolicies.table.active') }}</th>
            <th class="policies__th">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="policies__table-body">
          <tr
            v-for="policy in policies"
            :key="policy.id"
            class="policies__row"
          >
            <td class="policies__td">
              <span class="policies__name">{{ policy.name }}</span>
            </td>
            <td class="policies__td">{{ policy.department_name || '-' }}</td>
            <td class="policies__td">{{ formatCurrency(policy.min_amount) }}</td>
            <td class="policies__td">{{ formatCurrency(policy.max_amount) }}</td>
            <td class="policies__td">
              <span class="policies__flow">{{ formatFlow(policy.approval_flow) }}</span>
            </td>
            <td class="policies__td">
              <span :class="['policies__status', policy.is_active ? 'policies__status--active' : 'policies__status--inactive']">
                {{ policy.is_active ? t('common.active') : t('common.inactive') }}
              </span>
            </td>
            <td class="policies__td">
              <div class="policies__actions-cell">
                <button
                  class="policies__action-btn"
                  @click="openEditModal(policy)"
                >
                  {{ t('common.edit') }}
                </button>
                <button
                  class="policies__action-btn policies__action-btn--danger"
                  @click="confirmDelete(policy)"
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
        class="policies__pagination"
      >
        <button
          class="policies__page-btn"
          :disabled="!hasPrev"
          @click="prevPage"
        >
          {{ t('common.previous') }}
        </button>
        <span class="policies__page-info">
          {{ t('common.page') }} {{ page }} {{ t('common.of') }} {{ totalPages }}
        </span>
        <button
          class="policies__page-btn"
          :disabled="!hasNext"
          @click="nextPage"
        >
          {{ t('common.next') }}
        </button>
      </div>

      <!-- Create/Edit Modal -->
      <div
        v-if="showModal"
        class="policies__modal-overlay"
        @click.self="closeModal"
      >
        <div class="policies__modal">
          <div class="policies__modal-header">
            <h3 class="policies__modal-title">
              {{ editingPolicy ? t('admin.approvalPolicies.editPolicy') : t('admin.approvalPolicies.createPolicy') }}
            </h3>
            <button
              class="policies__modal-close"
              @click="closeModal"
            >
              &times;
            </button>
          </div>
          <form
            class="policies__modal-form"
            @submit.prevent="handleSubmit"
          >
            <div class="policies__form-group">
              <label class="policies__form-label">{{ t('admin.approvalPolicies.form.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="policies__form-input"
                required
              />
            </div>
            <div class="policies__form-group">
              <label class="policies__form-label">{{ t('admin.approvalPolicies.form.department') }}</label>
              <select
                v-model="form.department_id"
                class="policies__form-select"
              >
                <option value="">{{ t('admin.approvalPolicies.form.allDepartments') }}</option>
                <option
                  v-for="dept in departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div class="policies__form-group">
              <label class="policies__form-label">{{ t('admin.approvalPolicies.form.minAmount') }}</label>
              <input
                v-model.number="form.min_amount"
                type="number"
                step="0.01"
                min="0"
                class="policies__form-input"
              />
            </div>
            <div class="policies__form-group">
              <label class="policies__form-label">{{ t('admin.approvalPolicies.form.maxAmount') }}</label>
              <input
                v-model.number="form.max_amount"
                type="number"
                step="0.01"
                min="0"
                class="policies__form-input"
              />
            </div>
            <div class="policies__form-group">
              <label class="policies__form-label">{{ t('admin.approvalPolicies.form.approvalFlow') }}</label>
              <textarea
                v-model="form.approval_flow"
                class="policies__form-textarea"
                rows="4"
                :placeholder="t('admin.approvalPolicies.form.approvalFlowPlaceholder')"
              />
            </div>
            <div class="policies__form-group">
              <label class="policies__form-checkbox-label">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="policies__form-checkbox"
                />
                {{ t('common.active') }}
              </label>
            </div>
            <div class="policies__modal-actions">
              <button
                type="button"
                class="policies__modal-btn policies__modal-btn--cancel"
                @click="closeModal"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="policies__modal-btn policies__modal-btn--submit"
                :disabled="submitting"
              >
                {{ editingPolicy ? t('common.save') : t('common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div
        v-if="showDeleteConfirm"
        class="policies__modal-overlay"
        @click.self="cancelDelete"
      >
        <div class="policies__modal policies__modal--sm">
          <div class="policies__modal-header">
            <h3 class="policies__modal-title">{{ t('common.confirm.title') }}</h3>
            <button
              class="policies__modal-close"
              @click="cancelDelete"
            >
              &times;
            </button>
          </div>
          <div class="policies__modal-form">
            <p class="policies__confirm-text">{{ t('admin.approvalPolicies.messages.deleteConfirm') }}</p>
            <div class="policies__modal-actions">
              <button
                type="button"
                class="policies__modal-btn policies__modal-btn--cancel"
                @click="cancelDelete"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="button"
                class="policies__modal-btn policies__modal-btn--danger"
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
import { adminApprovalPoliciesService } from '@/services/admin/approvalPolicies'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import http from '@/services/http'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const policies = ref([])
const departments = ref([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingPolicy = ref(null)
const deletingPolicy = ref(null)

const form = reactive({
  name: '',
  department_id: '',
  min_amount: 0,
  max_amount: 0,
  approval_flow: '',
  is_active: true
})

async function fetchPolicies(params = {}) {
  loading.value = true
  try {
    const data = await adminApprovalPoliciesService.list(params)
    policies.value = data.items || data || []
    if (data.meta?.total) {
      setTotal(data.meta.total)
    }
  } catch {
    toast.error(t('admin.approvalPolicies.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

async function fetchDepartments() {
  try {
    const { data } = await http.get('/api/v1/admin/hierarchy')
    departments.value = Array.isArray(data) ? data : data.departments || []
  } catch {
    departments.value = []
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
} = usePagination(fetchPolicies)

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function formatFlow(flow) {
  if (!flow) return '-'
  if (typeof flow === 'string') {
    try {
      const parsed = JSON.parse(flow)
      return Array.isArray(parsed) ? parsed.join(' > ') : String(flow)
    } catch {
      return flow
    }
  }
  if (Array.isArray(flow)) return flow.join(' > ')
  return String(flow)
}

function openCreateModal() {
  editingPolicy.value = null
  form.name = ''
  form.department_id = ''
  form.min_amount = 0
  form.max_amount = 0
  form.approval_flow = ''
  form.is_active = true
  showModal.value = true
}

function openEditModal(policy) {
  editingPolicy.value = policy
  form.name = policy.name
  form.department_id = policy.department_id || ''
  form.min_amount = policy.min_amount || 0
  form.max_amount = policy.max_amount || 0
  form.approval_flow = typeof policy.approval_flow === 'string'
    ? policy.approval_flow
    : JSON.stringify(policy.approval_flow || [], null, 2)
  form.is_active = policy.is_active !== false
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPolicy.value = null
}

function confirmDelete(policy) {
  deletingPolicy.value = policy
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  deletingPolicy.value = null
}

async function handleSubmit() {
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      department_id: form.department_id || null,
      min_amount: form.min_amount,
      max_amount: form.max_amount,
      approval_flow: form.approval_flow,
      is_active: form.is_active
    }

    if (editingPolicy.value) {
      await adminApprovalPoliciesService.update(editingPolicy.value.id, payload)
      toast.success(t('admin.approvalPolicies.messages.updated'))
    } else {
      await adminApprovalPoliciesService.create(payload)
      toast.success(t('admin.approvalPolicies.messages.created'))
    }
    closeModal()
    await fetchPolicies()
  } catch {
    toast.error(t('admin.approvalPolicies.messages.saveError'))
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!deletingPolicy.value) return
  submitting.value = true
  try {
    await adminApprovalPoliciesService.remove(deletingPolicy.value.id)
    toast.success(t('admin.approvalPolicies.messages.deleted'))
    cancelDelete()
    await fetchPolicies()
  } catch {
    toast.error(t('admin.approvalPolicies.messages.deleteError'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchPolicies()
  fetchDepartments()
})
</script>

<style lang="scss" scoped>
.policies {
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

  &__name {
    font-weight: 500;
    color: $gray-800;
  }

  &__flow {
    font-size: $font-size-xs;
    color: $gray-500;
  }

  &__status {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;

    &--active {
      background: rgba($success, 0.1);
      color: $success;
    }

    &--inactive {
      background: rgba($gray-500, 0.1);
      color: $gray-500;
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
