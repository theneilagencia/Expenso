<template>
  <ul class="bts-list" :class="rootClasses" role="list">
    <slot />
  </ul>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  dividers: {
    type: Boolean,
    default: false,
  },
  dense: {
    type: Boolean,
    default: false,
  },
});

const rootClasses = computed(() => ({
  'bts-list--dividers': props.dividers,
  'bts-list--dense': props.dense,
}));
</script>

<style lang="scss" scoped>
.bts-list {
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: var(--font-family-primary);

  &--dividers {
    :deep(.bts-list-item + .bts-list-item) {
      border-top: 1px solid var(--color-neutral-gray-light, #e5e7eb);
    }
  }

  &--dense {
    :deep(.bts-list-item) {
      padding: 8px 12px;
    }
  }
}
</style>

