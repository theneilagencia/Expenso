<template>
  <div class="status-chart">
    <div v-if="loading" class="status-chart__loading">
      {{ t('common.loading') }}
    </div>
    <div v-else-if="!hasData" class="status-chart__empty">
      {{ t('reports.charts.noData') }}
    </div>
    <Bar
      v-else
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const { t } = useI18n()

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const STATUS_COLORS = {
  DRAFT: '#9ca3af',
  PENDING_AI: '#fbbf24',
  PENDING_MANAGER: '#f59e0b',
  PENDING_FINANCE: '#f97316',
  IN_CORRECTION: '#fb923c',
  IN_PAYMENT: '#3b82f6',
  PAID: '#22c55e',
  REJECTED_AI: '#ef4444',
  REJECTED_MANAGER: '#dc2626',
  REJECTED_FINANCE: '#b91c1c',
  CANCELLED: '#6b7280',
}

const hasData = computed(() => Object.keys(props.data).length > 0)

const chartData = computed(() => {
  const entries = Object.entries(props.data)
  return {
    labels: entries.map(([status]) => status.replace(/_/g, ' ')),
    datasets: [{
      label: t('reports.charts.requests'),
      data: entries.map(([, count]) => count),
      backgroundColor: entries.map(([status]) => STATUS_COLORS[status] || '#9ca3af'),
      borderRadius: 4,
    }],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { beginAtZero: true, ticks: { precision: 0 } },
  },
}))
</script>

<style lang="scss" scoped>
.status-chart {
  min-height: 16rem;
  position: relative;

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 16rem;
    color: $gray-400;
    font-size: $font-size-sm;
  }
}
</style>
