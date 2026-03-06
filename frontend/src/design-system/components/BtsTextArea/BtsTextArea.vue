<template>
  <div class="bts-textarea" :class="textareaClasses">
    <div class="bts-textarea__container">
      <label v-if="label" :for="inputId" class="bts-textarea__label">
        {{ label }}
      </label>
      <textarea
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :rows="rows"
        :maxlength="maxlength"
        class="bts-textarea__field"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
    </div>

    <div v-if="helperText || error || (maxlength && showCounter)" class="bts-textarea__footer">
      <span v-if="error" class="bts-textarea__error-message">{{ error }}</span>
      <span v-else-if="helperText" class="bts-textarea__helper-text">{{ helperText }}</span>
      <span v-else></span>
      <span v-if="maxlength && showCounter" class="bts-textarea__counter">
        {{ modelValue?.length || 0 }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  helperText: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  rows: { type: Number, default: 4 },
  maxlength: { type: Number, default: null },
  showCounter: { type: Boolean, default: true },
  fullWidth: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const inputId = useId();

const textareaClasses = computed(() => ({
  'bts-textarea--error': !!props.error,
  'bts-textarea--disabled': props.disabled,
  'bts-textarea--full-width': props.fullWidth
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
</script>

<style lang="scss" scoped>
/* TextArea - Figma specs */
/* Width: 240px, border-radius: 8px, border: 1px rgba(0,0,0,0.5), padding: 16px */
/* Label: Inter Regular 16px, rgba(0,0,0,0.5), line-height 20px */
/* Placeholder: Inter Regular 14px, #9b9b9b, line-height 20px */
/* Help text: Inter Regular 12px, #575757, line-height 16px */
.bts-textarea {
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
    min-height: 128px;
    padding: 16px;
    font-family: var(--font-family-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-primary);
    background: var(--color-primary-white);
    border: 1px solid var(--color-neutral-gray-dark);
    border-radius: 8px;
    resize: vertical;
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

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 4px;
    margin-top: -4px;
    min-height: 24px;
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

  &__counter {
    font-family: var(--font-family-primary);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--color-neutral-gray-dark);
    text-align: right;
  }

  &--error &__field {
    border-color: var(--color-error-semi-dark);
  }
}
</style>

