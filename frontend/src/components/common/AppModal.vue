<template>
  <BtsDialog
    :modelValue="visible"
    :title="title"
    :size="size"
    :closable="closable"
    :persistent="!closable"
    scrollable
    @update:modelValue="handleVisibilityChange"
    @close="handleClose"
  >
    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </BtsDialog>
</template>

<script setup>
import { BtsDialog } from '@/design-system'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  },
  closable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible'])

function handleVisibilityChange(val) {
  emit('update:visible', val)
}

function handleClose() {
  if (props.closable) {
    emit('update:visible', false)
  }
}
</script>
