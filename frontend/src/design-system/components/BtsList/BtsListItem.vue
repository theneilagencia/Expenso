<template>
  <li
    class="bts-list-item"
    :class="rootClasses"
    :tabindex="clickable && !disabled ? 0 : undefined"
    :role="clickable ? 'button' : undefined"
    :aria-selected="selected || undefined"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <span v-if="$slots.leading" class="bts-list-item__leading">
      <slot name="leading" />
    </span>

    <span class="bts-list-item__content">
      <span class="bts-list-item__text">
        <slot />
      </span>
      <span v-if="$slots.secondary || secondary" class="bts-list-item__secondary">
        <slot name="secondary">{{ secondary }}</slot>
      </span>
    </span>

    <span v-if="$slots.trailing" class="bts-list-item__trailing">
      <slot name="trailing" />
    </span>
  </li>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  secondary: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['click']);

const rootClasses = computed(() => ({
  'bts-list-item--selected': props.selected,
  'bts-list-item--disabled': props.disabled,
  'bts-list-item--clickable': props.clickable && !props.disabled,
}));

function handleClick(event) {
  if (!props.disabled && props.clickable) {
    emit('click', event);
  }
}
</script>

<style lang="scss" scoped>
.bts-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-family: var(--font-family-primary);
  transition: background-color 0.15s ease;

  &--clickable {
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: -2px;
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.06);
    }
  }

  &--selected {
    background-color: rgba(0, 99, 148, 0.08);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__leading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  &__text {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-primary);
  }

  &__secondary {
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--color-neutral-gray-semi-dark);
  }

  &__trailing {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
}
</style>

