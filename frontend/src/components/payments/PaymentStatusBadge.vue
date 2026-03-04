<template>
  <AppBadge :variant="variant" :size="size">
    {{ t(`payments.status.${status}`) }}
  </AppBadge>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/common/AppBadge.vue'
import { PAYMENT_STATUS } from '@/constants/status'

const { t } = useI18n()

const props = defineProps({
  status: { type: String, required: true },
  size: { type: String, default: 'md' }
})

const variant = computed(() => {
  const map = {
    [PAYMENT_STATUS.SCHEDULED]: 'info',
    [PAYMENT_STATUS.PROCESSING]: 'warning',
    [PAYMENT_STATUS.COMPLETED]: 'success',
    [PAYMENT_STATUS.FAILED]: 'danger'
  }
  return map[props.status] || 'neutral'
})
</script>
