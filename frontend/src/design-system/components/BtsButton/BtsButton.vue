<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="bts-button__spinner">
      <svg class="bts-button__spinner-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4" />
      </svg>
    </span>
    <span v-if="$slots['icon-left'] && !loading" class="bts-button__icon bts-button__icon--left">
      <slot name="icon-left" />
    </span>
    <span class="bts-button__label" :class="{ 'bts-button__label--hidden': loading }">
      <slot />
    </span>
    <span v-if="$slots['icon-right'] && !loading" class="bts-button__icon bts-button__icon--right">
      <slot name="icon-right" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'tertiary', 'danger'].includes(value),
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
  fullWidth: {
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
  'bts-button',
  `bts-button--${props.variant}`,
  `bts-button--${props.size}`,
  {
    'bts-button--disabled': props.disabled,
    'bts-button--full-width': props.fullWidth,
    'bts-button--loading': props.loading,
  },
]);

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<style lang="scss" scoped>
/* Button - Figma specs */
/* Types: Primary, Secondary, Tertiary, Danger */
/* Sizes: sm (36px), md (48px - default), lg (56px) */
/* Typography: Inter SemiBold 14px, line-height 20px */
/* Border radius: 8px */
/* Primary Default: #18365b, Hover: #006394, Disabled: #c6c6c6 */
/* Secondary Default: white bg + #18365b border, Hover: #f4f4f4 bg */
/* Danger Hover: #db242a */
.bts-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-family-primary);
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  white-space: nowrap;
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
    padding: 8px 12px;
    height: 36px;
  }

  &--md {
    padding: 16px 24px;
    height: 48px;
  }

  &--lg {
    padding: 16px 32px;
    height: 56px;
  }

  /* Variants */
  &--primary {
    color: var(--color-primary-white);
    background-color: var(--color-secondary-blue-s01);

    &:hover:not(.bts-button--disabled) {
      background-color: var(--color-secondary-blue-s02);
    }

    &:active:not(.bts-button--disabled) {
      background-color: var(--color-secondary-blue-s01);
    }
  }

  &--secondary {
    color: var(--color-secondary-blue-s01);
    background-color: var(--color-primary-white);
    border: 1px solid var(--color-secondary-blue-s01);

    &:hover:not(.bts-button--disabled) {
      background-color: var(--color-neutral-gray-light);
    }

    &:active:not(.bts-button--disabled) {
      background-color: var(--color-primary-white);
    }
  }

  &--tertiary {
    color: var(--color-secondary-blue-s01);
    background-color: transparent;

    &:hover:not(.bts-button--disabled) {
      background-color: rgba(24, 54, 91, 0.08);
    }

    &:active:not(.bts-button--disabled) {
      background-color: transparent;
    }
  }

  &--danger {
    background-color: var(--color-primary-white);
    border: 1px solid var(--color-error-semi-dark);
    color: var(--color-error-semi-dark);

    &:hover:not(.bts-button--disabled) {
      background-color: var(--color-error-semi-dark);
      color: var(--color-primary-white);
    }

    &:active:not(.bts-button--disabled) {
      background-color: var(--color-primary-white);
      color: var(--color-error-semi-dark);
    }
  }

  /* Disabled state */
  &--disabled {
    background-color: var(--color-neutral-gray-base) !important;
    color: var(--color-primary-white) !important;
    border-color: var(--color-neutral-gray-base) !important;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--full-width {
    width: 100%;
  }

  /* Elements */
  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--left,
    &--right {
      width: 24px;
      height: 24px;
    }
  }

  &--sm &__icon {
    &--left,
    &--right {
      width: 16px;
      height: 16px;
    }
  }

  &__label {
    display: inline-flex;
    align-items: center;
  }
}
</style>

