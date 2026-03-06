<template>
  <div class="bts-checkbox" :class="rootClasses">
    <label class="bts-checkbox__wrapper" :for="inputId">
      <input
        :id="inputId"
        ref="inputRef"
        type="checkbox"
        class="bts-checkbox__input"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        :indeterminate="indeterminate"
        :aria-checked="indeterminate ? 'mixed' : modelValue"
        :aria-disabled="disabled"
        :aria-describedby="descriptionId"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <span class="bts-checkbox__box">
        <svg
          v-if="modelValue && !indeterminate"
          class="bts-checkbox__icon bts-checkbox__icon--check"
          width="12"
          height="9"
          viewBox="0 0 12 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 4L4.5 7.5L11 1"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-if="indeterminate"
          class="bts-checkbox__icon bts-checkbox__icon--indeterminate"
          width="10"
          height="2"
          viewBox="0 0 10 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1H9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <span v-if="label" class="bts-checkbox__label">{{ label }}</span>
    </label>

    <div v-if="helperText || error" :id="descriptionId" class="bts-checkbox__message">
      <span v-if="error" class="bts-checkbox__error-message">{{ error }}</span>
      <span v-else class="bts-checkbox__helper-text">{{ helperText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, useId } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  helperText: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);

const baseId = useId();
const inputId = `${baseId}-checkbox`;
const descriptionId = `${baseId}-description`;
const inputRef = ref(null);

const rootClasses = computed(() => ({
  'bts-checkbox--checked': props.modelValue,
  'bts-checkbox--indeterminate': props.indeterminate,
  'bts-checkbox--disabled': props.disabled,
  'bts-checkbox--error': !!props.error,
}));

watch(() => props.indeterminate, (val) => {
  if (inputRef.value) {
    inputRef.value.indeterminate = val;
  }
});

function handleChange(e) {
  if (props.disabled) return;
  const checked = e.target.checked;
  emit('update:modelValue', checked);
  emit('change', checked);
}

function handleFocus(e) {
  emit('focus', e);
}

function handleBlur(e) {
  emit('blur', e);
}
</script>

<style lang="scss" scoped>
.bts-checkbox {
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

  &__box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    min-width: 20px;
    border: 2px solid var(--color-neutral-gray-dark);
    border-radius: 4px;
    background: var(--color-primary-white);
    color: var(--color-primary-white);
    transition: all 0.15s ease;
  }

  &__icon {
    display: flex;
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
  &:not(&--disabled) &__wrapper:hover &__box {
    border-color: var(--color-secondary-blue-s01);
  }

  /* Focus */
  &__input:focus-visible ~ &__box {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  /* Checked */
  &--checked &__box {
    background: var(--color-secondary-blue-s01);
    border-color: var(--color-secondary-blue-s01);
  }

  &--checked:not(&--disabled) &__wrapper:hover &__box {
    background: var(--color-secondary-blue-s02);
    border-color: var(--color-secondary-blue-s02);
  }

  /* Indeterminate */
  &--indeterminate &__box {
    background: var(--color-secondary-blue-s01);
    border-color: var(--color-secondary-blue-s01);
  }

  &--indeterminate:not(&--disabled) &__wrapper:hover &__box {
    background: var(--color-secondary-blue-s02);
    border-color: var(--color-secondary-blue-s02);
  }

  /* Error */
  &--error &__box {
    border-color: var(--color-error-semi-dark);
  }

  &--error#{&}--checked &__box,
  &--error#{&}--indeterminate &__box {
    background: var(--color-error-semi-dark);
    border-color: var(--color-error-semi-dark);
  }

  /* Disabled */
  &--disabled &__wrapper {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--disabled &__box {
    background: var(--color-neutral-gray-light);
    border-color: var(--color-neutral-gray-semi-dark);
  }

  &--disabled#{&}--checked &__box,
  &--disabled#{&}--indeterminate &__box {
    background: var(--color-neutral-gray-semi-dark);
    border-color: var(--color-neutral-gray-semi-dark);
  }
}
</style>

