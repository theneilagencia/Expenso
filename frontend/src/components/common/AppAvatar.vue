<template>
  <BtsAvatar
    :src="src"
    :alt="name"
    :initials="initials"
    :size="size"
    shape="circle"
  />
</template>

<script setup>
import { computed } from 'vue'
import { BtsAvatar } from '@/design-system'

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  src: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  }
})

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
})
</script>
