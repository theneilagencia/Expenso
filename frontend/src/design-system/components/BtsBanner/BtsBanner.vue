<template>
  <transition name="bts-banner">
    <div v-if="isVisible" class="bts-banner" :class="rootClasses" role="alert">
      <div class="bts-banner__icon">
        <BtsStatusIcon :variant="variant" />
      </div>

      <div class="bts-banner__content">
        <div v-if="title" class="bts-banner__title">{{ title }}</div>
        <div v-if="message" class="bts-banner__message">{{ message }}</div>

        <div v-if="$slots.default" class="bts-banner__body">
          <slot />
        </div>

        <div v-if="$slots.actions" class="bts-banner__actions">
          <slot name="actions" />
        </div>
      </div>

      <button
        v-if="dismissible"
        class="bts-banner__close"
        type="button"
        aria-label="Dismiss"
        @click="dismiss"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import BtsStatusIcon from '../BtsStatusIcon/BtsStatusIcon.vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['dismiss']);

const isVisible = ref(props.visible);

watch(() => props.visible, (val) => {
  isVisible.value = val;
});

const rootClasses = [`bts-banner--${props.variant}`];

function dismiss() {
  isVisible.value = false;
  emit('dismiss');
}
</script>

<style lang="scss" scoped>
.bts-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid var(--color-neutral-gray-semi-light);
  border-left: 4px solid;
  background: var(--color-primary-white);
  font-family: var(--font-family-primary);
  width: 100%;
  box-sizing: border-box;

  &--info {
    border-left-color: var(--color-primary-blue-highlight, #185ab4);
  }

  &--success {
    border-left-color: var(--color-success-semi-dark, #1B9B45);
  }

  &--warning {
    border-left-color: var(--color-warning-semi-dark, #DB9814);
  }

  &--danger {
    border-left-color: var(--color-error-semi-dark, #DB242A);
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 1px;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: var(--color-text-primary);
  }

  &__message {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-tertiary);
  }

  &__body {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 4px;
  }

  &__close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-neutral-gray-semi-dark);
    border-radius: 4px;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.06);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }
  }
}

.bts-banner-enter-active,
.bts-banner-leave-active {
  transition: all 0.3s ease;
}

.bts-banner-enter-from,
.bts-banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

