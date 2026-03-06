<template>
  <div class="bts-input" :class="inputClasses">
    <div class="bts-input__container">
      <label v-if="label" :for="inputId" class="bts-input__label">
        {{ label }}
      </label>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :maxlength="maxlength"
        class="bts-input__field"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown.enter="handleEnter"
      />
    </div>

    <div v-if="helperText || error" class="bts-input__message">
      <span v-if="error" class="bts-input__error-message">{{ error }}</span>
      <span v-else class="bts-input__helper-text">{{ helperText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'number', 'tel', 'url', 'search'].includes(value)
  },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  helperText: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  maxlength: { type: Number, default: null },
  fullWidth: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'enter']);

const inputId = useId();

const inputClasses = computed(() => ({
  'bts-input--error': !!props.error,
  'bts-input--disabled': props.disabled,
  'bts-input--full-width': props.fullWidth
}));

function handleInput(e) {
  emit('update:modelValue', e.target.value);
}

function handleBlur(e) {
  emit('blur', e);
}

function handleFocus(e) {
  emit('focus', e);
}

function handleEnter(e) {
  emit('enter', e);
}
</script>

<style lang="scss" scoped>
/* Input - Figma specs */
/* Width: 240px, Height: 56px, border-radius: 8px, border: 1px #575757, padding: 16px */
/* Label: Inter Regular 16px, #575757, line-height 20px */
/* Placeholder: Roboto Regular 16px, #9b9b9b, line-height 24px */
.bts-input {
  display: flex;
  flex-direction: column;
  width: 240px;
  font-family: var(--font-family-primary);

  &--full-width {
    width: 100%;
  }

  &__container {
    position: relative;
  }

  &__label {
    position: absolute;
    top: -10px;
    left: 8px;
    padding: 0 4px;
    background: var(--color-primary-white);
    font-family: var(--font-family-primary);
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-neutral-gray-dark);
    z-index: 1;
  }

  &__field {
    width: 100%;
    height: 56px;
    padding: 16px;
    font-family: var(--font-family-primary);
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    color: var(--color-text-primary);
    background: var(--color-primary-white);
    border: 1px solid var(--color-neutral-gray-dark);
    border-radius: 8px;
    outline: none;
    box-sizing: border-box;

    &::placeholder {
      color: var(--color-neutral-gray-semi-dark);
    }

    &:focus {
      border-color: var(--color-border-focus);
    }

    &:disabled {
      background: var(--color-neutral-gray-light);
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__message {
    padding-left: 4px;
    margin-top: -4px;
  }

  &__helper-text {
    font-family: var(--font-family-primary);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--color-neutral-gray-dark);
  }

  &__error-message {
    font-family: var(--font-family-primary);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--color-error-semi-dark);
  }

  &--error &__field {
    border-color: var(--color-error-semi-dark);
  }
}
</style>

