<template>
  <DefaultLayout>
    <div class="requests-list">
      <div class="requests-list__header">
        <h2 class="requests-list__title">{{ t('requests.myRequests') }}</h2>
        <router-link
          :to="{ name: 'request-new' }"
          class="requests-list__new-btn"
        >
          {{ t('requests.new') }}
        </router-link>
      </div>

      <div class="requests-list__filters">
        <div class="requests-list__filter-group">
          <label class="requests-list__filter-label" for="filter-status">
            {{ t('common.status') }}
          </label>
          <select
            id="filter-status"
            v-model="filterStatus"
            class="requests-list__filter-select"
            @change="applyFilters"
          >
            <option value="">{{ t('common.filter') }}</option>
            <option
              v-for="status in statusOptions"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
        </div>

        <div class="requests-list__filter-group">
          <label class="requests-list__filter-label" for="filter-date-from">
            {{ t('common.date') }}
          </label>
          <div class="requests-list__filter-dates">
            <input
              id="filter-date-from"
              v-model="filterDateFrom"
              type="date"
              class="requests-list__filter-input"
              @change="applyFilters"
            />
            <span class="requests-list__filter-separator">-</span>
            <input
              id="filter-date-to"
              v-model="filterDateTo"
              type="date"
              class="requests-list__filter-input"
              @change="applyFilters"
            />
          </div>
        </div>

        <div class="requests-list__filter-group">
          <label class="requests-list__filter-label" for="filter-search">
            {{ t('common.search') }}
          </label>
          <input
            id="filter-search"
            v-model="filterSearch"
            type="text"
            class="requests-list__filter-input requests-list__filter-input--search"
            :placeholder="t('common.search')"
            @input="onSearchInput"
          />
        </div>

        <button
          class="requests-list__filter-reset"
          @click="handleResetFilters"
        >
          {{ t('common.resetFilters') }}
        </button>
      </div>

      <div v-if="loading" class="requests-list__loading">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="!requests.length" class="requests-list__empty">
        <p class="requests-list__empty-title">{{ t('common.emptyState.title') }}</p>
        <p class="requests-list__empty-description">{{ t('common.emptyState.description') }}</p>
      </div>

      <template v-else>
        <div class="requests-list__table-wrapper">
          <table class="requests-list__table">
            <thead>
              <tr>
                <th>{{ t('requests.requestTitle') }}</th>
                <th>{{ t('common.amount') }}</th>
                <th>{{ t('common.status') }}</th>
                <th>{{ t('requests.category') }}</th>
                <th>{{ t('common.date') }}</th>
                <th>{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="request in requests"
                :key="request.id"
                class="requests-list__row"
                @click="goToDetail(request.id)"
              >
                <td class="requests-list__cell-title">{{ request.title }}</td>
                <td class="requests-list__cell-amount">{{ formatCurrency(request.total_amount) }}</td>
                <td>
                  <span
                    class="requests-list__status-badge"
                    :class="`requests-list__status-badge--${statusClass(request.status)}`"
                  >
                    {{ statusLabel(request.status) }}
                  </span>
                </td>
                <td>{{ request.category?.name }}</td>
                <td>{{ formatDate(request.created_at) }}</td>
                <td>
                  <button
                    class="requests-list__action-btn"
                    @click.stop="goToDetail(request.id)"
                  >
                    {{ t('common.edit') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="requests-list__pagination">
          <button
            class="requests-list__pagination-btn"
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            {{ t('common.pagination.previous') }}
          </button>
          <span class="requests-list__pagination-info">
            {{ t('common.pagination.page') }} {{ pagination.page }}
            {{ t('common.pagination.of') }} {{ totalPages }}
          </span>
          <button
            class="requests-list__pagination-btn"
            :disabled="pagination.page >= totalPages"
            @click="changePage(pagination.page + 1)"
          >
            {{ t('common.pagination.next') }}
          </button>
        </div>
      </template>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useRequest } from '@/composables/useRequest'
import { REQUEST_STATUS } from '@/constants/status'

const { t } = useI18n()
const router = useRouter()
const {
  loading,
  requests,
  pagination,
  fetchRequests,
  setFilters,
  resetFilters
} = useRequest()

const filterStatus = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const filterSearch = ref('')
let searchTimeout = null

const totalPages = computed(() => {
  if (!pagination.value?.total || !pagination.value?.perPage) return 1
  return Math.ceil(pagination.value.total / pagination.value.perPage)
})

const statusOptions = computed(() => [
  { value: REQUEST_STATUS.DRAFT, label: t('requests.statusDraft') },
  { value: REQUEST_STATUS.PENDING_AI, label: t('requests.statusPendingAI') },
  { value: REQUEST_STATUS.PENDING_MANAGER, label: t('requests.statusPendingManager') },
  { value: REQUEST_STATUS.IN_CORRECTION, label: t('requests.statusInCorrection') },
  { value: REQUEST_STATUS.PENDING_FINANCE, label: t('requests.statusPendingFinance') },
  { value: REQUEST_STATUS.IN_PAYMENT, label: t('requests.statusInPayment') },
  { value: REQUEST_STATUS.PAID, label: t('requests.statusPaid') },
  { value: REQUEST_STATUS.REJECTED_MANAGER, label: t('requests.statusRejectedManager') },
  { value: REQUEST_STATUS.REJECTED_FINANCE, label: t('requests.statusRejectedFinance') },
  { value: REQUEST_STATUS.CANCELLED, label: t('requests.statusCancelled') }
])

function statusLabel(status) {
  const map = {
    [REQUEST_STATUS.DRAFT]: t('requests.statusDraft'),
    [REQUEST_STATUS.PENDING_AI]: t('requests.statusPendingAI'),
    [REQUEST_STATUS.PENDING_MANAGER]: t('requests.statusPendingManager'),
    [REQUEST_STATUS.IN_CORRECTION]: t('requests.statusInCorrection'),
    [REQUEST_STATUS.PENDING_FINANCE]: t('requests.statusPendingFinance'),
    [REQUEST_STATUS.IN_PAYMENT]: t('requests.statusInPayment'),
    [REQUEST_STATUS.PAID]: t('requests.statusPaid'),
    [REQUEST_STATUS.REJECTED_AI]: t('requests.statusRejectedAI'),
    [REQUEST_STATUS.REJECTED_MANAGER]: t('requests.statusRejectedManager'),
    [REQUEST_STATUS.REJECTED_FINANCE]: t('requests.statusRejectedFinance'),
    [REQUEST_STATUS.CANCELLED]: t('requests.statusCancelled')
  }
  return map[status] || status
}

function statusClass(status) {
  const map = {
    [REQUEST_STATUS.DRAFT]: 'draft',
    [REQUEST_STATUS.PENDING_AI]: 'pending',
    [REQUEST_STATUS.PENDING_MANAGER]: 'pending',
    [REQUEST_STATUS.IN_CORRECTION]: 'warning',
    [REQUEST_STATUS.PENDING_FINANCE]: 'pending',
    [REQUEST_STATUS.IN_PAYMENT]: 'info',
    [REQUEST_STATUS.PAID]: 'success',
    [REQUEST_STATUS.REJECTED_AI]: 'danger',
    [REQUEST_STATUS.REJECTED_MANAGER]: 'danger',
    [REQUEST_STATUS.REJECTED_FINANCE]: 'danger',
    [REQUEST_STATUS.CANCELLED]: 'cancelled'
  }
  return map[status] || 'default'
}

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

function applyFilters() {
  const filters = {}
  if (filterStatus.value) filters.status = filterStatus.value
  if (filterDateFrom.value) filters.date_from = filterDateFrom.value
  if (filterDateTo.value) filters.date_to = filterDateTo.value
  if (filterSearch.value) filters.search = filterSearch.value
  setFilters(filters)
  fetchRequests({ page: 1 })
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 400)
}

function handleResetFilters() {
  filterStatus.value = ''
  filterDateFrom.value = ''
  filterDateTo.value = ''
  filterSearch.value = ''
  resetFilters()
  fetchRequests({ page: 1 })
}

function changePage(page) {
  fetchRequests({ page })
}

function goToDetail(id) {
  router.push({ name: 'request-detail', params: { id } })
}

onMounted(() => {
  fetchRequests()
})
</script>

<style lang="scss" scoped>
.requests-list {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $gray-900;
  }

  &__new-btn {
    display: inline-flex;
    align-items: center;
    padding: $spacing-sm $spacing-lg;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s;
    cursor: pointer;

    &:hover {
      background: $primary-dark;
    }
  }

  &__filters {
    display: flex;
    align-items: flex-end;
    gap: $spacing-md;
    padding: $spacing-lg;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;
  }

  &__filter-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__filter-label {
    font-size: $font-size-xs;
    font-weight: 500;
    color: $gray-600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__filter-select,
  &__filter-input {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;
    background: $white;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 3px $primary-light;
    }
  }

  &__filter-input--search {
    min-width: 200px;
  }

  &__filter-dates {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__filter-separator {
    color: $gray-400;
  }

  &__filter-reset {
    padding: $spacing-sm $spacing-md;
    background: transparent;
    color: $gray-600;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $gray-50;
      color: $gray-800;
    }
  }

  &__loading {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-base;
  }

  &__empty {
    text-align: center;
    padding: $spacing-2xl;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
  }

  &__empty-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-700;
    margin-bottom: $spacing-sm;
  }

  &__empty-description {
    font-size: $font-size-sm;
    color: $gray-500;
  }

  &__table-wrapper {
    overflow-x: auto;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th {
      text-align: left;
      padding: $spacing-md $spacing-lg;
      font-size: $font-size-xs;
      font-weight: 600;
      color: $gray-600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: $gray-50;
      border-bottom: 1px solid $gray-200;
    }

    td {
      padding: $spacing-md $spacing-lg;
      font-size: $font-size-sm;
      color: $gray-700;
      border-bottom: 1px solid $gray-100;
    }
  }

  &__row {
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: $gray-50;
    }

    &:last-child td {
      border-bottom: none;
    }
  }

  &__cell-title {
    font-weight: 500;
    color: $gray-900;
  }

  &__cell-amount {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &__status-badge {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;
    line-height: 1;

    &--draft {
      background: $gray-100;
      color: $gray-700;
    }

    &--pending {
      background: #fef3c7;
      color: #92400e;
    }

    &--warning {
      background: #fff7ed;
      color: #9a3412;
    }

    &--info {
      background: #dbeafe;
      color: #1e40af;
    }

    &--success {
      background: #dcfce7;
      color: #166534;
    }

    &--danger {
      background: #fee2e2;
      color: #991b1b;
    }

    &--cancelled {
      background: $gray-100;
      color: $gray-500;
    }

    &--default {
      background: $gray-100;
      color: $gray-600;
    }
  }

  &__action-btn {
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    color: $primary;
    border: 1px solid $primary;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $primary;
      color: $white;
    }
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    margin-top: $spacing-lg;
    padding: $spacing-md 0;
  }

  &__pagination-btn {
    padding: $spacing-sm $spacing-lg;
    background: $white;
    color: $gray-700;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
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

  &__pagination-info {
    font-size: $font-size-sm;
    color: $gray-600;
  }
}
</style>
