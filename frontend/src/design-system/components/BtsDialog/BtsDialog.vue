<template>
  <Teleport to="body">
    <Transition name="bts-dialog">
      <div
        v-if="modelValue"
        ref="overlayRef"
        class="bts-dialog-overlay"
        @click.self="handleOverlayClick"
        @keydown.esc="handleEscKey"
      >
        <div
          ref="dialogRef"
          class="bts-dialog"
          :class="dialogClasses"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="hasHeader ? `${baseId}-header` : undefined"
          tabindex="-1"
        >
          <!-- Header -->
          <div v-if="hasHeader" class="bts-dialog__header" :id="`${baseId}-header`">
            <slot name="header">
              <h2 class="bts-dialog__title">{{ title }}</h2>
            </slot>
            <button
              v-if="closable"
              type="button"
              class="bts-dialog__close"
              aria-label="Close"
              @click="close"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="bts-dialog__content" :class="{ 'bts-dialog__content--scrollable': scrollable }">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="bts-dialog__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount, useId, useSlots } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  persistent: { type: Boolean, default: false },
  closable: { type: Boolean, default: true },
  scrollable: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'close']);

const baseId = useId();
const slots = useSlots();
const overlayRef = ref(null);
const dialogRef = ref(null);
let previousActiveElement = null;

const hasHeader = computed(() => !!slots.header || !!props.title);

const dialogClasses = computed(() => [
  `bts-dialog--${props.size}`,
]);

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function handleOverlayClick() {
  if (!props.persistent) {
    close();
  }
}

function handleEscKey(e) {
  if (!props.persistent) {
    e.stopPropagation();
    close();
  }
}

function trapFocus(e) {
  if (e.key !== 'Tab' || !dialogRef.value) return;

  const focusable = dialogRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function lockBodyScroll() {
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  document.body.style.overflow = '';
}

watch(() => props.modelValue, (val) => {
  if (val) {
    previousActiveElement = document.activeElement;
    lockBodyScroll();
    nextTick(() => {
      dialogRef.value?.focus();
      document.addEventListener('keydown', trapFocus);
    });
  } else {
    unlockBodyScroll();
    document.removeEventListener('keydown', trapFocus);
    nextTick(() => {
      previousActiveElement?.focus();
      previousActiveElement = null;
    });
  }
});

onBeforeUnmount(() => {
  unlockBodyScroll();
  document.removeEventListener('keydown', trapFocus);
});
</script>

<style lang="scss" scoped>
.bts-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 24px;
}

.bts-dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  background: var(--color-primary-white);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  font-family: var(--font-family-primary);
  outline: none;

  &--sm {
    width: 100%;
    max-width: 400px;
  }

  &--md {
    width: 100%;
    max-width: 600px;
  }

  &--lg {
    width: 100%;
    max-width: 800px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0;
    flex-shrink: 0;
  }

  &__title {
    margin: 0;
    font-family: var(--font-family-primary);
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
    color: var(--color-text-primary);
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: var(--color-neutral-gray-semi-dark);
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background-color: var(--color-neutral-gray-light);
      color: var(--color-text-primary);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }
  }

  &__content {
    padding: 20px 24px;
    font-size: 14px;
    line-height: 20px;
    color: var(--color-text-primary);

    &--scrollable {
      overflow-y: auto;
      flex: 1;
      min-height: 0;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--color-neutral-gray-base);
        border-radius: 3px;
      }
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 0 24px 20px;
    flex-shrink: 0;
  }
}

// Transition
.bts-dialog-enter-active {
  transition: opacity 0.2s ease;

  .bts-dialog {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
}

.bts-dialog-leave-active {
  transition: opacity 0.15s ease;

  .bts-dialog {
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
}

.bts-dialog-enter-from,
.bts-dialog-leave-to {
  opacity: 0;

  .bts-dialog {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>

