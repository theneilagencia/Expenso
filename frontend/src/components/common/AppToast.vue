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
            <BtsStatusIcon :variant="mapTypeToVariant(toast.type)" />
          </div>

          <span class="app-toast__message">{{ toast.message }}</span>

          <button
            class="app-toast__dismiss"
            :aria-label="t('common.toast.close')"
            @click="dismiss(toast.id)"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L9 9M9 1L1 9"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
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
import { BtsStatusIcon } from '@/design-system'

const { t } = useI18n()
const { toasts, dismiss } = useToast()

function mapTypeToVariant(type) {
  const map = {
    success: 'success',
    error: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return map[type] || 'info'
}
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
  gap: 16px;
  padding: 20px;
  background: var(--color-primary-white, $white);
  border: 1px solid;
  border-radius: 12px;
  box-shadow: $shadow-lg;
  overflow: hidden;
  pointer-events: auto;
  font-family: var(--font-family-primary, inherit);

  &--success {
    border-color: var(--color-success-dark, $success);

    .app-toast__progress-bar {
      background-color: var(--color-success-dark, $success);
    }
  }

  &--error {
    border-color: var(--color-error-semi-dark, $danger);

    .app-toast__progress-bar {
      background-color: var(--color-error-semi-dark, $danger);
    }
  }

  &--warning {
    border-color: var(--color-warning-semi-dark, $warning);

    .app-toast__progress-bar {
      background-color: var(--color-warning-semi-dark, $warning);
    }
  }

  &--info {
    border-color: var(--color-primary-blue-highlight, $info);

    .app-toast__progress-bar {
      background-color: var(--color-primary-blue-highlight, $info);
    }
  }

  &__icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    width: 32px;
    height: 32px;
  }

  &__message {
    flex: 1;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-primary, $gray-700);
  }

  &__dismiss {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 4px;
    border: none;
    background: none;
    color: $gray-400;
    border-radius: 4px;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover {
      color: $gray-600;
      background: rgba(0, 0, 0, 0.05);
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
