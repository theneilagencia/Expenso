<template>
  <Teleport to="body">
    <div class="app-toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="app-toast"
          :class="`app-toast--${toast.type}`"
          role="alert"
        >
          <div class="app-toast__icon">
            <!-- Success -->
            <svg
              v-if="toast.type === 'success'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <!-- Error -->
            <svg
              v-else-if="toast.type === 'error'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <!-- Warning -->
            <svg
              v-else-if="toast.type === 'warning'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <!-- Info -->
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>

          <span class="app-toast__message">{{ toast.message }}</span>

          <button
            class="app-toast__dismiss"
            :aria-label="t('common.toast.close')"
            @click="dismiss(toast.id)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div class="app-toast__progress">
            <div
              class="app-toast__progress-bar"
              :style="{ animationDuration: toast.type === 'error' ? '6s' : '4s' }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { toasts, dismiss } = useToast()
</script>

<style lang="scss" scoped>
.app-toast-container {
  position: fixed;
  top: $spacing-lg;
  right: $spacing-lg;
  z-index: $z-toast;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  max-width: 400px;
  width: 100%;
  pointer-events: none;
}

.app-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-md;
  background-color: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  border-left: 4px solid;
  overflow: hidden;
  pointer-events: auto;

  &--success {
    border-left-color: $success;

    .app-toast__icon {
      color: $success;
    }

    .app-toast__progress-bar {
      background-color: $success;
    }
  }

  &--error {
    border-left-color: $danger;

    .app-toast__icon {
      color: $danger;
    }

    .app-toast__progress-bar {
      background-color: $danger;
    }
  }

  &--warning {
    border-left-color: $warning;

    .app-toast__icon {
      color: $warning;
    }

    .app-toast__progress-bar {
      background-color: $warning;
    }
  }

  &--info {
    border-left-color: $info;

    .app-toast__icon {
      color: $info;
    }

    .app-toast__progress-bar {
      background-color: $info;
    }
  }

  &__icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    margin-top: 1px;
  }

  &__message {
    flex: 1;
    font-size: $font-size-sm;
    color: $gray-700;
    line-height: 1.4;
  }

  &__dismiss {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    color: $gray-400;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover {
      color: $gray-600;
      background-color: $gray-100;
    }
  }

  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: $gray-100;
  }

  &__progress-bar {
    height: 100%;
    width: 100%;
    transform-origin: left;
    animation: progress-shrink linear forwards;
  }
}

@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
