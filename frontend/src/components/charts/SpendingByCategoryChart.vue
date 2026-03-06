<template>
  <div class="category-chart">
    <div v-if="loading" class="category-chart__loading">
      {{ t('common.loading') }}
    </div>
    <div v-else-if="!data.length" class="category-chart__empty">
      {{ t('reports.charts.noData') }}
    </div>
    <Doughnut
      v-else
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const { t } = useI18n()

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
]

const chartData = computed(() => ({
  labels: props.data.map(item => item.category),
  datasets: [{
    data: props.data.map(item => item.total),
    backgroundColor: COLORS.slice(0, props.data.length),
    borderWidth: 2,
    borderColor: '#fff',
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
          const pct = total ? ((ctx.raw / total) * 100).toFixed(1) : 0
          return `${ctx.label}: R$ ${ctx.raw.toLocaleString()} (${pct}%)`
        },
      },
    },
  },
}))
</script>

<style lang="scss" scoped>
.category-chart {
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
