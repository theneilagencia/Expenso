<template>
  <div class="auth-layout">
    <div class="auth-layout__header">
      <LocaleSwitcher />
    </div>
    <div class="auth-layout__container">
      <div class="auth-layout__card">
        <div class="auth-layout__logo">
          <h1>Expenso</h1>
          <p>{{ t('auth.signInToContinue') }}</p>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.auth-layout {
  min-height: 100vh;
  background: $gray-50;

  &__header {
    display: flex;
    justify-content: flex-end;
    padding: $spacing-md $spacing-xl;
  }

  &__container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 60px);
  }

  &__card {
    width: 100%;
    max-width: 420px;
    padding: $spacing-2xl;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-lg;
  }

  &__logo {
    text-align: center;
    margin-bottom: $spacing-xl;

    h1 {
      font-size: $font-size-3xl;
      color: $primary;
    }

    p {
      color: $gray-500;
      margin-top: $spacing-xs;
    }
  }
}
</style>
