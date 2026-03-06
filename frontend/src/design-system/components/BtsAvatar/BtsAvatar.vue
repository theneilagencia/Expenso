<template>
  <div class="bts-avatar" :class="rootClasses" :style="rootStyles">
    <!-- Image -->
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt"
      class="bts-avatar__image"
      @error="imgError = true"
    />

    <!-- Initials fallback -->
    <span v-else-if="computedInitials" class="bts-avatar__initials">
      {{ computedInitials }}
    </span>

    <!-- Icon fallback -->
    <BtsIcon
      v-else
      :name="icon"
      :prefix="iconPrefix"
      :size="iconSize"
      color="currentColor"
      class="bts-avatar__icon"
    />

  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import BtsIcon from '../BtsIcon/BtsIcon.vue';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  initials: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'user',
  },
  iconPrefix: {
    type: String,
    default: 'far',
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  shape: {
    type: String,
    default: 'circle',
    validator: (value) => ['circle', 'square'].includes(value),
  },

});

const imgError = ref(false);

const computedInitials = computed(() => {
  if (props.initials) return props.initials.substring(0, 2).toUpperCase();
  return '';
});

const iconSize = computed(() => {
  const map = { sm: 'xs', md: 'sm', lg: 'md' };
  return map[props.size];
});

const rootClasses = computed(() => ({
  [`bts-avatar--${props.size}`]: true,
  [`bts-avatar--${props.shape}`]: true,
}));

const rootStyles = computed(() => ({}));
</script>

<style lang="scss" scoped>
.bts-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: var(--color-neutral-gray-light, #e5e7eb);
  color: var(--color-neutral-gray-dark, #555555);
  font-family: var(--font-family-primary);
  overflow: hidden;

  /* Sizes */
  &--sm { width: 32px; height: 32px; font-size: 12px; }
  &--md { width: 40px; height: 40px; font-size: 14px; }
  &--lg { width: 56px; height: 56px; font-size: 18px; }

  /* Shape */
  &--circle { border-radius: 50%; }
  &--square { border-radius: 8px; }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__initials {
    font-weight: 600;
    line-height: 1;
    user-select: none;
    text-transform: uppercase;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

}
</style>

