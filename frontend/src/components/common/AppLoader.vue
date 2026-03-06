<template>
  <div class="app-loader" :class="{ 'app-loader--fullscreen': fullscreen }">
    <BtsSpinner size="lg" variant="primary" :label="text || 'Loading'" />
    <p v-if="text" class="app-loader__text">{{ text }}</p>
  </div>
</template>

<script setup>
import { BtsSpinner } from '@/design-system'

defineProps({
  fullscreen: { type: Boolean, default: false },
  text: { type: String, default: '' }
})
</script>

<style lang="scss" scoped>
.app-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;

  &--fullscreen {
    position: fixed;
    inset: 0;
    background: rgba($white, 0.8);
    z-index: $z-modal;
  }

  &__text {
    margin-top: $spacing-md;
    color: $gray-500;
    font-size: $font-size-sm;
  }
}
</style>
