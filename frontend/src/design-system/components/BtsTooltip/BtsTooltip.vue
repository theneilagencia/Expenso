<template>
  <div
    class="bts-tooltip-wrapper"
    :aria-describedby="isVisible ? tooltipId : undefined"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
  >
    <slot />
    <transition name="fade">
      <div
        v-if="isVisible"
        :id="tooltipId"
        class="bts-tooltip"
        :class="tooltipClasses"
        role="tooltip"
        aria-live="polite"
      >
        <div v-if="showTitle && title" class="bts-tooltip__title">{{ title }}</div>
        <div class="bts-tooltip__content">{{ content }}</div>
        <div class="bts-tooltip__arrow"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
/**
 * BtsTooltip - Tooltip component based on Figma design
 *
 * Figma specs:
 * - Background: #000000 (black)
 * - Border: 1px #18365b
 * - Border radius: 8px
 * - Padding: 15px horizontal, 10px vertical
 * - Title (optional): Montserrat Bold 12px, white, line-height 20px
 * - Content: Inter Regular 14px, white, line-height 20px
 * - Positions: Top (default), Right, Bottom, Left
 */
import { ref, computed, onBeforeUnmount, useId } from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  showTitle: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  delay: {
    type: Number,
    default: 200
  }
});

const isVisible = ref(false);
let timeout = null;
const tooltipId = useId();

const tooltipClasses = computed(() => [`bts-tooltip--${props.position}`]);

function show() {
  timeout = setTimeout(() => { isVisible.value = true; }, props.delay);
}

function hide() {
  clearTimeout(timeout);
  isVisible.value = false;
}

onBeforeUnmount(() => {
  clearTimeout(timeout);
});
</script>

<style lang="scss" scoped>
.bts-tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.bts-tooltip {
  position: absolute;
  z-index: 1000;
  padding: 10px 15px;
  background-color: var(--color-primary-black);
  border: 1px solid var(--color-secondary-blue-s01);
  color: var(--color-primary-white);
  border-radius: 8px;
  white-space: nowrap;
  max-width: 300px;

  &__title {
    font-family: var(--font-family-primary);
    font-weight: 700;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: -0.12px;
    margin-bottom: 3px;
  }

  &__content {
    font-family: var(--font-family-primary);
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
  }

  &__arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: 8px solid transparent;
  }

  &--top {
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    .bts-tooltip__arrow {
      top: 100%; left: 50%; transform: translateX(-50%);
      border-top-color: var(--color-primary-black);
    }
  }

  &--bottom {
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    .bts-tooltip__arrow {
      bottom: 100%; left: 50%; transform: translateX(-50%);
      border-bottom-color: var(--color-primary-black);
    }
  }

  &--left {
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    .bts-tooltip__arrow {
      left: 100%; top: 50%; transform: translateY(-50%);
      border-left-color: var(--color-primary-black);
    }
  }

  &--right {
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    .bts-tooltip__arrow {
      right: 100%; top: 50%; transform: translateY(-50%);
      border-right-color: var(--color-primary-black);
    }
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

