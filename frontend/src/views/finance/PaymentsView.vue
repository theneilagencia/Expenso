<template>
  <DefaultLayout>
    <div class="payments">
      <div class="payments__header">
        <div class="payments__header-left">
          <h2 class="payments__title">{{ t('payments.title') }}</h2>
          <p class="payments__subtitle">{{ t('payments.subtitle') }}</p>
        </div>
        <button
          class="payments__export-btn"
          @click="handleExportXlsx"
        >
          {{ t('payments.exportXlsx') }}
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="payments__kpis">
        <div class="payments__kpi payments__kpi--pending">
          <span class="payments__kpi-label">{{ t('payments.kpi.totalPending') }}</span>
          <span class="payments__kpi-value">{{ formatCurrency(kpis.totalPending, 'BRL') }}</span>
          <span class="payments__kpi-count">{{ kpis.pendingCount }}</span>
        </div>
        <div class="payments__kpi payments__kpi--processing">
          <span class="payments__kpi-label">{{ t('payments.kpi.processingCount') }}</span>
          <span class="payments__kpi-value">{{ kpis.processingCount }}</span>
        </div>
        <div class="payments__kpi payments__kpi--completed">
          <span class="payments__kpi-label">{{ t('payments.kpi.totalPaid') }}</span>
          <span class="payments__kpi-value">{{ formatCurrency(kpis.totalPaid, 'BRL') }}</span>
          <span class="payments__kpi-count">{{ kpis.completedCount }}</span>
        </div>
        <div class="payments__kpi payments__kpi--failed">
          <span class="payments__kpi-label">{{ t('payments.kpi.failedCount') }}</span>
          <span class="payments__kpi-value">{{ kpis.failedCount }}</span>
        </div>
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
          {{ t('payments.selectedCount', { count: selectedIds.length, amount: formatCurrency(selectedTotal, 'BRL') }) }}
        </span>
        <select
          v-model="batchMethod"
          class="payments__batch-method"
        >
          <option value="REVOLUT">{{ t('payments.revolut') }}</option>
          <option value="PIX">{{ t('payments.pix') }}</option>
          <option value="PAYROLL">{{ t('payments.payroll') }}</option>
        </select>
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
                {{ formatCurrency(payment.amount_paid, payment.currency_paid) }}
              </td>
              <td class="payments__td">
                <span :class="['payments__status', `payments__status--${normalizeStatus(payment.status)}`]">
                  {{ t(`payments.status.${payment.status}`) }}
                </span>
              </td>
              <td class="payments__td">{{ payment.method || '-' }}</td>
              <td class="payments__td">{{ formatDate(payment.created_at) }}</td>
              <td class="payments__td">
                <button
                  v-if="payment.status === PAYMENT_STATUS.SCHEDULED"
                  class="payments__action-btn"
                  @click.stop="processSingle(payment)"
                >
                  {{ t('payments.process') }}
                </button>
                <button
                  v-if="payment.status === PAYMENT_STATUS.FAILED"
                  class="payments__action-btn payments__action-btn--retry"
                  @click.stop="retryPayment(payment)"
                >
                  {{ t('payments.retry') }}
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
                      <span class="payments__detail-value">{{ formatDate(payment.payment_date) }}</span>
                    </div>
                    <div
                      v-if="payment.last_error"
                      class="payments__detail-item payments__detail-item--full"
                    >
                      <span class="payments__detail-label">{{ t('payments.detail.failureReason') }}</span>
                      <span class="payments__detail-value payments__detail-value--danger">
                        {{ payment.last_error }}
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
const batchMethod = ref('REVOLUT')

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
  return payments.value.filter(p => normalizeStatus(p.status) === normalizeStatus(status))
})

const allSelected = computed(() => {
  return filteredPayments.value.length > 0 &&
    filteredPayments.value.every(p => selectedIds.value.includes(p.id))
})

const selectedTotal = computed(() => {
  return filteredPayments.value
    .filter(p => selectedIds.value.includes(p.id))
    .reduce((sum, p) => sum + (p.amount_paid || 0), 0)
})

const kpis = computed(() => {
  const all = payments.value
  const pendingList = all.filter(p => normalizeStatus(p.status) === 'scheduled')
  const processingList = all.filter(p => normalizeStatus(p.status) === 'processing')
  const completedList = all.filter(p => normalizeStatus(p.status) === 'completed')
  const failedList = all.filter(p => normalizeStatus(p.status) === 'failed')

  return {
    totalPending: pendingList.reduce((sum, p) => sum + (p.amount_paid || 0), 0),
    pendingCount: pendingList.length,
    processingCount: processingList.length,
    totalPaid: completedList.reduce((sum, p) => sum + (p.amount_paid || 0), 0),
    completedCount: completedList.length,
    failedCount: failedList.length
  }
})

function normalizeStatus(status) {
  if (!status) return ''
  return status.toLowerCase()
}

function countByStatus(status) {
  return payments.value.filter(p => normalizeStatus(p.status) === normalizeStatus(status)).length
}

async function fetchPayments(params = {}) {
  loading.value = true
  try {
    const data = await paymentsService.list({ ...params, per_page: 100 })
    payments.value = data.data || data.items || data
    if (data.total) {
      setTotal(data.total)
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
    await paymentsService.process(payment.request_id, { method: batchMethod.value })
    toast.success(t('payments.messages.processed'))
    await fetchPayments()
  } catch {
    toast.error(t('payments.messages.processError'))
  }
}

async function retryPayment(payment) {
  try {
    await paymentsService.retry(payment.id)
    toast.success(t('payments.messages.retrySuccess'))
    await fetchPayments()
  } catch {
    toast.error(t('payments.messages.retryError'))
  }
}

async function processSelected() {
  processingBatch.value = true
  try {
    const result = await paymentsService.batchProcess({
      request_ids: selectedIds.value.map(id => {
        const p = payments.value.find(pay => pay.id === id)
        return p?.request_id || id
      }),
      method: batchMethod.value
    })
    const count = result.processed?.length || selectedIds.value.length
    toast.success(t('payments.messages.batchProcessed', { count }))
    selectedIds.value = []
    await fetchPayments()
  } catch {
    toast.error(t('payments.messages.batchError'))
  } finally {
    processingBatch.value = false
  }
}

async function handleExportXlsx() {
  try {
    await paymentsService.exportXlsx()
  } catch {
    toast.error(t('payments.messages.fetchError'))
  }
}

function formatCurrency(value, currency = 'BRL') {
  if (value == null) return '-'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'BRL'
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

  &__export-btn {
    padding: $spacing-sm $spacing-lg;
    background: $white;
    color: $gray-700;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $gray-50;
      border-color: $primary;
      color: $primary;
    }
  }

  &__kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  &__kpi {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    padding: $spacing-lg;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    border-left: 4px solid transparent;

    &--pending {
      border-left-color: $warning;
    }

    &--processing {
      border-left-color: $info;
    }

    &--completed {
      border-left-color: $success;
    }

    &--failed {
      border-left-color: $danger;
    }
  }

  &__kpi-label {
    font-size: $font-size-xs;
    color: $gray-500;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__kpi-value {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $gray-900;
  }

  &__kpi-count {
    font-size: $font-size-sm;
    color: $gray-500;
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

  &__batch-method {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;
    background: $white;
    cursor: pointer;
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

    &--retry {
      background: $warning;

      &:hover {
        background: darken($warning, 10%);
      }
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
