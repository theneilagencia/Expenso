<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="app-modal"
        @keydown.esc="handleClose"
      >
        <div
          class="app-modal__backdrop"
          @click="handleBackdropClick"
        />
        <div
          class="app-modal__container"
          :class="`app-modal__container--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <div class="app-modal__header">
            <h2 class="app-modal__title">{{ title }}</h2>
            <button
              v-if="closable"
              class="app-modal__close"
              :aria-label="t('common.close')"
              @click="handleClose"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="app-modal__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="app-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  },
  closable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible'])

function handleClose() {
  if (props.closable) {
    emit('update:visible', false)
  }
}

function handleBackdropClick() {
  handleClose()
}

function handleEscape(e) {
  if (e.key === 'Escape' && props.visible) {
    handleClose()
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style lang="scss" scoped>
.app-modal {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;

  &__backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba($black, 0.5);
  }

  &__container {
    position: relative;
    background-color: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-lg;
    max-height: calc(100vh - #{$spacing-2xl} * 2);
    display: flex;
    flex-direction: column;
    width: 100%;

    &--sm {
      max-width: 400px;
    }

    &--md {
      max-width: 560px;
    }

    &--lg {
      max-width: 800px;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    border-bottom: 1px solid $gray-200;
    flex-shrink: 0;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-900;
    margin: 0;
  }

  &__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: $gray-400;
    border-radius: $radius-md;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover {
      color: $gray-700;
      background-color: $gray-100;
    }
  }

  &__body {
    padding: $spacing-lg;
    overflow-y: auto;
    flex: 1;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-lg;
    border-top: 1px solid $gray-200;
    flex-shrink: 0;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .app-modal__container,
.modal-leave-active .app-modal__container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .app-modal__container,
.modal-leave-to .app-modal__container {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
