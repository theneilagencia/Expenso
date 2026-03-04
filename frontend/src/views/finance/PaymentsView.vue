<template>
  <DefaultLayout>
    <div class="payments">
      <div class="payments__header">
        <h2 class="payments__title">{{ t('payments.title') }}</h2>
        <p class="payments__subtitle">{{ t('payments.subtitle') }}</p>
      </div>

      <!-- Tab Navigation -->
      <div class="payments__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['payments__tab', { 'payments__tab--active': activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ t(tab.label) }}
          <span
            v-if="tab.count > 0"
            class="payments__tab-count"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Batch Actions -->
      <div
        v-if="activeTab === 'pending' && selectedIds.length"
        class="payments__batch"
      >
        <span class="payments__batch-count">
          {{ t('payments.selectedCount', { count: selectedIds.length }) }}
        </span>
        <button
          class="payments__batch-btn"
          :disabled="processingBatch"
          @click="processSelected"
        >
          {{ t('payments.processSelected') }}
        </button>
      </div>

      <div
        v-if="loading"
        class="payments__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!filteredPayments.length"
        class="payments__empty"
      >
        {{ t('payments.empty') }}
      </div>

      <table
        v-else
        class="payments__table"
      >
        <thead class="payments__table-head">
          <tr>
            <th
              v-if="activeTab === 'pending'"
              class="payments__th payments__th--checkbox"
            >
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th class="payments__th">{{ t('payments.table.title') }}</th>
            <th class="payments__th">{{ t('payments.table.requester') }}</th>
            <th class="payments__th payments__th--right">{{ t('payments.table.amount') }}</th>
            <th class="payments__th">{{ t('payments.table.status') }}</th>
            <th class="payments__th">{{ t('payments.table.method') }}</th>
            <th class="payments__th">{{ t('payments.table.date') }}</th>
            <th class="payments__th">{{ t('payments.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="payments__table-body">
          <template
            v-for="payment in filteredPayments"
            :key="payment.id"
          >
            <tr
              class="payments__row"
              @click="toggleExpand(payment.id)"
            >
              <td
                v-if="activeTab === 'pending'"
                class="payments__td payments__td--checkbox"
                @click.stop
              >
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(payment.id)"
                  @change="toggleSelect(payment.id)"
                />
              </td>
              <td class="payments__td">{{ payment.request_title }}</td>
              <td class="payments__td">{{ payment.requester_name }}</td>
              <td class="payments__td payments__td--right">
                {{ formatCurrency(payment.amount) }}
              </td>
              <td class="payments__td">
                <span :class="['payments__status', `payments__status--${payment.status?.toLowerCase()}`]">
                  {{ t(`payments.status.${payment.status}`) }}
                </span>
              </td>
              <td class="payments__td">{{ payment.payment_method || '-' }}</td>
              <td class="payments__td">{{ formatDate(payment.created_at) }}</td>
              <td class="payments__td">
                <button
                  v-if="payment.status === PAYMENT_STATUS.SCHEDULED"
                  class="payments__action-btn"
                  @click.stop="processSingle(payment)"
                >
                  {{ t('payments.process') }}
                </button>
              </td>
            </tr>

            <!-- Expandable Detail Row -->
            <tr
              v-if="expandedId === payment.id"
              class="payments__detail-row"
            >
              <td :colspan="activeTab === 'pending' ? 8 : 7">
                <div class="payments__detail">
                  <div class="payments__detail-grid">
                    <div class="payments__detail-item">
                      <span class="payments__detail-label">{{ t('payments.detail.requestId') }}</span>
                      <span class="payments__detail-value">{{ payment.request_id }}</span>
                    </div>
                    <div class="payments__detail-item">
                      <span class="payments__detail-label">{{ t('payments.detail.department') }}</span>
                      <span class="payments__detail-value">{{ payment.department || '-' }}</span>
                    </div>
                    <div class="payments__detail-item">
                      <span class="payments__detail-label">{{ t('payments.detail.category') }}</span>
                      <span class="payments__detail-value">{{ payment.category || '-' }}</span>
                    </div>
                    <div class="payments__detail-item">
                      <span class="payments__detail-label">{{ t('payments.detail.processedAt') }}</span>
                      <span class="payments__detail-value">{{ formatDate(payment.processed_at) }}</span>
                    </div>
                    <div
                      v-if="payment.failure_reason"
                      class="payments__detail-item payments__detail-item--full"
                    >
                      <span class="payments__detail-label">{{ t('payments.detail.failureReason') }}</span>
                      <span class="payments__detail-value payments__detail-value--danger">
                        {{ payment.failure_reason }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div
        v-if="totalPages > 1"
        class="payments__pagination"
      >
        <button
          class="payments__page-btn"
          :disabled="!hasPrev"
          @click="prevPage"
        >
          {{ t('common.previous') }}
        </button>
        <span class="payments__page-info">
          {{ t('common.pageOf', { current: page, total: totalPages }) }}
        </span>
        <button
          class="payments__page-btn"
          :disabled="!hasNext"
          @click="nextPage"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { paymentsService } from '@/services/payments'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import { PAYMENT_STATUS } from '@/constants/status'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const payments = ref([])
const activeTab = ref('pending')
const selectedIds = ref([])
const expandedId = ref(null)
const processingBatch = ref(false)

const tabStatusMap = {
  pending: PAYMENT_STATUS.SCHEDULED,
  processing: PAYMENT_STATUS.PROCESSING,
  completed: PAYMENT_STATUS.COMPLETED,
  failed: PAYMENT_STATUS.FAILED
}

const tabs = computed(() => [
  { key: 'pending', label: 'payments.tabs.pending', count: countByStatus(PAYMENT_STATUS.SCHEDULED) },
  { key: 'processing', label: 'payments.tabs.processing', count: countByStatus(PAYMENT_STATUS.PROCESSING) },
  { key: 'completed', label: 'payments.tabs.completed', count: countByStatus(PAYMENT_STATUS.COMPLETED) },
  { key: 'failed', label: 'payments.tabs.failed', count: countByStatus(PAYMENT_STATUS.FAILED) }
])

const filteredPayments = computed(() => {
  const status = tabStatusMap[activeTab.value]
  return payments.value.filter(p => p.status === status)
})

const allSelected = computed(() => {
  return filteredPayments.value.length > 0 &&
    filteredPayments.value.every(p => selectedIds.value.includes(p.id))
})

function countByStatus(status) {
  return payments.value.filter(p => p.status === status).length
}

async function fetchPayments(params = {}) {
  loading.value = true
  try {
    const data = await paymentsService.list(params)
    payments.value = data.items || data
    if (data.meta?.total) {
      setTotal(data.meta.total)
    }
  } catch {
    toast.error(t('payments.messages.fetchError'))
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
} = usePagination(fetchPayments)

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredPayments.value.map(p => p.id)
  }
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function processSingle(payment) {
  try {
    await paymentsService.process(payment.id, {})
    toast.success(t('payments.messages.processed'))
    await fetchPayments()
  } catch {
    toast.error(t('payments.messages.processError'))
  }
}

async function processSelected() {
  processingBatch.value = true
  try {
    await Promise.all(
      selectedIds.value.map(id => paymentsService.process(id, {}))
    )
    toast.success(t('payments.messages.batchProcessed', { count: selectedIds.value.length }))
    selectedIds.value = []
    await fetchPayments()
  } catch {
    toast.error(t('payments.messages.batchError'))
  } finally {
    processingBatch.value = false
  }
}

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateStr))
}

watch(activeTab, () => {
  selectedIds.value = []
  expandedId.value = null
})

onMounted(() => {
  fetchPayments()
})
</script>

<style lang="scss" scoped>
.payments {
  &__header {
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

  &__tabs {
    display: flex;
    gap: $spacing-xs;
    margin-bottom: $spacing-lg;
    border-bottom: 2px solid $gray-200;
  }

  &__tab {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-md $spacing-lg;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    color: $gray-500;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: $gray-700;
    }

    &--active {
      color: $primary;
      border-bottom-color: $primary;
    }
  }

  &__tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 $spacing-xs;
    border-radius: $radius-full;
    background: $gray-200;
    font-size: $font-size-xs;
    font-weight: 600;

    .payments__tab--active & {
      background: $primary;
      color: $white;
    }
  }

  &__batch {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md $spacing-lg;
    background: $primary-light;
    border-radius: $radius-md;
    margin-bottom: $spacing-lg;
  }

  &__batch-count {
    font-size: $font-size-sm;
    color: $primary-dark;
    font-weight: 500;
  }

  &__batch-btn {
    padding: $spacing-sm $spacing-lg;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background: $primary-dark;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    &--right {
      text-align: right;
    }

    &--checkbox {
      width: 2.5rem;
      text-align: center;
    }
  }

  &__row {
    cursor: pointer;
    transition: background-color 0.15s;

    &:hover {
      background: $gray-50;
    }

    &:not(:last-child) {
      border-bottom: 1px solid $gray-100;
    }
  }

  &__td {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-sm;
    color: $gray-700;

    &--right {
      text-align: right;
      font-weight: 600;
    }

    &--checkbox {
      width: 2.5rem;
      text-align: center;
    }
  }

  &__status {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;

    &--scheduled {
      background: rgba($warning, 0.1);
      color: $warning;
    }

    &--processing {
      background: rgba($info, 0.1);
      color: $info;
    }

    &--completed {
      background: rgba($success, 0.1);
      color: $success;
    }

    &--failed {
      background: rgba($danger, 0.1);
      color: $danger;
    }
  }

  &__action-btn {
    padding: $spacing-xs $spacing-md;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: $primary-dark;
    }
  }

  &__detail-row {
    background: $gray-50;
  }

  &__detail {
    padding: $spacing-md $spacing-lg;
  }

  &__detail-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md;
  }

  &__detail-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__detail-label {
    font-size: $font-size-xs;
    color: $gray-500;
    font-weight: 500;
  }

  &__detail-value {
    font-size: $font-size-sm;
    color: $gray-700;

    &--danger {
      color: $danger;
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
    transition: all 0.2s;

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
}
</style>
