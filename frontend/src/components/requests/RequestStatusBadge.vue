<template>
  <AppBadge :variant="variant" :size="size">
    {{ t(`requests.status.${status}`) }}
  </AppBadge>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/common/AppBadge.vue'
import { REQUEST_STATUS } from '@/constants/status'

const { t } = useI18n()

const props = defineProps({
  status: { type: String, required: true },
  size: { type: String, default: 'md' }
})

const variant = computed(() => {
  const map = {
    [REQUEST_STATUS.DRAFT]: 'neutral',
    [REQUEST_STATUS.PENDING_AI]: 'info',
    [REQUEST_STATUS.PENDING_MANAGER]: 'warning',
    [REQUEST_STATUS.PENDING_FINANCE]: 'warning',
    [REQUEST_STATUS.IN_CORRECTION]: 'danger',
    [REQUEST_STATUS.IN_PAYMENT]: 'info',
    [REQUEST_STATUS.PAID]: 'success',
    [REQUEST_STATUS.REJECTED_AI]: 'danger',
    [REQUEST_STATUS.REJECTED_MANAGER]: 'danger',
    [REQUEST_STATUS.REJECTED_FINANCE]: 'danger',
    [REQUEST_STATUS.CANCELLED]: 'neutral'
  }
  return map[props.status] || 'neutral'
})
</script>
