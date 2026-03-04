<template>
  <div class="ai-analysis" v-if="analysis">
    <div class="ai-analysis__header">
      <span class="ai-analysis__icon">AI</span>
      <h3 class="ai-analysis__title">{{ t('ai.analysis') }}</h3>
    </div>
    <div class="ai-analysis__body">
      <div class="ai-analysis__scores">
        <div class="ai-analysis__score">
          <span class="ai-analysis__score-label">{{ t('ai.riskScore') }}</span>
          <AIRiskScore :score="analysis.risk_score" />
        </div>
        <div class="ai-analysis__score">
          <span class="ai-analysis__score-label">{{ t('ai.qualityScore') }}</span>
          <AIQualityMeter :score="analysis.quality_score" />
        </div>
      </div>
      <div v-if="analysis.summary" class="ai-analysis__summary">
        <h4>{{ t('ai.summary') }}</h4>
        <p>{{ analysis.summary }}</p>
      </div>
      <div v-if="analysis.recommendations?.length" class="ai-analysis__recommendations">
        <h4>{{ t('ai.recommendations') }}</h4>
        <ul>
          <li v-for="(rec, i) in analysis.recommendations" :key="i">{{ rec }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import AIRiskScore from './AIRiskScore.vue'
import AIQualityMeter from './AIQualityMeter.vue'

const { t } = useI18n()

defineProps({
  analysis: { type: Object, default: null }
})
</script>

<style lang="scss" scoped>
.ai-analysis {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-md;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-sm;
    padding: $space-sm $space-md;
    background: $gray-50;
    border-bottom: 1px solid $gray-200;
  }

  &__icon {
    width: 24px;
    height: 24px;
    border-radius: $radius-sm;
    background: $accent;
    color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    font-weight: 700;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
  }

  &__body {
    padding: $space-md;
  }

  &__scores {
    display: flex;
    gap: $space-xl;
    margin-bottom: $space-md;
  }

  &__score {
    flex: 1;
  }

  &__score-label {
    display: block;
    font-size: 0.75rem;
    color: $gray-500;
    margin-bottom: $space-xs;
  }

  &__summary, &__recommendations {
    margin-top: $space-md;

    h4 {
      font-size: 0.8125rem;
      font-weight: 600;
      color: $gray-700;
      margin: 0 0 $space-xs;
    }

    p {
      font-size: 0.875rem;
      color: $gray-600;
      margin: 0;
      line-height: 1.5;
    }

    ul {
      margin: 0;
      padding-left: $space-lg;

      li {
        font-size: 0.875rem;
        color: $gray-600;
        line-height: 1.6;
      }
    }
  }
}
</style>
