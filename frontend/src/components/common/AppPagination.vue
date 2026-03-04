<template>
  <nav
    v-if="totalPages > 1"
    class="app-pagination"
    :aria-label="t('common.pagination.page')"
  >
    <button
      class="app-pagination__btn app-pagination__btn--prev"
      :disabled="modelValue <= 1"
      :aria-label="t('common.pagination.previous')"
      @click="goTo(modelValue - 1)"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      <span class="app-pagination__btn-label">{{ t('common.pagination.previous') }}</span>
    </button>

    <div class="app-pagination__pages">
      <button
        v-for="p in visiblePages"
        :key="p"
        class="app-pagination__page"
        :class="{ 'app-pagination__page--active': p === modelValue, 'app-pagination__page--ellipsis': p === '...' }"
        :disabled="p === '...'"
        :aria-label="p !== '...' ? t('common.pagination.goToPage', { page: p }) : undefined"
        :aria-current="p === modelValue ? 'page' : undefined"
        @click="p !== '...' ? goTo(p) : null"
      >
        {{ p }}
      </button>
    </div>

    <button
      class="app-pagination__btn app-pagination__btn--next"
      :disabled="modelValue >= totalPages"
      :aria-label="t('common.pagination.next')"
      @click="goTo(modelValue + 1)"
    >
      <span class="app-pagination__btn-label">{{ t('common.pagination.next') }}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

function goTo(page) {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:modelValue', page)
  }
}

const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.modelValue
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
    return pages
  }

  // Always show first page
  pages.push(1)

  if (current > 3) {
    pages.push('...')
  }

  // Show pages around current
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('...')
  }

  // Always show last page
  pages.push(total)

  return pages
})
</script>

<style lang="scss" scoped>
.app-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-200;
    background-color: $white;
    color: $gray-700;
    font-size: $font-size-sm;
    font-weight: 500;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background-color: $gray-50;
      border-color: $gray-300;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__btn-label {
    @media (max-width: $breakpoint-sm) {
      display: none;
    }
  }

  &__pages {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__page {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 $spacing-sm;
    border: 1px solid transparent;
    background: none;
    color: $gray-600;
    font-size: $font-size-sm;
    font-weight: 500;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled):not(&--active) {
      background-color: $gray-100;
    }

    &--active {
      background-color: $primary;
      color: $white;
      border-color: $primary;
      cursor: default;
    }

    &--ellipsis {
      cursor: default;
      color: $gray-400;

      &:hover {
        background: none;
      }
    }
  }
}
</style>
