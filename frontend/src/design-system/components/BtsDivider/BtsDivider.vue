<template>
  <div class="bts-divider" :class="rootClasses" role="separator" :aria-orientation="orientation">
    <span v-if="label && orientation === 'horizontal'" class="bts-divider__label">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value),
  },
  variant: {
    type: String,
    default: 'solid',
    validator: (value) => ['solid', 'dashed'].includes(value),
  },
  spacing: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  label: {
    type: String,
    default: '',
  },
});

const rootClasses = computed(() => ({
  [`bts-divider--${props.orientation}`]: true,
  [`bts-divider--${props.variant}`]: true,
  [`bts-divider--spacing-${props.spacing}`]: true,
  'bts-divider--with-label': !!props.label && props.orientation === 'horizontal',
}));
</script>

<style lang="scss" scoped>
.bts-divider {
  font-family: var(--font-family-primary);

  /* Horizontal */
  &--horizontal {
    display: flex;
    align-items: center;
    width: 100%;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 0;
      border-top: 1px solid var(--color-neutral-gray-light, #e5e7eb);
    }
  }

  &--horizontal#{&}--dashed {
    &::before,
    &::after {
      border-top-style: dashed;
    }
  }

  /* With label */
  &--with-label::before {
    margin-right: 12px;
  }

  &--with-label::after {
    margin-left: 12px;
  }

  /* Without label — single line */
  &--horizontal:not(#{&}--with-label)::after {
    display: none;
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--color-neutral-gray-dark);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Vertical */
  &--vertical {
    display: inline-flex;
    align-self: stretch;
    width: 0;
    min-height: 20px;
    border-left: 1px solid var(--color-neutral-gray-light, #e5e7eb);
  }

  &--vertical#{&}--dashed {
    border-left-style: dashed;
  }

  /* Spacing — horizontal */
  &--horizontal#{&}--spacing-sm { margin: 8px 0; }
  &--horizontal#{&}--spacing-md { margin: 16px 0; }
  &--horizontal#{&}--spacing-lg { margin: 24px 0; }

  /* Spacing — vertical */
  &--vertical#{&}--spacing-sm { margin: 0 8px; }
  &--vertical#{&}--spacing-md { margin: 0 16px; }
  &--vertical#{&}--spacing-lg { margin: 0 24px; }
}
</style>

