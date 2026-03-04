<template>
  <DefaultLayout>
    <div class="dashboard">
      <h2>{{ t('requests.myRequests') }}</h2>
      <p class="dashboard__welcome">{{ t('auth.welcomeBack') }}</p>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.dashboard {
  &__welcome {
    color: $gray-500;
    margin-top: $spacing-sm;
  }
}
</style>
