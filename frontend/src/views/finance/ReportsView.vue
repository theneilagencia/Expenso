<template>
  <DefaultLayout>
    <div class="reports">
      <div class="reports__header">
        <div class="reports__header-left">
          <h2 class="reports__title">{{ t('reports.title') }}</h2>
          <p class="reports__subtitle">{{ t('reports.subtitle') }}</p>
        </div>
        <div class="reports__header-actions">
          <button
            class="reports__export-btn"
            :disabled="exporting"
            @click="handleExportCsv"
          >
            {{ t('reports.exportCsv') }}
          </button>
          <button
            class="reports__export-btn reports__export-btn--secondary"
            :disabled="exporting"
            @click="handleExportPdf"
          >
            {{ t('reports.exportPdf') }}
          </button>
        </div>
      </div>

      <!-- Date Range Selector -->
      <div class="reports__date-range">
        <div class="reports__date-group">
          <label class="reports__date-label">{{ t('reports.dateFrom') }}</label>
          <input
            v-model="dateFrom"
            type="date"
            class="reports__date-input"
          />
        </div>
        <div class="reports__date-group">
          <label class="reports__date-label">{{ t('reports.dateTo') }}</label>
          <input
            v-model="dateTo"
            type="date"
            class="reports__date-input"
          />
        </div>
        <button
          class="reports__date-apply"
          @click="fetchAllReports"
        >
          {{ t('reports.apply') }}
        </button>
      </div>

      <div
        v-if="loading"
        class="reports__loading"
      >
        {{ t('common.loading') }}
      </div>

      <template v-else>
        <!-- Summary Stats Cards -->
        <div class="reports__stats">
          <div class="reports__stat-card">
            <span class="reports__stat-label">{{ t('reports.stats.totalExpenses') }}</span>
            <span class="reports__stat-value">{{ formatCurrency(dashboard.total_expenses) }}</span>
          </div>
          <div class="reports__stat-card">
            <span class="reports__stat-label">{{ t('reports.stats.avgPerRequest') }}</span>
            <span class="reports__stat-value">{{ formatCurrency(dashboard.avg_per_request) }}</span>
          </div>
          <div class="reports__stat-card">
            <span class="reports__stat-label">{{ t('reports.stats.topCategory') }}</span>
            <span class="reports__stat-value reports__stat-value--text">
              {{ dashboard.top_category || '-' }}
            </span>
          </div>
          <div class="reports__stat-card">
            <span class="reports__stat-label">{{ t('reports.stats.monthlyTrend') }}</span>
            <span :class="['reports__stat-value', trendClass]">
              {{ formatTrend(dashboard.monthly_trend) }}
            </span>
          </div>
        </div>

        <!-- Charts Area -->
        <div class="reports__charts">
          <div class="reports__chart-card">
            <h3 class="reports__chart-title">{{ t('reports.charts.byCategory') }}</h3>
            <SpendingByCategoryChart :data="categoryData" :loading="false" />
          </div>

          <div class="reports__chart-card">
            <h3 class="reports__chart-title">{{ t('reports.charts.byDepartment') }}</h3>
            <DepartmentComparisonChart :data="departmentData" :loading="false" />
          </div>

          <div class="reports__chart-card reports__chart-card--full">
            <h3 class="reports__chart-title">{{ t('reports.charts.byMonth') }}</h3>
            <MonthlyTrendChart :data="monthlyData" :loading="false" />
          </div>
        </div>
      </template>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import SpendingByCategoryChart from '@/components/charts/SpendingByCategoryChart.vue'
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart.vue'
import DepartmentComparisonChart from '@/components/charts/DepartmentComparisonChart.vue'
import { reportsService } from '@/services/reports'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const exporting = ref(false)
const dateFrom = ref('')
const dateTo = ref('')

const dashboard = ref({
  total_expenses: 0,
  avg_per_request: 0,
  top_category: '',
  monthly_trend: 0
})

const categoryData = ref([])
const departmentData = ref([])
const monthlyData = ref([])

const trendClass = computed(() => {
  const trend = dashboard.value.monthly_trend
  if (trend > 0) return 'reports__stat-value--up'
  if (trend < 0) return 'reports__stat-value--down'
  return ''
})

function getDateParams() {
  const params = {}
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value) params.date_to = dateTo.value
  return params
}

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

function formatTrend(value) {
  if (value == null) return '-'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

async function fetchAllReports() {
  loading.value = true
  const params = getDateParams()
  try {
    const [dashData, catData, deptData, monthData] = await Promise.all([
      reportsService.getDashboard(params),
      reportsService.getExpensesByCategory(params),
      reportsService.getExpensesByDepartment(params),
      reportsService.getExpensesByMonth(params)
    ])
    dashboard.value = dashData || dashboard.value
    categoryData.value = catData?.items || catData || []
    departmentData.value = deptData?.items || deptData || []
    monthlyData.value = monthData?.items || monthData || []
  } catch {
    toast.error(t('reports.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

async function handleExportCsv() {
  exporting.value = true
  try {
    const response = await reportsService.exportCsv(getDateParams())
    downloadBlob(response.data, 'expenses-report.csv', 'text/csv')
    toast.success(t('reports.messages.exported'))
  } catch {
    toast.error(t('reports.messages.exportError'))
  } finally {
    exporting.value = false
  }
}

async function handleExportPdf() {
  exporting.value = true
  try {
    const response = await reportsService.exportPdf(getDateParams())
    downloadBlob(response.data, 'expenses-report.pdf', 'application/pdf')
    toast.success(t('reports.messages.exported'))
  } catch {
    toast.error(t('reports.messages.exportError'))
  } finally {
    exporting.value = false
  }
}

function downloadBlob(data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchAllReports()
})
</script>

<style lang="scss" scoped>
.reports {
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

  &__header-actions {
    display: flex;
    gap: $spacing-sm;
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

    &--secondary {
      background: $white;
      color: $gray-700;
      border: 1px solid $gray-300;

      &:hover:not(:disabled) {
        background: $gray-50;
      }
    }
  }

  &__date-range {
    display: flex;
    gap: $spacing-md;
    align-items: flex-end;
    padding: $spacing-lg;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    margin-bottom: $spacing-xl;
  }

  &__date-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__date-label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-700;
  }

  &__date-input {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }
  }

  &__date-apply {
    padding: $spacing-sm $spacing-lg;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: $primary-dark;
    }
  }

  &__loading {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-lg;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  &__stat-card {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-lg;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }

  &__stat-label {
    font-size: $font-size-sm;
    color: $gray-500;
    font-weight: 500;
  }

  &__stat-value {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $gray-900;

    &--text {
      font-size: $font-size-lg;
    }

    &--up {
      color: $danger;
    }

    &--down {
      color: $success;
    }
  }

  &__charts {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
  }

  &__chart-card {
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    padding: $spacing-lg;

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__chart-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-md;
  }

}
</style>
