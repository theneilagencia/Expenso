<template>
  <div class="default-layout">
    <AppSidebar />
    <div class="default-layout__wrapper">
      <header class="default-layout__header">
        <div class="default-layout__header-left">
          <h1 class="default-layout__logo">Expenso</h1>
        </div>
        <div class="default-layout__header-right">
          <div class="default-layout__notifications" ref="notificationsRef" @click="showNotifications = !showNotifications">
            <span class="default-layout__bell">&#128276;</span>
            <span v-if="unreadCount > 0" class="default-layout__badge">{{ unreadCount }}</span>
            <NotificationDropdown :visible="showNotifications" @close="showNotifications = false" />
          </div>
          <LocaleSwitcher />
          <div class="default-layout__user" @click="$router.push({ name: 'settings' })">
            <span class="default-layout__user-name">{{ authStore.user?.full_name }}</span>
          </div>
        </div>
      </header>
      <main class="default-layout__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import NotificationDropdown from '@/components/common/NotificationDropdown.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useNotifications } from '@/composables/useNotifications'

const authStore = useAuthStore()
const showNotifications = ref(false)
const notificationsRef = ref(null)
const { unreadCount } = useNotifications()

function handleClickOutside(e) {
  if (notificationsRef.value && !notificationsRef.value.contains(e.target)) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.default-layout {
  min-height: 100vh;
  display: flex;

  &__wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 260px;
    transition: margin-left 0.3s;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-sm $space-xl;
    background: $white;
    border-bottom: 1px solid $gray-200;
    box-shadow: $shadow-sm;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  &__logo {
    font-size: 1.25rem;
    color: $primary;
    margin: 0;
  }

  &__header-right {
    display: flex;
    align-items: center;
    gap: $space-md;
  }

  &__notifications {
    position: relative;
    cursor: pointer;
    padding: $space-xs;
  }

  &__bell {
    font-size: 1.25rem;
  }

  &__badge {
    position: absolute;
    top: -2px;
    right: -4px;
    background: $danger;
    color: $white;
    font-size: 0.625rem;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }

  &__user {
    cursor: pointer;
    padding: $space-xs $space-sm;
    border-radius: $radius-md;

    &:hover { background: $gray-50; }
  }

  &__user-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: $gray-700;
  }

  &__main {
    flex: 1;
    padding: $space-xl;
    background: $gray-50;
  }
}

@media (max-width: 768px) {
  .default-layout__wrapper {
    margin-left: 0;
  }
}
</style>
