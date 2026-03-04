<template>
  <div class="approval-queue">
    <div v-if="loading" class="approval-queue__loading">{{ t('common.loading') }}</div>
    <div v-else-if="!items.length" class="approval-queue__empty">
      {{ t('approvals.noPending') }}
    </div>
    <div v-else class="approval-queue__list">
      <div
        v-for="item in items"
        :key="item.id"
        class="approval-queue__item"
        @click="$emit('select', item)"
      >
        <div class="approval-queue__info">
          <span class="approval-queue__requester">{{ item.user?.full_name }}</span>
          <span class="approval-queue__title">{{ item.title }}</span>
        </div>
        <div class="approval-queue__right">
          <span class="approval-queue__amount">{{ formatCurrency(item.total_amount) }}</span>
          <span class="approval-queue__date">{{ formatDate(item.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { formatCurrency, formatDate } from '@/utils/formatters'

const { t } = useI18n()

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['select'])
</script>

<style lang="scss" scoped>
.approval-queue {
  &__loading, &__empty {
    text-align: center;
    color: $gray-500;
    padding: $space-xl;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-md $space-lg;
    border-bottom: 1px solid $gray-100;
    cursor: pointer;

    &:hover { background: $gray-50; }
    &:last-child { border-bottom: none; }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__requester {
    font-size: 0.875rem;
    font-weight: 600;
    color: $gray-800;
  }

  &__title {
    font-size: 0.8125rem;
    color: $gray-600;
  }

  &__right {
    text-align: right;
  }

  &__amount {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: $gray-900;
  }

  &__date {
    font-size: 0.75rem;
    color: $gray-500;
  }
}
</style>
