<template>
  <div class="bts-sidebar-button-wrapper">
    <component
      :is="tag"
      class="bts-sidebar-button"
      :class="buttonClasses"
      :href="href"
      :to="to"
      @click="handleClick"
    >
      <span v-if="icon" class="bts-sidebar-button__icon">
        <font-awesome-icon :icon="iconArray" />
      </span>
      <span v-if="!collapsed" class="bts-sidebar-button__label">
        <slot>{{ label }}</slot>
      </span>
      <span v-if="expandable && !collapsed" class="bts-sidebar-button__chevron">
        <font-awesome-icon :icon="['fas', 'chevron-down']" />
      </span>
    </component>

    <!-- Sub-items (expandable content) -->
    <transition name="expand">
      <div v-if="expandable && expanded && !collapsed" class="bts-sidebar-button__submenu">
        <slot name="submenu" />
      </div>
    </transition>
  </div>
</template>

<script setup>
/**
 * BtsSidebarButton - Navigation button for sidebar
 *
 * Figma specs:
 * - Width Expanded: 208px (full width)
 * - Width Collapsed: 44px (icon only)
 * - Height: 40px
 * - Border-radius: 8px
 * - Padding: 12px horizontal
 * - Gap: 12px between icon and label
 *
 * States:
 * - Default: background #18365b (same as sidebar)
 * - Hover: background #c6c6c6 (gray), text stays white
 * - Selected: background #006394 (blue)
 *
 * Typography:
 * - Icon: Font Awesome Light 16px, color #ffffff
 * - Label: Inter Medium 14px, letter-spacing -0.28px, color #ffffff
 *
 * Expandable:
 * - Set expandable=true to show chevron icon
 * - Control expanded state with expanded prop
 * - Use #submenu slot to add sub-items
 * - Sub-items are indented 32px (icon width + gap)
 * - Animated expand/collapse transition
 */
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  iconPrefix: {
    type: String,
    default: 'far',
  },
  selected: {
    type: Boolean,
    default: false,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  href: {
    type: String,
    default: null,
  },
  to: {
    type: [String, Object],
    default: null,
  },
  expandable: {
    type: Boolean,
    default: false,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary'].includes(value),
  },
});

const emit = defineEmits(['click', 'toggle']);

const tag = computed(() => {
  if (props.to) return 'router-link';
  if (props.href) return 'a';
  return 'button';
});

const iconArray = computed(() => [props.iconPrefix, props.icon]);

const buttonClasses = computed(() => ({
  'bts-sidebar-button--selected': props.selected,
  'bts-sidebar-button--expandable': props.expandable,
  'bts-sidebar-button--expanded': props.expanded,
  'bts-sidebar-button--collapsed': props.collapsed,
  [`bts-sidebar-button--${props.variant}`]: true,
}));

function handleClick(event) {
  if (props.expandable) {
    emit('toggle', !props.expanded);
  }
  emit('click', event);
}
</script>

<style lang="scss" scoped>
.bts-sidebar-button-wrapper {
  width: 100%;
}

.bts-sidebar-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  box-sizing: border-box;
  transition: background-color 0.15s ease;

  /* Collapsed state: 44x40px, icon only, centered */
  &--collapsed {
    width: 44px;
    justify-content: center;
    padding: 0;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: var(--color-primary-white);
    font-size: 16px;

    :deep(svg) {
      color: var(--color-primary-white);
    }
  }

  &__label {
    flex: 1;
    font-family: var(--font-family-primary);
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: -0.28px;
    color: var(--color-primary-white);
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--color-primary-white);
    font-size: 12px;
    transition: transform 0.2s ease;

    :deep(svg) {
      color: var(--color-primary-white);
    }
  }

  &--expanded &__chevron {
    transform: rotate(180deg);
  }

  /* Submenu */
  &__submenu {
    padding-left: 32px; /* Indent sub-items (20px icon + 12px gap) */
    padding-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
  }

}

/* Variant: Primary (default) */
.bts-sidebar-button--primary {
  &:hover {
    background-color: var(--color-neutral-gray-base);
  }
}

.bts-sidebar-button--primary.bts-sidebar-button--selected {
  background-color: var(--color-secondary-blue-s02);

  &:hover {
    background-color: var(--color-secondary-blue-s02);
  }
}

/* Variant: Secondary (Light theme - Design System tokens) */
.bts-sidebar-button--secondary {
  .bts-sidebar-button__icon {
    color: var(--color-neutral-black);
  }

  .bts-sidebar-button__icon :deep(svg) {
    color: var(--color-neutral-black);
  }

  .bts-sidebar-button__label {
    color: var(--color-neutral-black);
  }

  .bts-sidebar-button__chevron {
    color: var(--color-neutral-black);
  }

  .bts-sidebar-button__chevron :deep(svg) {
    color: var(--color-neutral-black);
  }

  &:hover {
    background-color: var(--color-neutral-gray-semi-light);
  }
}

.bts-sidebar-button--secondary.bts-sidebar-button--selected {
  background-color: var(--color-primary-blue-highlight);

  .bts-sidebar-button__icon {
    color: var(--color-primary-white);
  }

  .bts-sidebar-button__icon :deep(svg) {
    color: var(--color-primary-white);
  }

  .bts-sidebar-button__label {
    color: var(--color-primary-white);
  }

  .bts-sidebar-button__chevron {
    color: var(--color-primary-white);
  }

  .bts-sidebar-button__chevron :deep(svg) {
    color: var(--color-primary-white);
  }

  &:hover {
    background-color: var(--color-primary-blue-highlight);
  }
}

/* Expand/Collapse Animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  max-height: 500px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
}
</style>

