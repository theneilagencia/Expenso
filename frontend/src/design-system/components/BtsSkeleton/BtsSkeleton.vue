<template>
  <div
    class="bts-skeleton"
    :class="rootClasses"
    :style="rootStyle"
    aria-hidden="true"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'circle', 'rectangle'].includes(value),
  },
  width: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: '',
  },
  borderRadius: {
    type: String,
    default: '',
  },
  animate: {
    type: Boolean,
    default: true,
  },
});

const rootClasses = computed(() => ({
  [`bts-skeleton--${props.variant}`]: true,
  'bts-skeleton--animate': props.animate,
}));

const rootStyle = computed(() => {
  const style = {};
  if (props.width) style.width = props.width;
  if (props.height) style.height = props.height;
  if (props.borderRadius) style.borderRadius = props.borderRadius;
  return style;
});
</script>

<style lang="scss" scoped>
.bts-skeleton {
  display: block;
  background: var(--color-neutral-gray-light, #e5e7eb);

  /* Variants */
  &--text {
    width: 100%;
    height: 16px;
    border-radius: 4px;
  }

  &--circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  &--rectangle {
    width: 100%;
    height: 120px;
    border-radius: 8px;
  }

  /* Animation */
  &--animate {
    background: linear-gradient(
      90deg,
      var(--color-neutral-gray-light, #e5e7eb) 25%,
      #f3f4f6 50%,
      var(--color-neutral-gray-light, #e5e7eb) 75%
    );
    background-size: 200% 100%;
    animation: bts-skeleton-shimmer 1.5s ease-in-out infinite;
  }
}

@keyframes bts-skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

