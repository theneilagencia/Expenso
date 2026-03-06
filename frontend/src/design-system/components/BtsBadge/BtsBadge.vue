<template>
  <span class="bts-badge" :class="badgeClasses">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup>
/**
 * BtsBadge - Badge component based on Figma design
 *
 * Figma specs:
 * - Font: Montserrat SemiBold 12px
 * - Padding: 8px horizontal, 2px vertical
 * - Border radius: 4px
 * - Types: Success, Warning, Danger, Info, Default
 */
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'warning', 'danger', 'info', 'default', 'primary'].includes(value)
  },
  label: {
    type: String,
    default: ''
  }
});

const badgeClasses = computed(() => [`bts-badge--${props.variant}`]);
</script>

<style lang="scss" scoped>
.bts-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: var(--font-family-primary);
  font-size: 12px;
  font-weight: 600;
  line-height: 14.63px;
  white-space: nowrap;

  // Success - Figma: bg #d9fbd3, text #138242
  &--success {
    background-color: #d9fbd3;
    color: var(--color-success-dark);
  }

  // Warning - Figma: bg #fff6d1, text #b7790e
  &--warning {
    background-color: #fff6d1;
    color: var(--color-warning-dark);
  }

  // Danger - Figma: bg #ff9f83 (40% opacity), text #b7192b
  &--danger {
    background-color: rgba(255, 159, 131, 0.4);
    color: var(--color-error-dark);
  }

  // Info - Figma: bg #6bd0ff (40% opacity), text #185ab4
  &--info {
    background-color: rgba(107, 208, 255, 0.4);
    color: var(--color-primary-blue-highlight);
  }

  // Default - Figma: bg #ffffff, text #185ab4
  &--default {
    background-color: var(--color-primary-white);
    color: var(--color-primary-blue-highlight);
  }

  // Primary - bg #185ab4, text #ffffff
  &--primary {
    background-color: var(--color-primary-blue-highlight);
    color: var(--color-primary-white);
  }
}
</style>

