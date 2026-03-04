<template>
  <div
    class="app-avatar"
    :class="`app-avatar--${size}`"
    :title="name"
  >
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="name"
      class="app-avatar__image"
      @error="imageError = true"
    />
    <span v-else class="app-avatar__initials">
      {{ initials }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  src: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  }
})

const imageError = ref(false)

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
})
</script>

<style lang="scss" scoped>
.app-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  background-color: $primary-light;
  color: $primary-dark;
  font-weight: 600;
  flex-shrink: 0;
  overflow: hidden;

  &--sm {
    width: 32px;
    height: 32px;
    font-size: $font-size-xs;
  }

  &--md {
    width: 40px;
    height: 40px;
    font-size: $font-size-sm;
  }

  &--lg {
    width: 56px;
    height: 56px;
    font-size: $font-size-lg;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__initials {
    line-height: 1;
    user-select: none;
  }
}
</style>
