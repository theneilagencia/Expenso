<template>
  <DefaultLayout>
    <div class="audit">
      <div class="audit__header">
        <div class="audit__header-left">
          <h2 class="audit__title">{{ t('admin.audit.title') }}</h2>
          <p class="audit__subtitle">{{ t('admin.audit.subtitle') }}</p>
        </div>
        <button
          class="audit__export-btn"
          :disabled="exporting"
          @click="handleExport"
        >
          {{ t('admin.audit.export') }}
        </button>
      </div>

      <!-- Filters -->
      <div class="audit__filters">
        <div class="audit__filter-group">
          <label class="audit__filter-label">{{ t('admin.audit.filters.dateFrom') }}</label>
          <input
            type="date"
            class="audit__filter-input"
            :value="filters.date_from"
            @change="setFilter('date_from', ($event.target).value)"
          />
        </div>
        <div class="audit__filter-group">
          <label class="audit__filter-label">{{ t('admin.audit.filters.dateTo') }}</label>
          <input
            type="date"
            class="audit__filter-input"
            :value="filters.date_to"
            @change="setFilter('date_to', ($event.target).value)"
          />
        </div>
        <div class="audit__filter-group">
          <label class="audit__filter-label">{{ t('admin.audit.filters.user') }}</label>
          <input
            type="text"
            class="audit__filter-input"
            :placeholder="t('admin.audit.filters.userPlaceholder')"
            :value="filters.user"
            @input="setFilter('user', ($event.target).value)"
          />
        </div>
        <div class="audit__filter-group">
          <label class="audit__filter-label">{{ t('admin.audit.filters.action') }}</label>
          <select
            class="audit__filter-select"
            :value="filters.action"
            @change="setFilter('action', ($event.target).value)"
          >
            <option value="">{{ t('common.all') }}</option>
            <option value="create">{{ t('admin.audit.actions.create') }}</option>
            <option value="update">{{ t('admin.audit.actions.update') }}</option>
            <option value="delete">{{ t('admin.audit.actions.delete') }}</option>
            <option value="approve">{{ t('admin.audit.actions.approve') }}</option>
            <option value="reject">{{ t('admin.audit.actions.reject') }}</option>
            <option value="login">{{ t('admin.audit.actions.login') }}</option>
            <option value="payment">{{ t('admin.audit.actions.payment') }}</option>
          </select>
        </div>
        <button
          class="audit__filter-reset"
          @click="resetFilters"
        >
          {{ t('common.resetFilters') }}
        </button>
      </div>

      <div
        v-if="loading"
        class="audit__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!auditEntries.length"
        class="audit__empty"
      >
        {{ t('admin.audit.empty') }}
      </div>

      <table
        v-else
        class="audit__table"
      >
        <thead class="audit__table-head">
          <tr>
            <th class="audit__th">{{ t('admin.audit.table.timestamp') }}</th>
            <th class="audit__th">{{ t('admin.audit.table.user') }}</th>
            <th class="audit__th">{{ t('admin.audit.table.action') }}</th>
            <th class="audit__th">{{ t('admin.audit.table.entityType') }}</th>
            <th class="audit__th">{{ t('admin.audit.table.entityId') }}</th>
            <th class="audit__th">{{ t('admin.audit.table.details') }}</th>
          </tr>
        </thead>
        <tbody class="audit__table-body">
          <template
            v-for="entry in auditEntries"
            :key="entry.id"
          >
            <tr
              class="audit__row"
              @click="toggleExpand(entry.id)"
            >
              <td class="audit__td">
                <span class="audit__timestamp">{{ formatDateTime(entry.created_at) }}</span>
              </td>
              <td class="audit__td">{{ entry.user_name || entry.user_email || '-' }}</td>
              <td class="audit__td">
                <span :class="['audit__action-badge', `audit__action-badge--${entry.action}`]">
                  {{ t(`admin.audit.actions.${entry.action}`, entry.action) }}
                </span>
              </td>
              <td class="audit__td">
                <span class="audit__entity-type">{{ entry.entity_type }}</span>
              </td>
              <td class="audit__td">
                <span class="audit__entity-id">{{ entry.entity_id }}</span>
              </td>
              <td class="audit__td">
                <span class="audit__summary">
                  {{ getSummary(entry) }}
                </span>
              </td>
            </tr>

            <!-- Expandable Detail Row -->
            <tr
              v-if="expandedId === entry.id"
              class="audit__detail-row"
            >
              <td colspan="6">
                <div class="audit__detail">
                  <h4 class="audit__detail-title">{{ t('admin.audit.detailJson') }}</h4>
                  <pre class="audit__detail-json">{{ formatJson(entry.details) }}</pre>
                  <div
                    v-if="entry.changes"
                    class="audit__detail-changes"
                  >
                    <h4 class="audit__detail-title">{{ t('admin.audit.changes') }}</h4>
                    <div class="audit__detail-diff">
                      <div
                        v-for="(change, field) in entry.changes"
                        :key="field"
                        class="audit__detail-change"
                      >
                        <span class="audit__detail-field">{{ field }}</span>
                        <span class="audit__detail-old">{{ change.old }}</span>
                        <span class="audit__detail-arrow">&rarr;</span>
                        <span class="audit__detail-new">{{ change.new }}</span>
                      </div>
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
        class="audit__pagination"
      >
        <button
          class="audit__page-btn"
          :disabled="!hasPrev"
          @click="prevPage"
        >
          {{ t('common.previous') }}
        </button>
        <span class="audit__page-info">
          {{ t('common.pageOf', { current: page, total: totalPages }) }}
        </span>
        <button
          class="audit__page-btn"
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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useFilters } from '@/composables/useFilters'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import http from '@/services/http'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const exporting = ref(false)
const auditEntries = ref([])
const expandedId = ref(null)

async function fetchAuditLog(params = {}) {
  loading.value = true
  try {
    const { data } = await http.get('/api/v1/admin/audit', { params })
    auditEntries.value = data.items || data || []
    if (data.meta?.total) {
      setTotal(data.meta.total)
    }
    return data
  } catch {
    toast.error(t('admin.audit.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

const { filters, setFilter, resetFilters } = useFilters(fetchAuditLog, {
  date_from: '',
  date_to: '',
  user: '',
  action: ''
})

const {
  page,
  totalPages,
  hasNext,
  hasPrev,
  nextPage,
  prevPage,
  setTotal
} = usePagination(fetchAuditLog)

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(dateStr))
}

function getSummary(entry) {
  if (!entry.details) return '-'
  if (typeof entry.details === 'string') return entry.details
  if (entry.details.summary) return entry.details.summary
  return JSON.stringify(entry.details).substring(0, 80) + '...'
}

function formatJson(obj) {
  if (!obj) return '{}'
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

async function handleExport() {
  exporting.value = true
  try {
    const response = await http.get('/api/v1/admin/audit/export', {
      params: { ...filters.value },
      responseType: 'blob'
    })
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'audit-log.csv'
    link.click()
    window.URL.revokeObjectURL(url)
    toast.success(t('admin.audit.messages.exported'))
  } catch {
    toast.error(t('admin.audit.messages.exportError'))
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  fetchAuditLog()
})
</script>

<style lang="scss" scoped>
.audit {
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
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
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

  &__filter-input,
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
  }

  &__timestamp {
    font-family: monospace;
    font-size: $font-size-xs;
    color: $gray-500;
  }

  &__action-badge {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: 500;

    &--create {
      background: rgba($success, 0.1);
      color: $success;
    }

    &--update {
      background: rgba($info, 0.1);
      color: $info;
    }

    &--delete {
      background: rgba($danger, 0.1);
      color: $danger;
    }

    &--approve {
      background: rgba($success, 0.1);
      color: $success;
    }

    &--reject {
      background: rgba($danger, 0.1);
      color: $danger;
    }

    &--login {
      background: rgba($primary, 0.1);
      color: $primary;
    }

    &--payment {
      background: rgba($warning, 0.1);
      color: $warning;
    }
  }

  &__entity-type {
    font-size: $font-size-xs;
    background: $gray-100;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-sm;
    color: $gray-600;
  }

  &__entity-id {
    font-family: monospace;
    font-size: $font-size-xs;
    color: $gray-500;
  }

  &__summary {
    font-size: $font-size-xs;
    color: $gray-500;
    max-width: 15rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
  }

  &__detail-row {
    background: $gray-50;
  }

  &__detail {
    padding: $spacing-lg;
  }

  &__detail-title {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-700;
    margin-bottom: $spacing-sm;
  }

  &__detail-json {
    background: $gray-800;
    color: $gray-100;
    padding: $spacing-md;
    border-radius: $radius-md;
    font-size: $font-size-xs;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }

  &__detail-changes {
    margin-top: $spacing-md;
  }

  &__detail-diff {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__detail-change {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-sm;
    background: $white;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
  }

  &__detail-field {
    font-weight: 500;
    color: $gray-700;
    min-width: 8rem;
  }

  &__detail-old {
    color: $danger;
    text-decoration: line-through;
  }

  &__detail-arrow {
    color: $gray-400;
  }

  &__detail-new {
    color: $success;
    font-weight: 500;
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
