<template>
  <span class="bts-spinner" :class="rootClasses" role="status" :aria-label="label">
    <svg
      class="bts-spinner__svg"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="bts-spinner__track"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="4"
      />
      <circle
        class="bts-spinner__circle"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="4"
        stroke-linecap="round"
      />
    </svg>
    <span class="bts-spinner__sr-only">{{ label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary'].includes(value),
  },
  label: {
    type: String,
    default: 'Loading',
  },
});

const rootClasses = computed(() => ({
  [`bts-spinner--${props.size}`]: true,
  [`bts-spinner--${props.variant}`]: true,
}));
</script>

<style lang="scss" scoped>
.bts-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &__svg {
    animation: bts-spinner-rotate 1.4s linear infinite;
  }

  &__track {
    stroke: currentColor;
    opacity: 0.15;
  }

  &__circle {
    stroke: currentColor;
    stroke-dasharray: 80, 200;
    stroke-dashoffset: 0;
    animation: bts-spinner-dash 1.4s ease-in-out infinite;
  }

  &__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Sizes */
  &--sm {
    width: 16px;
    height: 16px;
  }

  &--md {
    width: 32px;
    height: 32px;
  }

  &--lg {
    width: 48px;
    height: 48px;
  }

  /* Variants */
  &--primary {
    color: var(--color-secondary-blue-s01);
  }

  &--secondary {
    color: var(--color-primary-white);
  }
}

@keyframes bts-spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes bts-spinner-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -124;
  }
}
</style>

