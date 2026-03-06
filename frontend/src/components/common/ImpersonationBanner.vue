<template>
  <div
    v-if="isImpersonating"
    class="impersonation-banner"
  >
    <div class="impersonation-banner__content">
      <span class="impersonation-banner__icon">&#9888;</span>
      <span class="impersonation-banner__text">
        {{ t('auth.impersonation.viewing', { name: impersonatedUserName }) }}
      </span>
      <span class="impersonation-banner__readonly">
        ({{ t('auth.impersonation.readOnly') }})
      </span>
      <button
        class="impersonation-banner__exit"
        @click="exitImpersonation"
      >
        {{ t('auth.impersonation.exit') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'

const { t } = useI18n()
const authStore = useAuthStore()

const isImpersonating = computed(() => !!authStore.user?.impersonating)
const impersonatedUserName = computed(() => authStore.user?.impersonated_user?.name || '')

function exitImpersonation() {
  authStore.updateUser({
    impersonating: false,
    impersonated_user: null
  })
}
</script>

<style lang="scss" scoped>
.impersonation-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-modal + 1;
  background: $warning;
  color: $gray-900;

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-lg;
    font-size: $font-size-sm;
    font-weight: 500;
  }

  &__icon {
    font-size: $font-size-base;
  }

  &__text {
    color: $gray-900;
  }

  &__readonly {
    color: $gray-700;
    font-style: italic;
  }

  &__exit {
    padding: $spacing-xs $spacing-md;
    background: $white;
    color: $gray-800;
    border: 1px solid $gray-300;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: 600;
    cursor: pointer;
    margin-left: $spacing-sm;
    transition: all 0.2s;

    &:hover {
      background: $gray-50;
      border-color: $gray-400;
    }
  }
}
</style>
