<template>
  <DefaultLayout>
    <div class="approvals">
      <div class="approvals__header">
        <div class="approvals__title-row">
          <h2 class="approvals__title">{{ t('approvals.title') }}</h2>
          <span
            v-if="pendingApprovals.length"
            class="approvals__badge"
          >
            {{ pendingApprovals.length }}
          </span>
        </div>
        <p class="approvals__subtitle">{{ t('approvals.subtitle') }}</p>
      </div>

      <div class="approvals__filters">
        <div class="approvals__filter-group">
          <label class="approvals__filter-label">{{ t('approvals.filters.status') }}</label>
          <select
            class="approvals__filter-select"
            :value="filters.status"
            @change="setFilter('status', $event.target.value)"
          >
            <option value="">{{ t('common.all') }}</option>
            <option :value="REQUEST_STATUS.PENDING_MANAGER">
              {{ t('status.pendingManager') }}
            </option>
            <option :value="REQUEST_STATUS.PENDING_AI">
              {{ t('status.pendingAi') }}
            </option>
            <option :value="REQUEST_STATUS.IN_CORRECTION">
              {{ t('status.inCorrection') }}
            </option>
          </select>
        </div>

        <div class="approvals__filter-group">
          <label class="approvals__filter-label">{{ t('approvals.filters.department') }}</label>
          <select
            class="approvals__filter-select"
            :value="filters.department"
            @change="setFilter('department', $event.target.value)"
          >
            <option value="">{{ t('common.all') }}</option>
          </select>
        </div>

        <div class="approvals__filter-group">
          <label class="approvals__filter-label">{{ t('approvals.filters.dateFrom') }}</label>
          <input
            type="date"
            class="approvals__filter-input"
            :value="filters.date_from"
            @change="setFilter('date_from', $event.target.value)"
          />
        </div>

        <div class="approvals__filter-group">
          <label class="approvals__filter-label">{{ t('approvals.filters.dateTo') }}</label>
          <input
            type="date"
            class="approvals__filter-input"
            :value="filters.date_to"
            @change="setFilter('date_to', $event.target.value)"
          />
        </div>

        <button
          class="approvals__filter-reset"
          @click="resetFilters"
        >
          {{ t('common.resetFilters') }}
        </button>
      </div>

      <div
        v-if="loading"
        class="approvals__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="error"
        class="approvals__error"
      >
        {{ t('common.error') }}
      </div>

      <div
        v-else-if="!pendingApprovals.length"
        class="approvals__empty"
      >
        {{ t('approvals.empty') }}
      </div>

      <table
        v-else
        class="approvals__table"
      >
        <thead class="approvals__table-head">
          <tr>
            <th class="approvals__th">{{ t('approvals.table.requester') }}</th>
            <th class="approvals__th">{{ t('approvals.table.title') }}</th>
            <th class="approvals__th approvals__th--right">{{ t('approvals.table.amount') }}</th>
            <th class="approvals__th">{{ t('approvals.table.status') }}</th>
            <th class="approvals__th">{{ t('approvals.table.submitted') }}</th>
            <th class="approvals__th">{{ t('approvals.table.sla') }}</th>
          </tr>
        </thead>
        <tbody class="approvals__table-body">
          <tr
            v-for="approval in pendingApprovals"
            :key="approval.id"
            class="approvals__row"
            @click="goToDetail(approval.id)"
          >
            <td class="approvals__td">{{ approval.requester_name }}</td>
            <td class="approvals__td">{{ approval.title }}</td>
            <td class="approvals__td approvals__td--right">
              {{ formatCurrency(approval.total_amount) }}
            </td>
            <td class="approvals__td">
              <span :class="['approvals__status', `approvals__status--${approval.status?.toLowerCase()}`]">
                {{ t(`status.${approval.status}`) }}
              </span>
            </td>
            <td class="approvals__td">{{ formatDate(approval.created_at) }}</td>
            <td class="approvals__td">
              <span :class="['approvals__sla', getSlaClass(approval)]">
                {{ formatSlaRemaining(approval) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="totalPages > 1"
        class="approvals__pagination"
      >
        <button
          class="approvals__page-btn"
          :disabled="!hasPrev"
          @click="prevPage"
        >
          {{ t('common.previous') }}
        </button>
        <span class="approvals__page-info">
          {{ t('common.pageOf', { current: page, total: totalPages }) }}
        </span>
        <button
          class="approvals__page-btn"
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
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useApproval } from '@/composables/useApproval'
import { useFilters } from '@/composables/useFilters'
import { usePagination } from '@/composables/usePagination'
import { REQUEST_STATUS } from '@/constants/status'

const { t } = useI18n()
const router = useRouter()

const {
  loading,
  error,
  pendingApprovals,
  fetchPendingApprovals
} = useApproval()

const { filters, setFilter, resetFilters } = useFilters(fetchPendingApprovals, {
  status: '',
  department: '',
  date_from: '',
  date_to: ''
})

const {
  page,
  totalPages,
  hasNext,
  hasPrev,
  nextPage,
  prevPage,
  setTotal
} = usePagination(fetchPendingApprovals)

function goToDetail(id) {
  router.push({ name: 'approval-detail', params: { id } })
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

function getSlaClass(approval) {
  if (!approval.sla_deadline) return ''
  const now = new Date()
  const deadline = new Date(approval.sla_deadline)
  const hoursLeft = (deadline - now) / (1000 * 60 * 60)
  if (hoursLeft <= 0) return 'approvals__sla--overdue'
  if (hoursLeft <= 4) return 'approvals__sla--warning'
  return 'approvals__sla--ok'
}

function formatSlaRemaining(approval) {
  if (!approval.sla_deadline) return '-'
  const now = new Date()
  const deadline = new Date(approval.sla_deadline)
  const hoursLeft = Math.floor((deadline - now) / (1000 * 60 * 60))
  if (hoursLeft <= 0) return t('approvals.sla.overdue')
  return t('approvals.sla.hoursLeft', { hours: hoursLeft })
}

onMounted(async () => {
  const data = await fetchPendingApprovals()
  if (data?.meta?.total) {
    setTotal(data.meta.total)
  }
})
</script>

<style lang="scss" scoped>
.approvals {
  &__header {
    margin-bottom: $spacing-xl;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $gray-900;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 $spacing-xs;
    border-radius: $radius-full;
    background-color: $primary;
    color: $white;
    font-size: $font-size-xs;
    font-weight: 600;
  }

  &__subtitle {
    color: $gray-500;
    margin-top: $spacing-xs;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
    align-items: flex-end;
    padding: $spacing-lg;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    margin-bottom: $spacing-lg;
  }

  &__filter-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__filter-label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-700;
  }

  &__filter-select,
  &__filter-input {
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

  &__filter-reset {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    background: $white;
    color: $gray-600;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: $gray-50;
    }
  }

  &__loading,
  &__error,
  &__empty {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-lg;
  }

  &__error {
    color: $danger;
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
  }

  &__status {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;

    &--pending_manager {
      background: rgba($warning, 0.1);
      color: $warning;
    }

    &--pending_ai {
      background: rgba($info, 0.1);
      color: $info;
    }

    &--in_correction {
      background: rgba($secondary, 0.1);
      color: $secondary;
    }
  }

  &__sla {
    font-size: $font-size-sm;
    font-weight: 500;

    &--ok {
      color: $success;
    }

    &--warning {
      color: $warning;
    }

    &--overdue {
      color: $danger;
      font-weight: 600;
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
