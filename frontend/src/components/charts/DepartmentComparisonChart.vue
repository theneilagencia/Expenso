<template>
  <div class="department-chart">
    <div v-if="loading" class="department-chart__loading">
      {{ t('common.loading') }}
    </div>
    <div v-else-if="!data.length" class="department-chart__empty">
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
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const chartData = computed(() => ({
  labels: props.data.map(item => item.department),
  datasets: [{
    label: t('reports.charts.totalSpending'),
    data: props.data.map(item => item.total),
    backgroundColor: '#6366f1',
    borderRadius: 4,
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
.department-chart {
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
