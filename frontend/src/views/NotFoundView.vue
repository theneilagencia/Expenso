<template>
  <div class="not-found">
    <h1>404</h1>
    <p>{{ t('common.notFound') }}</p>
    <router-link :to="{ name: 'dashboard' }" class="not-found__link">
      {{ t('common.backToDashboard') }}
    </router-link>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;

  h1 {
    font-size: 6rem;
    font-weight: 700;
    color: $primary;
    margin: 0;
  }

  p {
    font-size: 1.25rem;
    color: $gray-600;
    margin: $space-md 0;
  }

  &__link {
    color: $primary;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
