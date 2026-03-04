<template>
  <div class="request-card" @click="$emit('click', request)">
    <div class="request-card__header">
      <h3 class="request-card__title">{{ request.title }}</h3>
      <AppBadge :variant="statusVariant">{{ t(`requests.status.${request.status}`) }}</AppBadge>
    </div>
    <div class="request-card__body">
      <p class="request-card__description">{{ request.description }}</p>
      <div class="request-card__meta">
        <span class="request-card__category">{{ request.category?.name }}</span>
        <span class="request-card__amount">{{ formatCurrency(request.total_amount) }}</span>
      </div>
    </div>
    <div class="request-card__footer">
      <span class="request-card__date">{{ formatDate(request.created_at) }}</span>
      <span v-if="request.sla_deadline" class="request-card__sla" :class="slaClass">
        {{ slaLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppBadge from '@/components/common/AppBadge.vue'
import { REQUEST_STATUS } from '@/constants/status'
import { formatCurrency, formatDate } from '@/utils/formatters'

const { t } = useI18n()

const props = defineProps({
  request: { type: Object, required: true }
})

defineEmits(['click'])

const statusVariant = computed(() => {
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
  return map[props.request.status] || 'neutral'
})

const slaClass = computed(() => {
  if (!props.request.sla_deadline) return ''
  const deadline = new Date(props.request.sla_deadline)
  const now = new Date()
  if (now > deadline) return 'request-card__sla--overdue'
  const hours = (deadline - now) / (1000 * 60 * 60)
  if (hours <= 4) return 'request-card__sla--warning'
  return ''
})

const slaLabel = computed(() => {
  if (!props.request.sla_deadline) return ''
  const deadline = new Date(props.request.sla_deadline)
  const now = new Date()
  const hours = Math.floor((deadline - now) / (1000 * 60 * 60))
  if (hours < 0) return t('requests.sla.overdue')
  return t('requests.sla.hoursRemaining', { hours })
})
</script>

<style lang="scss" scoped>
.request-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-md;
  padding: $space-lg;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover {
    box-shadow: $shadow-md;
    border-color: $primary-light;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $space-sm;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $gray-900;
    margin: 0;
  }

  &__description {
    font-size: 0.875rem;
    color: $gray-600;
    margin: 0 0 $space-md;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__category {
    font-size: 0.75rem;
    color: $gray-500;
    background: $gray-100;
    padding: 2px $space-sm;
    border-radius: $radius-sm;
  }

  &__amount {
    font-size: 1.125rem;
    font-weight: 700;
    color: $gray-900;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $space-md;
    padding-top: $space-sm;
    border-top: 1px solid $gray-100;
  }

  &__date {
    font-size: 0.75rem;
    color: $gray-500;
  }

  &__sla {
    font-size: 0.75rem;
    font-weight: 500;

    &--warning { color: $warning; }
    &--overdue { color: $danger; font-weight: 600; }
  }
}
</style>
