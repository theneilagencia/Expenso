<template>
  <div class="monthly-chart">
    <div v-if="loading" class="monthly-chart__loading">
      {{ t('common.loading') }}
    </div>
    <div v-else-if="!data.length" class="monthly-chart__empty">
      {{ t('reports.charts.noData') }}
    </div>
    <Line
      v-else
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const { t } = useI18n()

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const chartData = computed(() => ({
  labels: props.data.map(item => `${MONTH_LABELS[item.month - 1]} ${item.year}`),
  datasets: [{
    label: t('reports.charts.totalSpending'),
    data: props.data.map(item => item.total),
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    fill: true,
    tension: 0.3,
    pointRadius: 4,
    pointHoverRadius: 6,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `R$ ${ctx.raw.toLocaleString()}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value,
      },
    },
  },
}))
</script>

<style lang="scss" scoped>
.monthly-chart {
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
