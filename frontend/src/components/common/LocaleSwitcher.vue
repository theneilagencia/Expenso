<template>
  <div class="locale-switcher">
    <button
      class="locale-switcher__toggle"
      @click="isOpen = !isOpen"
    >
      <span class="locale-switcher__flag">{{ currentFlag }}</span>
      <span class="locale-switcher__label">{{ currentLabel }}</span>
    </button>
    <div v-if="isOpen" class="locale-switcher__dropdown">
      <button
        v-for="loc in SUPPORTED_LOCALES"
        :key="loc.code"
        class="locale-switcher__option"
        :class="{ 'locale-switcher__option--active': loc.code === currentLocale }"
        @click="switchLocale(loc.code)"
      >
        <span>{{ loc.flag }}</span>
        <span>{{ loc.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { SUPPORTED_LOCALES } from '@/constants/locales'

const { setLocale, currentLocale } = useLocale()
const isOpen = ref(false)

const currentFlag = computed(() =>
  SUPPORTED_LOCALES.find(l => l.code === currentLocale.value)?.flag || '\u{1F1FA}\u{1F1F8}'
)

const currentLabel = computed(() =>
  SUPPORTED_LOCALES.find(l => l.code === currentLocale.value)?.label || 'English'
)

function switchLocale(code) {
  setLocale(code)
  isOpen.value = false
}
</script>

<style lang="scss" scoped>
.locale-switcher {
  position: relative;

  &__toggle {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    border: 1px solid $gray-200;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: $primary;
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: $spacing-xs;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-md;
    box-shadow: $shadow-md;
    z-index: $z-dropdown;
    min-width: 160px;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: none;
    font-size: $font-size-sm;
    color: $gray-700;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: $gray-50;
    }

    &--active {
      background: $primary-light;
      color: $primary-dark;
    }
  }
}
</style>
