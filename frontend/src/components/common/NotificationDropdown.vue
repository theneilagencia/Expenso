<template>
  <div v-if="visible" class="notification-dropdown">
    <div class="notification-dropdown__header">
      <h3 class="notification-dropdown__title">{{ t('notifications.title') }}</h3>
      <button
        v-if="notifications.length > 0"
        class="notification-dropdown__mark-all"
        @click="handleMarkAllAsRead"
      >
        {{ t('notifications.markAllRead') }}
      </button>
    </div>
    <div class="notification-dropdown__list">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="notification-dropdown__item"
        :class="{ 'notification-dropdown__item--unread': !item.is_read }"
      >
        <div class="notification-dropdown__item-content">
          <span class="notification-dropdown__item-dot" v-if="!item.is_read" />
          <p class="notification-dropdown__item-message">{{ item.message }}</p>
        </div>
        <div class="notification-dropdown__item-meta">
          <span class="notification-dropdown__item-time">{{ formatTime(item.created_at) }}</span>
          <button
            v-if="!item.is_read"
            class="notification-dropdown__item-read"
            @click.stop="handleMarkAsRead(item.id)"
          >
            {{ t('notifications.markRead') }}
          </button>
        </div>
      </div>
      <div v-if="notifications.length === 0" class="notification-dropdown__empty">
        {{ t('notifications.noNotifications') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useNotifications } from '@/composables/useNotifications'

defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
const { t } = useI18n()
const { notifications, markAsRead, markAllAsRead } = useNotifications()

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return t('notifications.justNow') || 'just now'
  if (diffMin < 60) return `${diffMin}m`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

async function handleMarkAsRead(id) {
  await markAsRead(id)
}

async function handleMarkAllAsRead() {
  await markAllAsRead()
}
</script>

<style lang="scss" scoped>
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 360px;
  max-height: 480px;
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  z-index: 200;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-sm $space-md;
    border-bottom: 1px solid $gray-200;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
    color: $gray-800;
  }

  &__mark-all {
    background: none;
    border: none;
    color: $primary;
    font-size: 0.75rem;
    cursor: pointer;
    padding: $space-xs;
    border-radius: $radius-sm;

    &:hover {
      background: $gray-50;
    }
  }

  &__list {
    overflow-y: auto;
    max-height: 400px;
  }

  &__item {
    padding: $space-sm $space-md;
    border-bottom: 1px solid $gray-100;
    transition: background 0.15s;

    &:hover {
      background: $gray-50;
    }

    &--unread {
      background: rgba($primary, 0.04);
    }
  }

  &__item-content {
    display: flex;
    align-items: flex-start;
    gap: $space-xs;
  }

  &__item-dot {
    width: 8px;
    height: 8px;
    min-width: 8px;
    border-radius: $radius-full;
    background: $primary;
    margin-top: 4px;
  }

  &__item-message {
    font-size: 0.8125rem;
    color: $gray-700;
    margin: 0;
    line-height: 1.4;
  }

  &__item-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $space-xs;
    padding-left: 16px;
  }

  &__item-time {
    font-size: 0.6875rem;
    color: $gray-400;
  }

  &__item-read {
    background: none;
    border: none;
    color: $primary;
    font-size: 0.6875rem;
    cursor: pointer;
    padding: 2px $space-xs;
    border-radius: $radius-sm;

    &:hover {
      background: $gray-100;
    }
  }

  &__empty {
    padding: $space-xl;
    text-align: center;
    color: $gray-400;
    font-size: 0.875rem;
  }
}
</style>
