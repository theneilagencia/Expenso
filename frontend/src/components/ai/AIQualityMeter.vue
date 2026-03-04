<template>
  <div class="quality-meter">
    <div class="quality-meter__bar">
      <div class="quality-meter__fill" :style="{ width: `${score}%` }" :class="qualityClass"></div>
    </div>
    <span class="quality-meter__value" :class="qualityClass">{{ score }}%</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: { type: Number, default: 0 }
})

const qualityClass = computed(() => {
  if (props.score >= 70) return 'quality-meter--high'
  if (props.score >= 40) return 'quality-meter--medium'
  return 'quality-meter--low'
})
</script>

<style lang="scss" scoped>
.quality-meter {
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

  &--high {
    background: $success;
    color: $success;
  }

  &--medium {
    background: $warning;
    color: $warning;
  }

  &--low {
    background: $danger;
    color: $danger;
  }
}
</style>
