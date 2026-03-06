<template>
  <DefaultLayout>
    <div class="ai-usage">
      <div class="ai-usage__header">
        <div class="ai-usage__header-left">
          <h2 class="ai-usage__title">{{ t('admin.aiUsage.title') }}</h2>
          <p class="ai-usage__subtitle">{{ t('admin.aiUsage.subtitle') }}</p>
        </div>
        <div class="ai-usage__period-filter">
          <select
            class="ai-usage__filter-select"
            :value="days"
            @change="days = Number(($event.target).value); fetchUsage()"
          >
            <option :value="7">{{ t('admin.aiUsage.last7d') }}</option>
            <option :value="30">{{ t('admin.aiUsage.last30d') }}</option>
            <option :value="90">{{ t('admin.aiUsage.last90d') }}</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="ai-usage__loading">
        {{ t('common.loading') }}
      </div>

      <template v-else-if="usage">
        <!-- Summary Cards -->
        <div class="ai-usage__cards">
          <div class="ai-usage__card">
            <span class="ai-usage__card-label">{{ t('admin.aiUsage.totalCalls') }}</span>
            <span class="ai-usage__card-value">{{ usage.total_calls }}</span>
          </div>
          <div class="ai-usage__card">
            <span class="ai-usage__card-label">{{ t('admin.aiUsage.estimatedCost') }}</span>
            <span class="ai-usage__card-value">${{ usage.estimated_cost_usd?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="ai-usage__card">
            <span class="ai-usage__card-label">{{ t('admin.aiUsage.avgLatency') }}</span>
            <span class="ai-usage__card-value">{{ usage.avg_latency_ms?.toFixed(0) || '0' }}ms</span>
          </div>
          <div class="ai-usage__card">
            <span class="ai-usage__card-label">{{ t('admin.aiUsage.successRate') }}</span>
            <span class="ai-usage__card-value">{{ usage.success_rate?.toFixed(1) || '0' }}%</span>
          </div>
        </div>

        <!-- Role Breakdown Table -->
        <div class="ai-usage__section">
          <h3 class="ai-usage__section-title">{{ t('admin.aiUsage.byRole') }}</h3>
          <table class="ai-usage__table">
            <thead class="ai-usage__table-head">
              <tr>
                <th class="ai-usage__th">{{ t('admin.aiUsage.role') }}</th>
                <th class="ai-usage__th">{{ t('admin.aiUsage.calls') }}</th>
                <th class="ai-usage__th">{{ t('admin.aiUsage.inputTokens') }}</th>
                <th class="ai-usage__th">{{ t('admin.aiUsage.outputTokens') }}</th>
                <th class="ai-usage__th">{{ t('admin.aiUsage.estimatedCost') }}</th>
                <th class="ai-usage__th">{{ t('admin.aiUsage.errors') }}</th>
              </tr>
            </thead>
            <tbody class="ai-usage__table-body">
              <tr
                v-for="role in usage.by_role"
                :key="role.role"
                class="ai-usage__row"
              >
                <td class="ai-usage__td">
                  <span class="ai-usage__role-badge">{{ role.role }}</span>
                </td>
                <td class="ai-usage__td">{{ role.count }}</td>
                <td class="ai-usage__td">{{ role.input_tokens?.toLocaleString() }}</td>
                <td class="ai-usage__td">{{ role.output_tokens?.toLocaleString() }}</td>
                <td class="ai-usage__td">${{ role.estimated_cost?.toFixed(4) || '0.00' }}</td>
                <td class="ai-usage__td">{{ role.errors || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Time Series Table -->
        <div v-if="usage.time_series?.length" class="ai-usage__section">
          <h3 class="ai-usage__section-title">{{ t('admin.aiUsage.dailyBreakdown') }}</h3>
          <table class="ai-usage__table">
            <thead class="ai-usage__table-head">
              <tr>
                <th class="ai-usage__th">{{ t('admin.aiUsage.date') }}</th>
                <th class="ai-usage__th">{{ t('admin.aiUsage.calls') }}</th>
                <th class="ai-usage__th">{{ t('admin.aiUsage.inputTokens') }}</th>
                <th class="ai-usage__th">{{ t('admin.aiUsage.outputTokens') }}</th>
                <th class="ai-usage__th">{{ t('admin.aiUsage.estimatedCost') }}</th>
              </tr>
            </thead>
            <tbody class="ai-usage__table-body">
              <tr
                v-for="day in usage.time_series"
                :key="day.date"
                class="ai-usage__row"
              >
                <td class="ai-usage__td">{{ day.date }}</td>
                <td class="ai-usage__td">{{ day.count }}</td>
                <td class="ai-usage__td">{{ day.input_tokens?.toLocaleString() }}</td>
                <td class="ai-usage__td">{{ day.output_tokens?.toLocaleString() }}</td>
                <td class="ai-usage__td">${{ day.estimated_cost?.toFixed(4) || '0.00' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="ai-usage__empty">
        {{ t('admin.aiUsage.noData') }}
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useToast } from '@/composables/useToast'
import { aiService } from '@/services/ai'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const usage = ref(null)
const days = ref(30)

async function fetchUsage() {
  loading.value = true
  try {
    usage.value = await aiService.getAIUsage({ days: days.value })
  } catch {
    toast.error(t('admin.aiUsage.fetchError'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsage()
})
</script>

<style lang="scss" scoped>
.ai-usage {
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

  &__filter-select {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;
    background: $white;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-lg;
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  &__card {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    box-shadow: $shadow-sm;
  }

  &__card-label {
    font-size: $font-size-sm;
    color: $gray-500;
    font-weight: 500;
  }

  &__card-value {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $gray-900;
    font-variant-numeric: tabular-nums;
  }

  &__section {
    margin-bottom: $spacing-xl;
  }

  &__section-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-md;
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
    &:not(:last-child) {
      border-bottom: 1px solid $gray-100;
    }

    &:hover {
      background: $gray-50;
    }
  }

  &__td {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-sm;
    color: $gray-700;
    font-variant-numeric: tabular-nums;
  }

  &__role-badge {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: 600;
    background: rgba($primary, 0.1);
    color: $primary;
    text-transform: uppercase;
  }
}
</style>
