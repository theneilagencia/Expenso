<template>
  <div class="timeline">
    <h3 class="timeline__title">{{ t('requests.timeline') }}</h3>
    <div v-if="loading" class="timeline__loading">{{ t('common.loading') }}</div>
    <div v-else-if="!entries.length" class="timeline__empty">{{ t('requests.noActivity') }}</div>
    <div v-else class="timeline__list">
      <div v-for="entry in entries" :key="entry.id" class="timeline__item">
        <div class="timeline__dot" :class="`timeline__dot--${entry.action_type}`"></div>
        <div class="timeline__content">
          <div class="timeline__header">
            <span class="timeline__action">{{ t(`requests.actions.${entry.action_type}`) }}</span>
            <span class="timeline__date">{{ formatDateTime(entry.created_at) }}</span>
          </div>
          <p v-if="entry.user_name" class="timeline__user">{{ entry.user_name }}</p>
          <p v-if="entry.comment" class="timeline__comment">{{ entry.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { formatDateTime } from '@/utils/formatters'

const { t } = useI18n()

defineProps({
  entries: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})
</script>

<style lang="scss" scoped>
.timeline {
  &__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 $space-lg;
  }

  &__loading, &__empty {
    color: $gray-500;
    font-size: 0.875rem;
    padding: $space-md 0;
  }

  &__list {
    position: relative;
    padding-left: $space-lg;

    &::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: $gray-200;
    }
  }

  &__item {
    position: relative;
    padding-bottom: $space-lg;

    &:last-child { padding-bottom: 0; }
  }

  &__dot {
    position: absolute;
    left: -#{$space-lg - 4px};
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: $radius-full;
    background: $gray-400;
    border: 2px solid $white;

    &--SUBMIT, &--CREATE { background: $primary; }
    &--APPROVE { background: $success; }
    &--REJECT, &--REJECT_AI { background: $danger; }
    &--REQUEST_EDIT { background: $warning; }
    &--CANCEL { background: $gray-500; }
    &--PAY { background: $accent; }
  }

  &__content {
    background: $gray-50;
    border-radius: $radius-md;
    padding: $space-sm $space-md;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__action {
    font-size: 0.875rem;
    font-weight: 600;
    color: $gray-800;
  }

  &__date {
    font-size: 0.75rem;
    color: $gray-500;
  }

  &__user {
    font-size: 0.75rem;
    color: $gray-600;
    margin: 2px 0 0;
  }

  &__comment {
    font-size: 0.875rem;
    color: $gray-700;
    margin: $space-xs 0 0;
    font-style: italic;
  }
}
</style>
