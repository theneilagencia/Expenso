<template>
  <div class="app-empty-state">
    <div v-if="icon" class="app-empty-state__icon">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <!-- inbox/empty icon as default -->
        <path v-if="icon === 'inbox'" d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path v-if="icon === 'inbox'" d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />

        <path v-if="icon === 'search'" d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
        <path v-if="icon === 'search'" d="M21 21l-4.35-4.35" />

        <path v-if="icon === 'file'" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline v-if="icon === 'file'" points="14 2 14 8 20 8" />

        <path v-if="icon === 'users'" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle v-if="icon === 'users'" cx="9" cy="7" r="4" />
        <path v-if="icon === 'users'" d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path v-if="icon === 'users'" d="M16 3.13a4 4 0 0 1 0 7.75" />

        <rect v-if="icon === 'chart'" x="18" y="3" width="4" height="18" rx="2" />
        <rect v-if="icon === 'chart'" x="10" y="8" width="4" height="13" rx="2" />
        <rect v-if="icon === 'chart'" x="2" y="13" width="4" height="8" rx="2" />
      </svg>
    </div>

    <h3 class="app-empty-state__title">
      {{ title || t('common.emptyState.title') }}
    </h3>

    <p v-if="description" class="app-empty-state__description">
      {{ description }}
    </p>
    <p v-else class="app-empty-state__description">
      {{ t('common.emptyState.description') }}
    </p>

    <div v-if="$slots.default" class="app-empty-state__action">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  icon: {
    type: String,
    default: 'inbox',
    validator: (val) => ['inbox', 'search', 'file', 'users', 'chart'].includes(val)
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.app-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: $spacing-2xl $spacing-lg;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: $radius-full;
    background-color: $gray-100;
    color: $gray-400;
    margin-bottom: $spacing-lg;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-700;
    margin: 0 0 $spacing-sm;
  }

  &__description {
    font-size: $font-size-sm;
    color: $gray-500;
    margin: 0;
    max-width: 360px;
    line-height: 1.5;
  }

  &__action {
    margin-top: $spacing-lg;
  }
}
</style>
