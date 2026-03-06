<template>
  <div
    ref="selectRef"
    class="bts-select"
    :class="selectClasses"
  >
    <div class="bts-select__container">
      <label v-if="label" :id="labelId" class="bts-select__label">
        {{ label }}
      </label>

      <button
        ref="triggerRef"
        type="button"
        class="bts-select__trigger"
        :disabled="disabled"
        :aria-expanded="isOpen"
        :aria-haspopup="'listbox'"
        :aria-labelledby="label ? labelId : undefined"
        @click="toggle"
        @keydown="handleTriggerKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <span class="bts-select__value" :class="{ 'bts-select__value--placeholder': !selectedLabel }">
          {{ selectedLabel || placeholder }}
        </span>
        <span class="bts-select__icon" :class="{ 'bts-select__icon--open': isOpen }">
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>

      <Transition name="bts-select-dropdown">
        <ul
          v-if="isOpen"
          ref="listRef"
          class="bts-select__dropdown"
          role="listbox"
          :aria-labelledby="label ? labelId : undefined"
          :aria-activedescendant="activeDescendant"
          @keydown="handleListKeydown"
        >
          <li
            v-for="(opt, index) in options"
            :key="opt.value"
            :id="`${baseId}-option-${index}`"
            class="bts-select__option"
            :class="{
              'bts-select__option--selected': opt.value === modelValue,
              'bts-select__option--highlighted': index === highlightedIndex
            }"
            role="option"
            :aria-selected="opt.value === modelValue"
            @click="selectOption(opt)"
            @mouseenter="highlightedIndex = index"
          >
            {{ opt.label }}
          </li>
        </ul>
      </Transition>
    </div>

    <div v-if="helperText || error" class="bts-select__message">
      <span v-if="error" class="bts-select__error-message">{{ error }}</span>
      <span v-else class="bts-select__helper-text">{{ helperText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, useId } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  helperText: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const baseId = useId();
const labelId = `${baseId}-label`;

const selectRef = ref(null);
const triggerRef = ref(null);
const listRef = ref(null);
const isOpen = ref(false);
const highlightedIndex = ref(-1);

const selectedLabel = computed(() => {
  const found = props.options.find(opt => opt.value === props.modelValue);
  return found ? found.label : '';
});

const activeDescendant = computed(() => {
  if (highlightedIndex.value >= 0) {
    return `${baseId}-option-${highlightedIndex.value}`;
  }
  return undefined;
});

const selectClasses = computed(() => ({
  'bts-select--open': isOpen.value,
  'bts-select--error': !!props.error,
  'bts-select--disabled': props.disabled,
  'bts-select--full-width': props.fullWidth,
  'bts-select--has-value': !!props.modelValue
}));

function toggle() {
  if (props.disabled) return;
  isOpen.value ? close() : open();
}

function open() {
  isOpen.value = true;
  const selectedIndex = props.options.findIndex(opt => opt.value === props.modelValue);
  highlightedIndex.value = selectedIndex >= 0 ? selectedIndex : 0;
  nextTick(() => {
    scrollToHighlighted();
  });
}

function close() {
  isOpen.value = false;
  highlightedIndex.value = -1;
}

function selectOption(opt) {
  emit('update:modelValue', opt.value);
  close();
  nextTick(() => triggerRef.value?.focus());
}

function scrollToHighlighted() {
  if (!listRef.value || highlightedIndex.value < 0) return;
  const items = listRef.value.querySelectorAll('.bts-select__option');
  const item = items[highlightedIndex.value];
  if (item) {
    item.scrollIntoView({ block: 'nearest' });
  }
}

function handleTriggerKeydown(e) {
  switch (e.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
    case 'ArrowUp':
      e.preventDefault();
      if (!isOpen.value) {
        open();
      }
      break;
    case 'Escape':
      if (isOpen.value) {
        e.preventDefault();
        close();
      }
      break;
  }
}

function handleListKeydown(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, props.options.length - 1);
      scrollToHighlighted();
      break;
    case 'ArrowUp':
      e.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      scrollToHighlighted();
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (highlightedIndex.value >= 0) {
        selectOption(props.options[highlightedIndex.value]);
      }
      break;
    case 'Escape':
      e.preventDefault();
      close();
      triggerRef.value?.focus();
      break;
    case 'Tab':
      close();
      break;
  }
}

function handleClickOutside(e) {
  if (selectRef.value && !selectRef.value.contains(e.target)) {
    close();
  }
}

function handleFocus(e) {
  emit('focus', e);
}

function handleBlur(e) {
  if (selectRef.value && !selectRef.value.contains(e.relatedTarget)) {
    emit('blur', e);
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true);
});

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => listRef.value?.focus());
  }
});
</script>

<style lang="scss" scoped>
.bts-select {
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
    z-index: 2;
    pointer-events: none;
  }

  // Trigger button
  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 56px;
    padding: 16px;
    padding-right: 44px;
    font-family: var(--font-family-primary);
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    color: var(--color-text-primary);
    background: var(--color-primary-white);
    border: 1px solid var(--color-neutral-gray-dark);
    border-radius: 8px;
    cursor: pointer;
    outline: none;
    box-sizing: border-box;
    text-align: left;
    transition: border-color 0.2s ease;

    &:hover:not(:disabled) {
      border-color: var(--color-border-focus);
    }

    &:focus-visible {
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px rgba(24, 90, 180, 0.15);
    }

    &:disabled {
      background: var(--color-neutral-gray-light);
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &--open &__trigger {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px rgba(24, 90, 180, 0.15);
  }

  // Value / Placeholder
  &__value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--placeholder {
      color: var(--color-neutral-gray-semi-dark);
    }
  }

  // Chevron icon
  &__icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-neutral-gray-dark);
    transition: transform 0.2s ease;

    &--open {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  // Dropdown list
  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    background: var(--color-primary-white);
    border: 1px solid var(--color-neutral-gray-semi-light);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 10;
    max-height: 220px;
    overflow-y: auto;
    outline: none;

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

  // Option items
  &__option {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    font-family: var(--font-family-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: background-color 0.15s ease;

    &--highlighted {
      background: var(--color-neutral-gray-light);
    }

    &--selected {
      color: var(--color-primary-blue-highlight);
      font-weight: 500;
    }

    &--selected#{&}--highlighted {
      background: var(--color-neutral-gray-light);
    }
  }

  // Messages
  &__message {
    padding-left: 4px;
    margin-top: 4px;
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

  // Error state
  &--error &__trigger {
    border-color: var(--color-error-semi-dark);
  }

  &--error &__trigger:hover:not(:disabled) {
    border-color: var(--color-error-semi-dark);
  }

  &--error &__label {
    color: var(--color-error-semi-dark);
  }
}

// Dropdown transition
.bts-select-dropdown-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.bts-select-dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.bts-select-dropdown-enter-from,
.bts-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

