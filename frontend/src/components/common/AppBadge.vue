<template>
  <span
    class="app-badge"
    :class="[
      `app-badge--${variant}`,
      `app-badge--${size}`
    ]"
  >
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: (val) => ['primary', 'success', 'warning', 'danger', 'info', 'neutral'].includes(val)
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md'].includes(val)
  }
})
</script>

<style lang="scss" scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: $radius-full;
  white-space: nowrap;

  &--sm {
    padding: 1px $spacing-sm;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  &--md {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  &--primary {
    background-color: $primary-light;
    color: $primary-dark;
  }

  &--success {
    background-color: rgba($success, 0.1);
    color: $success;
  }

  &--warning {
    background-color: rgba($warning, 0.1);
    color: darken($warning, 10%);
  }

  &--danger {
    background-color: rgba($danger, 0.1);
    color: $danger;
  }

  &--info {
    background-color: rgba($info, 0.1);
    color: $info;
  }

  &--neutral {
    background-color: $gray-100;
    color: $gray-600;
  }
}
</style>
