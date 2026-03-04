<template>
  <div class="app-table">
    <div class="app-table__wrapper">
      <table class="app-table__table">
        <thead class="app-table__head">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="app-table__th"
              :class="{
                'app-table__th--sortable': column.sortable,
                'app-table__th--sorted': sortKey === column.key
              }"
              :style="column.width ? { width: column.width } : {}"
              @click="column.sortable ? toggleSort(column.key) : null"
            >
              <span class="app-table__th-content">
                {{ column.label }}
                <span
                  v-if="column.sortable"
                  class="app-table__sort-icon"
                  :aria-label="sortKey === column.key && sortOrder === 'asc'
                    ? t('common.sortDescending')
                    : t('common.sortAscending')"
                >
                  <svg
                    v-if="sortKey === column.key && sortOrder === 'asc'"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                  <svg
                    v-else-if="sortKey === column.key && sortOrder === 'desc'"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                  <svg
                    v-else
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    opacity="0.3"
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="app-table__body">
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr
              v-for="i in 5"
              :key="`skeleton-${i}`"
              class="app-table__row app-table__row--skeleton"
            >
              <td
                v-for="column in columns"
                :key="`skeleton-${i}-${column.key}`"
                class="app-table__td"
              >
                <span class="app-table__skeleton" />
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <tr v-else-if="!rows || rows.length === 0" class="app-table__row--empty">
            <td :colspan="columns.length" class="app-table__td app-table__td--empty">
              {{ emptyMessage || t('common.table.empty') }}
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-else
            v-for="(row, rowIndex) in sortedRows"
            :key="row.id || rowIndex"
            class="app-table__row"
          >
            <td
              v-for="column in columns"
              :key="`${rowIndex}-${column.key}`"
              class="app-table__td"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    validator: (cols) => cols.every((c) => c.key && c.label)
  },
  rows: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: ''
  }
})

const sortKey = ref(null)
const sortOrder = ref('asc')

function toggleSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value || !props.rows) return props.rows

  return [...props.rows].sort((a, b) => {
    const valA = a[sortKey.value]
    const valB = b[sortKey.value]

    if (valA == null) return 1
    if (valB == null) return -1

    let comparison = 0
    if (typeof valA === 'string') {
      comparison = valA.localeCompare(valB)
    } else {
      comparison = valA > valB ? 1 : valA < valB ? -1 : 0
    }

    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})
</script>

<style lang="scss" scoped>
.app-table {
  width: 100%;

  &__wrapper {
    overflow-x: auto;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
  }

  &__head {
    background-color: $gray-50;
  }

  &__th {
    padding: $spacing-sm $spacing-md;
    text-align: left;
    font-size: $font-size-xs;
    font-weight: 600;
    color: $gray-600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid $gray-200;
    white-space: nowrap;

    &--sortable {
      cursor: pointer;
      user-select: none;

      &:hover {
        color: $gray-900;
        background-color: $gray-100;
      }
    }

    &--sorted {
      color: $primary;
    }
  }

  &__th-content {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__sort-icon {
    display: inline-flex;
    align-items: center;
  }

  &__body {
    background-color: $white;
  }

  &__row {
    transition: background-color 0.15s ease;

    &:not(:last-child) {
      border-bottom: 1px solid $gray-100;
    }

    &:hover {
      background-color: $gray-50;
    }

    &--skeleton {
      &:hover {
        background-color: transparent;
      }
    }

    &--empty {
      &:hover {
        background-color: transparent;
      }
    }
  }

  &__td {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-sm;
    color: $gray-700;
    vertical-align: middle;

    &--empty {
      text-align: center;
      padding: $spacing-2xl $spacing-md;
      color: $gray-400;
      font-style: italic;
    }
  }

  &__skeleton {
    display: block;
    height: 16px;
    width: 80%;
    background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%);
    background-size: 200% 100%;
    border-radius: $radius-sm;
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
