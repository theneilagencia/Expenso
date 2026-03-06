<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="bts-icon-button__spinner">
      <svg class="bts-icon-button__spinner-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4" />
      </svg>
    </span>
    <template v-else>
      <BtsIcon
        v-if="icon"
        :name="icon"
        :prefix="iconPrefix"
        :size="iconSize"
        :color="iconColor"
      />
      <slot v-else />
    </template>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import BtsIcon from '../BtsIcon/BtsIcon.vue';

const props = defineProps({
  icon: {
    type: String,
    default: '',
  },
  iconPrefix: {
    type: String,
    default: 'far',
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

const buttonClasses = computed(() => [
  'bts-icon-button',
  `bts-icon-button--${props.variant}`,
  `bts-icon-button--${props.size}`,
  {
    'bts-icon-button--disabled': props.disabled,
    'bts-icon-button--loading': props.loading,
  },
]);

const iconSize = computed(() => props.size === 'sm' ? 'sm' : 'md');

const iconColor = computed(() => {
  if (props.disabled) {
    return props.variant === 'primary' ? 'var(--color-primary-white)' : 'var(--color-neutral-gray-semi-dark)';
  }
  if (props.variant === 'primary') {
    return 'var(--color-primary-white)';
  }
  return 'var(--color-secondary-blue-s01)'; // secondary and ghost
});

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<style lang="scss" scoped>
/* IconButton - Figma specs */
/* Types: Primary, Secondary */
/* Sizes: Default (48x48px, padding 16px, icon 24px), sm (32x32px, padding 8px, icon 16px) */
/* Border radius: 8px */
/* Primary: background #18365b, icon #ffffff */
/* Primary Disabled: background #c6c6c6, icon #ffffff */
/* Secondary Default: background #ffffff, border 1px #18365b, icon #18365b */
/* Secondary Focus: border 2px #2eb5f3, icon #18365b */
/* Secondary Disabled: border 1px #9b9b9b, icon #9b9b9b */
.bts-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;

  &:focus-visible {
    outline: 2px solid var(--color-secondary-blue-s05);
    outline-offset: 2px;
  }

  /* Sizes */
  &--sm {
    width: 32px;
    height: 32px;
    padding: 8px;
  }

  &--md {
    width: 48px;
    height: 48px;
    padding: 16px;
  }

  &--lg {
    width: 56px;
    height: 56px;
    padding: 16px;
  }

  /* Variants */
  &--primary {
    background-color: var(--color-secondary-blue-s01);
    color: var(--color-primary-white);

    &:hover:not(.bts-icon-button--disabled) {
      background-color: var(--color-secondary-blue-s02);
    }

    &:active:not(.bts-icon-button--disabled) {
      background-color: var(--color-secondary-blue-s01);
    }

    :deep(svg) {
      fill: var(--color-primary-white);
      stroke: var(--color-primary-white);
    }
  }

  &--secondary {
    background-color: var(--color-primary-white);
    border: 1px solid var(--color-secondary-blue-s01);
    color: var(--color-secondary-blue-s01);

    &:hover:not(.bts-icon-button--disabled) {
      background-color: var(--color-neutral-gray-light);
    }

    &:active:not(.bts-icon-button--disabled) {
      background-color: var(--color-primary-white);
    }

    &:focus-visible {
      border: 2px solid var(--color-secondary-blue-s05);
    }

    :deep(svg) {
      fill: var(--color-secondary-blue-s01);
      stroke: var(--color-secondary-blue-s01);
    }
  }

  &--ghost {
    background-color: transparent;
    border: none;
    color: var(--color-secondary-blue-s01);

    &:hover:not(.bts-icon-button--disabled) {
      background-color: var(--color-neutral-gray-light);
    }

    &:active:not(.bts-icon-button--disabled) {
      background-color: var(--color-neutral-gray-semi-light);
    }

    :deep(svg) {
      fill: var(--color-secondary-blue-s01);
      stroke: var(--color-secondary-blue-s01);
    }
  }

  /* Disabled state */
  &--disabled {
    cursor: not-allowed;
    pointer-events: none;

    &.bts-icon-button--primary {
      background-color: var(--color-neutral-gray-base);
    }

    &.bts-icon-button--secondary {
      border-color: var(--color-neutral-gray-semi-dark);

      :deep(svg) {
        fill: var(--color-neutral-gray-semi-dark);
        stroke: var(--color-neutral-gray-semi-dark);
      }
    }

    &.bts-icon-button--ghost {
      :deep(svg) {
        fill: var(--color-neutral-gray-semi-dark);
        stroke: var(--color-neutral-gray-semi-dark);
      }
    }
  }

  /* Loading state */
  &--loading {
    cursor: wait;
    pointer-events: none;
  }

  &__spinner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__spinner-icon {
    width: 24px;
    height: 24px;
    animation: bts-icon-button-spin 1s linear infinite;
  }

  &--sm &__spinner-icon {
    width: 16px;
    height: 16px;
  }

  &--lg &__spinner-icon {
    width: 24px;
    height: 24px;
  }

  @keyframes bts-icon-button-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>

