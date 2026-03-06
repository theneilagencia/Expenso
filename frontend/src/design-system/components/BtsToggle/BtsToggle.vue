<template>
  <div class="bts-toggle" :class="rootClasses">
    <label
      v-if="label && labelPosition === 'left'"
      :for="inputId"
      class="bts-toggle__label bts-toggle__label--left"
    >
      {{ label }}
    </label>

    <button
      :id="inputId"
      type="button"
      role="switch"
      class="bts-toggle__track"
      :aria-checked="modelValue"
      :aria-disabled="disabled"
      :aria-describedby="(helperText || error) ? descriptionId : undefined"
      :disabled="disabled"
      @click="handleToggle"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.space.prevent="handleToggle"
      @keydown.enter.prevent="handleToggle"
    >
      <span class="bts-toggle__knob" />
    </button>

    <label
      v-if="label && labelPosition === 'right'"
      :for="inputId"
      class="bts-toggle__label bts-toggle__label--right"
    >
      {{ label }}
    </label>

    <div v-if="helperText || error" :id="descriptionId" class="bts-toggle__message">
      <span v-if="error" class="bts-toggle__error-message">{{ error }}</span>
      <span v-else class="bts-toggle__helper-text">{{ helperText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  labelPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value),
  },
  helperText: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);

const baseId = useId();
const inputId = `${baseId}-toggle`;
const descriptionId = `${baseId}-description`;

const rootClasses = computed(() => ({
  'bts-toggle--on': props.modelValue,
  'bts-toggle--disabled': props.disabled,
  'bts-toggle--error': !!props.error,
  [`bts-toggle--${props.size}`]: true,
}));

function handleToggle() {
  if (props.disabled) return;
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
}

function handleFocus(e) {
  emit('focus', e);
}

function handleBlur(e) {
  emit('blur', e);
}
</script>

<style lang="scss" scoped>
.bts-toggle {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-family: var(--font-family-primary);

  &__track {
    position: relative;
    display: inline-flex;
    align-items: center;
    border: 2px solid var(--color-neutral-gray-semi-dark);
    border-radius: 999px;
    background: var(--color-neutral-gray-semi-dark);
    cursor: pointer;
    padding: 0;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }

    &:hover:not(:disabled) {
      border-color: var(--color-neutral-gray-dark);
      background: var(--color-neutral-gray-dark);
    }
  }

  &__knob {
    display: block;
    border-radius: 50%;
    background: var(--color-primary-white);
    transition: transform 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }

  &__label {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-primary);
    cursor: pointer;
  }

  &__message {
    width: 100%;
    padding-left: 0;
    margin-top: -4px;
  }

  &__helper-text {
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--color-neutral-gray-dark);
  }

  &__error-message {
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--color-error-semi-dark);
  }

  /* Size: md (default) */
  &--md &__track {
    width: 44px;
    height: 24px;
  }

  &--md &__knob {
    width: 16px;
    height: 16px;
    transform: translateX(2px);
  }

  &--md#{&}--on &__knob {
    transform: translateX(22px);
  }

  /* Size: sm */
  &--sm &__track {
    width: 36px;
    height: 20px;
  }

  &--sm &__knob {
    width: 12px;
    height: 12px;
    transform: translateX(2px);
  }

  &--sm#{&}--on &__knob {
    transform: translateX(18px);
  }

  &--sm &__label {
    font-size: 12px;
    line-height: 16px;
  }

  /* On state */
  &--on &__track {
    background: var(--color-secondary-blue-s01);
    border-color: var(--color-secondary-blue-s01);
  }

  &--on &__track:hover:not(:disabled) {
    background: var(--color-secondary-blue-s02);
    border-color: var(--color-secondary-blue-s02);
  }

  /* Error */
  &--error &__track {
    border-color: var(--color-error-semi-dark);
    background: var(--color-error-semi-dark);
  }

  &--error#{&}--on &__track {
    background: var(--color-error-semi-dark);
    border-color: var(--color-error-semi-dark);
  }

  /* Disabled */
  &--disabled &__track {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--disabled &__label {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>

