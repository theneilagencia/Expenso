<template>
  <div class="integration-card">
    <div class="integration-card__header">
      <div class="integration-card__icon">{{ icon }}</div>
      <div class="integration-card__info">
        <h3>{{ integration.name }}</h3>
        <span class="integration-card__type">{{ integration.provider }}</span>
      </div>
      <span
        class="integration-card__status"
        :class="integration.is_active ? 'integration-card__status--active' : 'integration-card__status--inactive'"
      >
        {{ integration.is_active ? t('admin.integrations.connected') : t('admin.integrations.disconnected') }}
      </span>
    </div>
    <p class="integration-card__description">{{ integration.description }}</p>
    <div class="integration-card__actions">
      <button class="integration-card__btn" @click="$emit('configure', integration)">
        {{ t('admin.integrations.configure') }}
      </button>
      <button
        class="integration-card__btn integration-card__btn--test"
        :disabled="testing"
        @click="$emit('test', integration)"
      >
        {{ testing ? t('admin.integrations.testing') : t('admin.integrations.testConnection') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  integration: { type: Object, required: true },
  testing: { type: Boolean, default: false }
})

defineEmits(['configure', 'test'])

const icon = computed(() => {
  const icons = { revolut: 'R', stripe: 'S', bank: 'B' }
  return icons[props.integration.provider?.toLowerCase()] || '?'
})
</script>

<style lang="scss" scoped>
.integration-card {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-md;
  padding: $space-lg;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-md;
    margin-bottom: $space-md;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: $radius-md;
    background: $gray-100;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: $primary;
  }

  &__info {
    flex: 1;

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
  }

  &__type {
    font-size: 0.75rem;
    color: $gray-500;
  }

  &__status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px $space-sm;
    border-radius: $radius-full;

    &--active {
      background: lighten($success, 35%);
      color: $success;
    }

    &--inactive {
      background: $gray-100;
      color: $gray-500;
    }
  }

  &__description {
    font-size: 0.875rem;
    color: $gray-600;
    margin: 0 0 $space-md;
  }

  &__actions {
    display: flex;
    gap: $space-sm;
  }

  &__btn {
    padding: $space-xs $space-md;
    border-radius: $radius-md;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    background: $white;
    color: $gray-700;
    border: 1px solid $gray-300;

    &:hover { background: $gray-50; }

    &--test {
      color: $primary;
      border-color: $primary;

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  }
}
</style>
