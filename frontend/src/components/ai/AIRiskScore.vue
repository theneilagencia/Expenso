<template>
  <div class="risk-score">
    <div class="risk-score__bar">
      <div class="risk-score__fill" :style="{ width: `${score}%` }" :class="riskClass"></div>
    </div>
    <span class="risk-score__value" :class="riskClass">{{ score }}%</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: { type: Number, default: 0 }
})

const riskClass = computed(() => {
  if (props.score <= 30) return 'risk-score--low'
  if (props.score <= 70) return 'risk-score--medium'
  return 'risk-score--high'
})
</script>

<style lang="scss" scoped>
.risk-score {
  display: flex;
  align-items: center;
  gap: $space-sm;

  &__bar {
    flex: 1;
    height: 8px;
    background: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: $radius-full;
    transition: width 0.3s ease;
  }

  &__value {
    font-size: 0.875rem;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }

  &--low {
    background: $success;
    color: $success;
  }

  &--medium {
    background: $warning;
    color: $warning;
  }

  &--high {
    background: $danger;
    color: $danger;
  }
}
</style>
