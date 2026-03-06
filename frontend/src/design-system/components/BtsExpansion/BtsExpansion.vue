<template>
  <div class="bts-expansion" :class="rootClasses">
    <button
      class="bts-expansion__header"
      type="button"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-controls="contentId"
      @click="toggle"
    >
      <span class="bts-expansion__header-content">
        <slot name="header">
          <span class="bts-expansion__title">{{ title }}</span>
          <span v-if="subtitle" class="bts-expansion__subtitle">{{ subtitle }}</span>
        </slot>
      </span>
      <span class="bts-expansion__chevron" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>

    <transition
      name="bts-expansion-content"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-show="isOpen"
        :id="contentId"
        class="bts-expansion__body"
        role="region"
      >
        <div class="bts-expansion__content">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, useId } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const uid = Math.random().toString(36).substring(2, 9);
const contentId = `bts-expansion-${uid}`;

const isOpen = computed(() => props.modelValue);

const rootClasses = computed(() => ({
  'bts-expansion--open': isOpen.value,
  'bts-expansion--disabled': props.disabled,
}));

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !isOpen.value);
  }
}

/* Height animation helpers */
function onEnter(el) {
  el.style.height = '0';
  el.style.overflow = 'hidden';
  // Force reflow
  void el.offsetHeight;
  el.style.height = el.scrollHeight + 'px';
}

function onAfterEnter(el) {
  el.style.height = '';
  el.style.overflow = '';
}

function onLeave(el) {
  el.style.height = el.scrollHeight + 'px';
  el.style.overflow = 'hidden';
  // Force reflow
  void el.offsetHeight;
  el.style.height = '0';
}

function onAfterLeave(el) {
  el.style.height = '';
  el.style.overflow = '';
}
</script>

<style lang="scss" scoped>
.bts-expansion {
  font-family: var(--font-family-primary);
  border: 1px solid var(--color-neutral-gray-light, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;

  & + & {
    margin-top: -1px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    transition: background-color 0.15s ease;

    &:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.02);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: -2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &__header-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--color-text-primary);
  }

  &__subtitle {
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--color-neutral-gray-semi-dark);
  }

  &__chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: var(--color-neutral-gray-semi-dark);
    transition: transform 0.25s ease;
  }

  &--open &__chevron {
    transform: rotate(180deg);
  }

  &__body {
    transition: height 0.25s ease;
  }

  &__content {
    padding: 0 16px 16px;
    font-size: 14px;
    line-height: 20px;
    color: var(--color-text-primary);
  }
}

/* Transition classes */
.bts-expansion-content-enter-active,
.bts-expansion-content-leave-active {
  transition: height 0.25s ease;
}
</style>

