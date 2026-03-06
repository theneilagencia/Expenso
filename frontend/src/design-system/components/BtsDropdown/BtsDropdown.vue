<template>
  <div
    ref="dropdownRef"
    class="bts-dropdown"
    :class="dropdownClasses"
  >
    <div
      ref="triggerRef"
      class="bts-dropdown__trigger"
      :aria-expanded="isOpen"
      :aria-haspopup="'menu'"
      @click="toggle"
      @keydown="handleTriggerKeydown"
    >
      <slot name="trigger">
        <button type="button" class="bts-dropdown__default-trigger" :disabled="disabled">
          {{ label }}
          <span class="bts-dropdown__chevron" :class="{ 'bts-dropdown__chevron--open': isOpen }">
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
      </slot>
    </div>

    <Transition name="bts-dropdown-menu">
      <ul
        v-if="isOpen"
        ref="menuRef"
        class="bts-dropdown__menu"
        :class="[`bts-dropdown__menu--${placement}`]"
        role="menu"
        :aria-activedescendant="activeDescendant"
        tabindex="-1"
        @keydown="handleMenuKeydown"
      >
        <li
          v-for="(item, index) in enabledItems"
          :key="item.value ?? index"
          :id="`${baseId}-item-${index}`"
          class="bts-dropdown__item"
          :class="{
            'bts-dropdown__item--highlighted': index === highlightedIndex,
            'bts-dropdown__item--disabled': item.disabled,
            'bts-dropdown__item--danger': item.danger,
          }"
          role="menuitem"
          :aria-disabled="item.disabled || undefined"
          @click="!item.disabled && selectItem(item, index)"
          @mouseenter="!item.disabled && (highlightedIndex = index)"
        >
          <span v-if="item.icon" class="bts-dropdown__item-icon">
            <slot name="item-icon" :item="item">
              <BtsIcon :name="item.icon" :prefix="item.iconPrefix || 'fas'" size="sm" />
            </slot>
          </span>
          <span class="bts-dropdown__item-label">
            <slot name="item" :item="item" :index="index">
              {{ item.label }}
            </slot>
          </span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, useId } from 'vue';
import BtsIcon from '@/components/BtsIcon/BtsIcon.vue';

const props = defineProps({
  items: { type: Array, default: () => [] },
  label: { type: String, default: 'Menu' },
  placement: {
    type: String,
    default: 'bottom-start',
    validator: (v) => ['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(v),
  },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'open', 'close']);

const baseId = useId();
const dropdownRef = ref(null);
const triggerRef = ref(null);
const menuRef = ref(null);
const isOpen = ref(false);
const highlightedIndex = ref(-1);

const enabledItems = computed(() => props.items);

const activeDescendant = computed(() => {
  if (highlightedIndex.value >= 0) {
    return `${baseId}-item-${highlightedIndex.value}`;
  }
  return undefined;
});

const dropdownClasses = computed(() => ({
  'bts-dropdown--open': isOpen.value,
  'bts-dropdown--disabled': props.disabled,
}));

function toggle() {
  if (props.disabled) return;
  isOpen.value ? close() : open();
}

function open() {
  isOpen.value = true;
  highlightedIndex.value = 0;
  emit('open');
}

function close() {
  isOpen.value = false;
  highlightedIndex.value = -1;
  emit('close');
}

function selectItem(item) {
  if (item.disabled) return;
  emit('select', item);
  close();
  nextTick(() => {
    const trigger = triggerRef.value?.querySelector('button, [tabindex]') || triggerRef.value;
    trigger?.focus();
  });
}

function getNavigableIndices() {
  return props.items.reduce((acc, item, i) => {
    if (!item.disabled) acc.push(i);
    return acc;
  }, []);
}

function handleTriggerKeydown(e) {
  switch (e.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
      e.preventDefault();
      if (!isOpen.value) open();
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (!isOpen.value) {
        open();
        const indices = getNavigableIndices();
        highlightedIndex.value = indices[indices.length - 1] ?? 0;
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

function handleMenuKeydown(e) {
  const indices = getNavigableIndices();
  const currentPos = indices.indexOf(highlightedIndex.value);

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (currentPos < indices.length - 1) {
        highlightedIndex.value = indices[currentPos + 1];
      }
      scrollToHighlighted();
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (currentPos > 0) {
        highlightedIndex.value = indices[currentPos - 1];
      }
      scrollToHighlighted();
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (highlightedIndex.value >= 0 && !props.items[highlightedIndex.value]?.disabled) {
        selectItem(props.items[highlightedIndex.value]);
      }
      break;
    case 'Escape':
      e.preventDefault();
      close();
      nextTick(() => {
        const trigger = triggerRef.value?.querySelector('button, [tabindex]') || triggerRef.value;
        trigger?.focus();
      });
      break;
    case 'Tab':
      close();
      break;
  }
}

function scrollToHighlighted() {
  if (!menuRef.value || highlightedIndex.value < 0) return;
  const items = menuRef.value.querySelectorAll('.bts-dropdown__item');
  const item = items[highlightedIndex.value];
  if (item) {
    item.scrollIntoView({ block: 'nearest' });
  }
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    close();
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
    nextTick(() => menuRef.value?.focus());
  }
});
</script>

<style lang="scss" scoped>
.bts-dropdown {
  position: relative;
  display: inline-flex;
  font-family: var(--font-family-primary);

  &--disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  &__trigger {
    display: inline-flex;
  }

  &__default-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    font-family: var(--font-family-primary);
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--color-text-primary);
    background: var(--color-primary-white);
    border: 1px solid var(--color-neutral-gray-dark);
    border-radius: 8px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s ease;

    &:hover:not(:disabled) {
      border-color: var(--color-border-focus);
    }

    &:focus-visible {
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px rgba(24, 90, 180, 0.15);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__chevron {
    display: flex;
    align-items: center;
    color: var(--color-neutral-gray-dark);
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    background: var(--color-primary-white);
    border: 1px solid var(--color-neutral-gray-semi-light);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 100;
    min-width: 180px;
    max-height: 280px;
    overflow-y: auto;
    outline: none;

    &--bottom-start {
      top: calc(100% + 4px);
      left: 0;
    }

    &--bottom-end {
      top: calc(100% + 4px);
      right: 0;
    }

    &--top-start {
      bottom: calc(100% + 4px);
      left: 0;
    }

    &--top-end {
      bottom: calc(100% + 4px);
      right: 0;
    }

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

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: background-color 0.15s ease;

    &--highlighted {
      background: var(--color-neutral-gray-light);
    }

    &--disabled {
      color: var(--color-neutral-gray-semi-dark);
      cursor: not-allowed;
    }

    &--danger {
      color: var(--color-error-semi-dark);
    }

    &--danger#{&}--highlighted {
      background: rgba(220, 38, 38, 0.06);
    }
  }

  &__item-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }

  &__item-label {
    flex: 1;
  }
}

.bts-dropdown-menu-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.bts-dropdown-menu-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.bts-dropdown-menu-enter-from,
.bts-dropdown-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

