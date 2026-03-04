<template>
  <div class="default-layout">
    <header class="default-layout__header">
      <div class="default-layout__header-left">
        <h1 class="default-layout__logo">Expenso</h1>
      </div>
      <div class="default-layout__header-right">
        <LocaleSwitcher />
      </div>
    </header>
    <main class="default-layout__main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
</script>

<style lang="scss" scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-xl;
    background: $white;
    border-bottom: 1px solid $gray-200;
    box-shadow: $shadow-sm;
  }

  &__logo {
    font-size: $font-size-xl;
    color: $primary;
  }

  &__header-right {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  &__main {
    flex: 1;
    padding: $spacing-xl;
  }
}
</style>
