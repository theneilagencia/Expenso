<template>
  <aside class="bts-sidebar" :class="sidebarClasses">
    <!-- Toggle Button (absolute positioned) -->
    <button
      v-if="toggleable"
      class="bts-sidebar__toggle"
      @click="$emit('toggle')"
      aria-label="Toggle sidebar"
    >
      <font-awesome-icon :icon="['fas', isOpen ? 'chevron-left' : 'chevron-right']" />
    </button>

    <!-- Profile Header -->
    <div class="bts-sidebar__profile" :class="{ 'bts-sidebar__profile--no-avatar': !showAvatar }">
      <div v-if="showAvatar" class="bts-sidebar__avatar">
        <img v-if="avatarUrl" :src="avatarUrl" :alt="companyName" />
        <span v-else class="bts-sidebar__avatar-placeholder">
          {{ avatarInitials }}
        </span>
      </div>
      <div v-if="isOpen" class="bts-sidebar__profile-content" :class="{ 'bts-sidebar__profile-content--centered': !showAvatar }">
        <span class="bts-sidebar__profile-title">{{ companyName }}</span>
        <span class="bts-sidebar__profile-overline">{{ userName }}</span>
      </div>
    </div>

    <div class="bts-sidebar__divider"></div>

    <!-- Main Navigation -->
    <nav class="bts-sidebar__nav bts-sidebar__nav--main">
      <slot name="navigation" />
    </nav>

    <div class="bts-sidebar__divider"></div>

    <!-- Settings Section -->
    <div class="bts-sidebar__section">
      <span v-if="isOpen" class="bts-sidebar__section-title">
        <slot name="section-title">SETTINGS</slot>
      </span>
      <nav class="bts-sidebar__nav">
        <slot name="settings" />
      </nav>
    </div>

    <!-- Spacer -->
    <div class="bts-sidebar__spacer"></div>

    <!-- Footer Navigation -->
    <nav class="bts-sidebar__nav bts-sidebar__nav--footer">
      <slot name="footer" />
    </nav>
  </aside>
</template>

<script setup>
/**
 * BtsSidebar - Sidebar navigation component based on Figma design
 *
 * Figma specs:
 * - Width Open: 256px
 * - Width Collapsed: 92px
 * - Height: 960px (full height)
 * - Background: #18365b
 * - Padding: 24px
 * - Item spacing: 24px
 *
 * Profile section:
 * - Avatar: 44x44px circle (white bg with image or initials)
 * - Title: Inter Medium 16px, color #ffffff
 * - Overline: Inter Medium 10px, uppercase, letter-spacing 0.4px, color #c6c6c6
 *
 * Toggle button:
 * - Size: 28x28px
 * - Border: 1px solid #ffffff
 * - Border-radius: 8px
 * - Position: absolute top-right
 * - Can be hidden with toggleable=false prop
 *
 * Divider:
 * - Height: 2px
 * - Background: #ffffff
 * - Border-radius: 2px
 *
 * Props:
 * - toggleable: Boolean (default: true) - Show/hide the collapse/expand toggle button
 */
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
  userName: {
    type: String,
    default: '',
  },
  companyName: {
    type: String,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  toggleable: {
    type: Boolean,
    default: true,
  },
  showAvatar: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary'].includes(value),
  },
});

defineEmits(['toggle']);

const sidebarClasses = computed(() => ({
  'bts-sidebar--collapsed': !props.isOpen,
  [`bts-sidebar--${props.variant}`]: true,
}));

const avatarInitials = computed(() => {
  if (!props.companyName) return '';
  return props.companyName
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});
</script>

<style lang="scss" scoped>
/* Sidebar - Figma specs */
/* Open: 256px, Collapsed: 92px */
.bts-sidebar {
  position: relative;
  width: 256px;
  height: 100%;
  min-height: 960px;
  background-color: var(--color-secondary-blue-s01);
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: width 0.2s ease;
  border-top-right-radius: 16px;

  &--collapsed {
    width: 92px;
  }

  /* Toggle button: 28x28px, half inside/half outside sidebar */
  &__toggle {
    position: absolute;
    top: 24px;
    right: -14px; /* Half of 28px to position half in, half out */
    width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-secondary-blue-s01);
    border: 1px solid var(--color-primary-white);
    border-radius: 8px;
    cursor: pointer;
    z-index: 10;
    color: var(--color-primary-white);
    font-size: 12px;

    :deep(svg) {
      color: var(--color-primary-white);
    }

    &:hover {
      background-color: var(--color-neutral-gray-base);
    }
  }

  &__profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-right: 40px; /* Space for toggle button */

    &--no-avatar {
      justify-content: center;
      padding-right: 0;
    }
  }

  /* Avatar: 44x44px circle */
  &__avatar {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: 50%;
    background-color: var(--color-primary-white);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__avatar-placeholder {
    font-family: var(--font-family-primary);
    font-weight: 600;
    font-size: 14px;
    color: var(--color-secondary-blue-s01);
  }

  &__profile-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;

    &--centered {
      align-items: center;
      text-align: center;
    }
  }

  /* Title: Inter Medium 16px */
  &__profile-title {
    font-family: var(--font-family-primary);
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    color: var(--color-primary-white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Overline: Inter Medium 10px, uppercase, #c6c6c6 */
  &__profile-overline {
    font-family: var(--font-family-primary);
    font-weight: 500;
    font-size: 10px;
    line-height: 12px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--color-neutral-gray-base);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__divider {
    width: 100%;
    height: 2px;
    background-color: var(--color-primary-white);
    border-radius: 2px;
    flex-shrink: 0;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &--main {
      flex-shrink: 0;
    }

    &--footer {
      flex-shrink: 0;
    }
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__section-title {
    font-family: var(--font-family-primary);
    font-weight: 500;
    font-size: 10px;
    line-height: 12px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--color-primary-white);
    padding-left: 12px;
  }

  &__spacer {
    flex: 1;
  }

  /* Collapsed state adjustments */
  &--collapsed &__profile {
    padding-right: 0;
    justify-content: center;
  }

  &--collapsed &__toggle {
    right: -14px;
  }
}

/* Variant: Primary (default) */
.bts-sidebar--primary {
  background-color: var(--color-secondary-blue-s01);

  .bts-sidebar__toggle {
    background-color: var(--color-secondary-blue-s01);
  }
}

/* Variant: Secondary (Light theme - Design System tokens) */
.bts-sidebar--secondary {
  background-color: var(--color-neutral-gray-light);

  .bts-sidebar__toggle {
    background-color: var(--color-neutral-gray-light);
    border-color: var(--color-neutral-gray-base);
    color: var(--color-neutral-black);
  }

  .bts-sidebar__toggle :deep(svg) {
    color: var(--color-neutral-black);
  }

  .bts-sidebar__toggle:hover {
    background-color: var(--color-neutral-gray-semi-light);
  }

  .bts-sidebar__divider {
    background-color: var(--color-neutral-gray-base);
  }

  .bts-sidebar__avatar-placeholder {
    color: var(--color-neutral-black);
    background-color: var(--color-neutral-gray-semi-light);
  }

  .bts-sidebar__profile-title {
    color: var(--color-neutral-black);
  }

  .bts-sidebar__profile-overline {
    color: var(--color-neutral-gray-dark);
  }

  .bts-sidebar__section-title {
    color: var(--color-neutral-gray-dark);
  }
}
</style>

