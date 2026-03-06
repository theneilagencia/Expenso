<template>
  <aside
    class="app-sidebar"
    :class="{ 'app-sidebar--collapsed': collapsed }"
  >
    <div class="app-sidebar__header">
      <span v-if="!collapsed" class="app-sidebar__brand">Expenso</span>
      <span v-else class="app-sidebar__brand app-sidebar__brand--short">E</span>
      <button
        class="app-sidebar__toggle"
        :aria-label="collapsed ? t('common.sidebar.expand') : t('common.sidebar.collapse')"
        @click="collapsed = !collapsed"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path v-if="collapsed" d="M9 18l6-6-6-6" />
          <path v-else d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>

    <nav class="app-sidebar__nav">
      <!-- Main navigation -->
      <ul class="app-sidebar__menu">
        <!-- Dashboard - visible to all -->
        <li class="app-sidebar__item">
          <router-link
            :to="{ name: 'dashboard' }"
            class="app-sidebar__link"
            :class="{ 'app-sidebar__link--active': isActive('dashboard') }"
          >
            <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <span v-if="!collapsed" class="app-sidebar__label">
              {{ t('common.sidebar.dashboard') }}
            </span>
          </router-link>
        </li>

        <!-- Requests - visible to all -->
        <li class="app-sidebar__item">
          <router-link
            :to="{ name: 'requests' }"
            class="app-sidebar__link"
            :class="{ 'app-sidebar__link--active': isActive('requests') }"
          >
            <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span v-if="!collapsed" class="app-sidebar__label">
              {{ t('common.sidebar.requests') }}
            </span>
          </router-link>
        </li>

        <!-- Approvals - manager+ -->
        <li v-if="canApprove()" class="app-sidebar__item">
          <router-link
            :to="{ name: 'approvals' }"
            class="app-sidebar__link"
            :class="{ 'app-sidebar__link--active': isActive('approvals') }"
          >
            <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span v-if="!collapsed" class="app-sidebar__label">
              {{ t('common.sidebar.approvals') }}
            </span>
          </router-link>
        </li>

        <!-- Payments - finance+ -->
        <li v-if="canProcessPayments()" class="app-sidebar__item">
          <router-link
            :to="{ name: 'payments' }"
            class="app-sidebar__link"
            :class="{ 'app-sidebar__link--active': isActive('payments') }"
          >
            <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span v-if="!collapsed" class="app-sidebar__label">
              {{ t('common.sidebar.payments') }}
            </span>
          </router-link>
        </li>

        <!-- Reports - finance+ -->
        <li v-if="canProcessPayments()" class="app-sidebar__item">
          <router-link
            :to="{ name: 'reports' }"
            class="app-sidebar__link"
            :class="{ 'app-sidebar__link--active': isActive('reports') }"
          >
            <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span v-if="!collapsed" class="app-sidebar__label">
              {{ t('common.sidebar.reports') }}
            </span>
          </router-link>
        </li>
      </ul>

      <!-- Admin section -->
      <template v-if="canManageAdmin()">
        <div class="app-sidebar__divider" />

        <div v-if="!collapsed" class="app-sidebar__section-title">
          {{ t('common.sidebar.admin') }}
        </div>

        <ul class="app-sidebar__menu">
          <li class="app-sidebar__item">
            <router-link
              :to="{ name: 'admin-users' }"
              class="app-sidebar__link"
              :class="{ 'app-sidebar__link--active': isActive('admin-users') }"
            >
              <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span v-if="!collapsed" class="app-sidebar__label">
                {{ t('common.sidebar.users') }}
              </span>
            </router-link>
          </li>

          <li class="app-sidebar__item">
            <router-link
              :to="{ name: 'admin-categories' }"
              class="app-sidebar__link"
              :class="{ 'app-sidebar__link--active': isActive('admin-categories') }"
            >
              <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
                <line x1="1" y1="12" x2="13" y2="12" />
                <polyline points="7 8 1 12 7 16" />
              </svg>
              <span v-if="!collapsed" class="app-sidebar__label">
                {{ t('common.sidebar.categories') }}
              </span>
            </router-link>
          </li>

          <li class="app-sidebar__item">
            <router-link
              :to="{ name: 'admin-sla' }"
              class="app-sidebar__link"
              :class="{ 'app-sidebar__link--active': isActive('admin-sla') }"
            >
              <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span v-if="!collapsed" class="app-sidebar__label">
                {{ t('common.sidebar.sla') }}
              </span>
            </router-link>
          </li>

          <li class="app-sidebar__item">
            <router-link
              :to="{ name: 'admin-integrations' }"
              class="app-sidebar__link"
              :class="{ 'app-sidebar__link--active': isActive('admin-integrations') }"
            >
              <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span v-if="!collapsed" class="app-sidebar__label">
                {{ t('common.sidebar.integrations') }}
              </span>
            </router-link>
          </li>

          <li class="app-sidebar__item">
            <router-link
              :to="{ name: 'admin-audit' }"
              class="app-sidebar__link"
              :class="{ 'app-sidebar__link--active': isActive('admin-audit') }"
            >
              <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span v-if="!collapsed" class="app-sidebar__label">
                {{ t('common.sidebar.audit') }}
              </span>
            </router-link>
          </li>

          <li class="app-sidebar__item">
            <router-link
              :to="{ name: 'admin-ai-usage' }"
              class="app-sidebar__link"
              :class="{ 'app-sidebar__link--active': isActive('admin-ai-usage') }"
            >
              <svg class="app-sidebar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 23h-4a7 7 0 0 1-6.73-4H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
              </svg>
              <span v-if="!collapsed" class="app-sidebar__label">
                {{ t('common.sidebar.aiUsage') }}
              </span>
            </router-link>
          </li>
        </ul>
      </template>
    </nav>

    <!-- Mobile overlay -->
    <div
      v-if="mobileOpen"
      class="app-sidebar__overlay"
      @click="mobileOpen = false"
    />
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePermission } from '@/composables/usePermission'

const { t } = useI18n()
const route = useRoute()
const { canApprove, canProcessPayments, canManageAdmin } = usePermission()

const collapsed = ref(false)
const mobileOpen = ref(false)

function isActive(routeName) {
  return route.name === routeName
}
</script>

<style lang="scss" scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  height: 100vh;
  background-color: $gray-900;
  color: $gray-300;
  position: sticky;
  top: 0;
  flex-shrink: 0;
  transition: width 0.2s ease;
  overflow-y: auto;

  &--collapsed {
    width: 68px;

    .app-sidebar__header {
      justify-content: center;
      padding: $spacing-md $spacing-sm;
    }

    .app-sidebar__link {
      justify-content: center;
      padding: $spacing-sm;
    }

    .app-sidebar__section-title {
      display: none;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid $gray-700;
    flex-shrink: 0;
  }

  &__brand {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $white;
    letter-spacing: -0.02em;

    &--short {
      font-size: $font-size-xl;
    }
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    color: $gray-400;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover {
      color: $white;
      background-color: $gray-700;
    }
  }

  &__nav {
    flex: 1;
    padding: $spacing-md 0;
  }

  &__menu {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__item {
    margin: 1px 0;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    color: $gray-400;
    text-decoration: none;
    font-size: $font-size-sm;
    font-weight: 500;
    border-radius: 0;
    transition: color 0.15s ease, background-color 0.15s ease;
    margin: 0 $spacing-sm;
    border-radius: $radius-md;

    &:hover {
      color: $white;
      background-color: $gray-800;
    }

    &--active {
      color: $white;
      background-color: $primary;

      &:hover {
        background-color: $primary-dark;
      }
    }
  }

  &__icon {
    flex-shrink: 0;
  }

  &__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__divider {
    height: 1px;
    background-color: $gray-700;
    margin: $spacing-md $spacing-lg;
  }

  &__section-title {
    padding: $spacing-xs $spacing-lg;
    font-size: $font-size-xs;
    font-weight: 600;
    color: $gray-500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: $spacing-xs;
  }

  &__overlay {
    display: none;

    @media (max-width: $breakpoint-lg) {
      display: block;
      position: fixed;
      inset: 0;
      background-color: rgba($black, 0.5);
      z-index: -1;
    }
  }

  @media (max-width: $breakpoint-lg) {
    position: fixed;
    left: 0;
    top: 0;
    z-index: $z-modal;
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &--collapsed {
      width: 260px;
    }
  }
}
</style>
