<template>
  <BtsBadge :variant="mappedVariant" :class="sizeClass">
    <slot />
  </BtsBadge>
</template>

<script setup>
import { computed } from 'vue'
import { BtsBadge } from '@/design-system'

const props = defineProps({
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

const mappedVariant = computed(() => {
  const variantMap = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
    neutral: 'default'
  }
  return variantMap[props.variant] || 'default'
})

const sizeClass = computed(() => `app-badge--${props.size}`)
</script>

<style lang="scss" scoped>
.app-badge--sm {
  padding: 1px 6px;
  font-size: 11px;
}

.app-badge--md {
  padding: 2px 8px;
  font-size: 12px;
}
</style>
