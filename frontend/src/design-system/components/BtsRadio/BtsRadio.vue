<template>
  <div class="bts-radio" :class="rootClasses">
    <label class="bts-radio__wrapper">
      <input
        :id="inputId"
        ref="inputRef"
        type="radio"
        class="bts-radio__input"
        :name="name"
        :value="value"
        :checked="isChecked"
        :disabled="disabled"
        :required="required"
        :aria-checked="isChecked"
        :aria-disabled="disabled"
        :aria-describedby="(helperText || error) ? descriptionId : undefined"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <span class="bts-radio__circle">
        <span v-if="isChecked" class="bts-radio__dot" />
      </span>
      <span v-if="label" class="bts-radio__label">{{ label }}</span>
    </label>

    <div v-if="helperText || error" :id="descriptionId" class="bts-radio__message">
      <span v-if="error" class="bts-radio__error-message">{{ error }}</span>
      <span v-else class="bts-radio__helper-text">{{ helperText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  value: { type: [String, Number, Boolean], required: true },
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  helperText: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);

const baseId = useId();
const inputId = `${baseId}-radio`;
const descriptionId = `${baseId}-description`;

const isChecked = computed(() => props.modelValue === props.value);

const rootClasses = computed(() => ({
  'bts-radio--checked': isChecked.value,
  'bts-radio--disabled': props.disabled,
  'bts-radio--error': !!props.error,
}));

function handleChange() {
  if (props.disabled) return;
  emit('update:modelValue', props.value);
  emit('change', props.value);
}

function handleFocus(e) {
  emit('focus', e);
}

function handleBlur(e) {
  emit('blur', e);
}
</script>

<style lang="scss" scoped>
.bts-radio {
  display: inline-flex;
  flex-direction: column;
  font-family: var(--font-family-primary);

  &__wrapper {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  &__circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    min-width: 20px;
    border: 2px solid var(--color-neutral-gray-dark);
    border-radius: 50%;
    background: var(--color-primary-white);
    transition: all 0.15s ease;
  }

  &__dot {
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-primary-white);
  }

  &__label {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-primary);
  }

  &__message {
    padding-left: 28px;
    margin-top: 2px;
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

  /* Hover */
  &:not(&--disabled) &__wrapper:hover &__circle {
    border-color: var(--color-secondary-blue-s01);
  }

  /* Focus */
  &__input:focus-visible ~ &__circle {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  /* Checked */
  &--checked &__circle {
    background: var(--color-secondary-blue-s01);
    border-color: var(--color-secondary-blue-s01);
  }

  &--checked:not(&--disabled) &__wrapper:hover &__circle {
    background: var(--color-secondary-blue-s02);
    border-color: var(--color-secondary-blue-s02);
  }

  /* Error */
  &--error &__circle {
    border-color: var(--color-error-semi-dark);
  }

  &--error#{&}--checked &__circle {
    background: var(--color-error-semi-dark);
    border-color: var(--color-error-semi-dark);
  }

  /* Disabled */
  &--disabled &__wrapper {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--disabled &__circle {
    background: var(--color-neutral-gray-light);
    border-color: var(--color-neutral-gray-semi-dark);
  }

  &--disabled#{&}--checked &__circle {
    background: var(--color-neutral-gray-semi-dark);
    border-color: var(--color-neutral-gray-semi-dark);
  }
}
</style>

