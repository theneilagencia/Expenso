<template>
  <span class="bts-icon" :class="sizeClass" :style="iconStyles" aria-hidden="true">
    <font-awesome-icon :icon="iconArray" />
  </span>
</template>

<script setup>
/**
 * BtsIcon - Icon component using Font Awesome
 *
 * Figma specs:
 * - Size: 24x24px (md), 16x16px (sm), 32x32px (lg)
 * - Color: #555555 (md)
 * - Uses Font Awesome icons
 *
 * Usage:
 * <BtsIcon name="user" /> renders FontAwesome user icon
 * <BtsIcon name="envelope" prefix="fas" /> renders FontAwesome envelope icon (solid)
 */
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: 'far',
    validator: (value) => ['fas', 'far', 'fab', 'fal', 'fad'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },
  color: {
    type: String,
    default: '#555555',
  },
});

// FontAwesome espera um array [prefix, iconName]
const iconArray = computed(() => [props.prefix, props.name]);

const sizeClass = computed(() => `bts-icon--${props.size}`);

const iconStyles = computed(() => ({
  color: props.color,
}));
</script>

<style lang="scss" scoped>
.bts-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--xs {
    width: 12px;
    height: 12px;
    font-size: 12px;
  }

  &--sm {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }

  &--md {
    width: 24px;
    height: 24px;
    font-size: 24px;
  }

  &--lg {
    width: 32px;
    height: 32px;
    font-size: 32px;
  }

  &--xl {
    width: 48px;
    height: 48px;
    font-size: 48px;
  }

  i {
    line-height: 1;
  }
}
</style>

