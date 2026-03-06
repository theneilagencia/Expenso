<template>
  <div class="bts-progress" :class="rootClasses" role="progressbar"
    :aria-valuenow="indeterminate ? undefined : value"
    :aria-valuemin="indeterminate ? undefined : 0"
    :aria-valuemax="indeterminate ? undefined : max"
    :aria-label="label || 'Progress'"
  >
    <div v-if="label || showValue" class="bts-progress__header">
      <span v-if="label" class="bts-progress__label">{{ label }}</span>
      <span v-if="showValue && !indeterminate" class="bts-progress__value">{{ displayValue }}%</span>
    </div>
    <div class="bts-progress__track">
      <div class="bts-progress__bar" :style="barStyle" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  label: {
    type: String,
    default: '',
  },
  showValue: {
    type: Boolean,
    default: false,
  },
  indeterminate: {
    type: Boolean,
    default: false,
  },
});

const percentage = computed(() => {
  if (props.max <= 0) return 0;
  return Math.min(Math.max((props.value / props.max) * 100, 0), 100);
});

const displayValue = computed(() => Math.round(percentage.value));

const rootClasses = computed(() => ({
  [`bts-progress--${props.variant}`]: true,
  [`bts-progress--${props.size}`]: true,
  'bts-progress--indeterminate': props.indeterminate,
}));

const barStyle = computed(() => {
  if (props.indeterminate) return {};
  return { width: `${percentage.value}%` };
});
</script>

<style lang="scss" scoped>
.bts-progress {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: var(--font-family-primary);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--color-text-primary);
  }

  &__value {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--color-neutral-gray-dark);
  }

  &__track {
    width: 100%;
    border-radius: 999px;
    background: var(--color-neutral-gray-light);
    overflow: hidden;
  }

  &__bar {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  /* Sizes */
  &--sm &__track { height: 4px; }
  &--md &__track { height: 8px; }
  &--lg &__track { height: 12px; }

  /* Variants */
  &--primary &__bar { background: var(--color-secondary-blue-s01); }
  &--success &__bar { background: #1B9B45; }
  &--warning &__bar { background: #DB9814; }
  &--danger &__bar { background: #DB242A; }

  /* Indeterminate */
  &--indeterminate &__bar {
    width: 40% !important;
    animation: bts-progress-indeterminate 1.5s ease-in-out infinite;
  }
}

@keyframes bts-progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(350%);
  }
}
</style>

