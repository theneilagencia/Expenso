<template>
  <div class="app-loader" :class="{ 'app-loader--fullscreen': fullscreen }">
    <div class="app-loader__spinner" />
    <p v-if="text" class="app-loader__text">{{ text }}</p>
  </div>
</template>

<script setup>
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

  &__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid $gray-200;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__text {
    margin-top: $spacing-md;
    color: $gray-500;
    font-size: $font-size-sm;
  }
}
</style>
