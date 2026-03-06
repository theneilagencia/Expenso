<template>
  <div class="strategist-card">
    <h3 class="strategist-card__title">{{ t('dashboard.strategist.title') }}</h3>

    <div v-if="loading" class="strategist-card__loading">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="!report" class="strategist-card__empty">
      {{ t('dashboard.strategist.noReport') }}
    </div>

    <div v-else class="strategist-card__content">
      <div v-if="report.trend" class="strategist-card__section">
        <span class="strategist-card__label">{{ t('dashboard.strategist.trend') }}</span>
        <span class="strategist-card__value">{{ report.trend }}</span>
      </div>

      <div v-if="report.forecast_next_month" class="strategist-card__section">
        <span class="strategist-card__label">{{ t('dashboard.strategist.forecast') }}</span>
        <span class="strategist-card__value">{{ report.forecast_next_month }}</span>
      </div>

      <div v-if="recommendations.length" class="strategist-card__section">
        <span class="strategist-card__label">{{ t('dashboard.strategist.recommendations') }}</span>
        <ul class="strategist-card__list">
          <li
            v-for="(rec, idx) in recommendations"
            :key="idx"
            class="strategist-card__list-item"
          >
            {{ rec }}
          </li>
        </ul>
      </div>

      <div v-if="report.savings_opportunities" class="strategist-card__section">
        <span class="strategist-card__label">{{ t('dashboard.strategist.savings') }}</span>
        <span class="strategist-card__value">{{ report.savings_opportunities }}</span>
      </div>

      <div class="strategist-card__meta">
        {{ t('dashboard.strategist.generatedAt') }}:
        {{ formatDate(createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { aiService } from '@/services/ai'

const { t } = useI18n()

const loading = ref(false)
const report = ref(null)
const createdAt = ref(null)

const recommendations = computed(() => {
  if (!report.value) return []
  const recs = report.value.recommendations || report.value.top_recommendations
  return Array.isArray(recs) ? recs : []
})

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchReport() {
  loading.value = true
  try {
    const data = await aiService.getStrategistReport()
    if (data?.report) {
      report.value = data.report
      createdAt.value = data.created_at
    }
  } catch {
    // Silent fail — card just shows empty state
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>

<style lang="scss" scoped>
.strategist-card {
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg;

  &__title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-md;
  }

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 6rem;
    color: $gray-400;
    font-size: $font-size-sm;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-500;
  }

  &__value {
    font-size: $font-size-sm;
    color: $gray-800;
  }

  &__list {
    margin: 0;
    padding-left: $spacing-lg;
    list-style: disc;
  }

  &__list-item {
    font-size: $font-size-sm;
    color: $gray-700;
    margin-bottom: $spacing-xs;
  }

  &__meta {
    font-size: $font-size-xs;
    color: $gray-400;
    margin-top: $spacing-sm;
    border-top: 1px solid $gray-100;
    padding-top: $spacing-sm;
  }
}
</style>
