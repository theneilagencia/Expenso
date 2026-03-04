<template>
  <div class="request-diff">
    <h3 class="request-diff__title">{{ t('requests.versionHistory') }}</h3>
    <div v-if="!versions.length" class="request-diff__empty">{{ t('requests.noVersions') }}</div>
    <div v-else class="request-diff__list">
      <div v-for="(version, index) in versions" :key="version.id" class="request-diff__item">
        <div class="request-diff__header" @click="toggleVersion(version.id)">
          <span class="request-diff__version">v{{ versions.length - index }}</span>
          <span class="request-diff__date">{{ formatDateTime(version.created_at) }}</span>
          <span class="request-diff__toggle">{{ expanded.has(version.id) ? '−' : '+' }}</span>
        </div>
        <div v-if="expanded.has(version.id)" class="request-diff__content">
          <div v-for="(value, key) in version.snapshot" :key="key" class="request-diff__field">
            <span class="request-diff__label">{{ key }}</span>
            <span class="request-diff__value">{{ value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDateTime } from '@/utils/formatters'

const { t } = useI18n()
const expanded = ref(new Set())

defineProps({
  versions: { type: Array, default: () => [] }
})

function toggleVersion(id) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
}
</script>

<style lang="scss" scoped>
.request-diff {
  &__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 $space-md;
  }

  &__empty {
    color: $gray-500;
    font-size: 0.875rem;
  }

  &__item {
    border: 1px solid $gray-200;
    border-radius: $radius-md;
    margin-bottom: $space-sm;
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $space-md;
    padding: $space-sm $space-md;
    background: $gray-50;
    cursor: pointer;

    &:hover { background: $gray-100; }
  }

  &__version {
    font-weight: 600;
    font-size: 0.875rem;
    color: $primary;
  }

  &__date {
    font-size: 0.75rem;
    color: $gray-500;
    flex: 1;
  }

  &__toggle {
    font-size: 1.25rem;
    color: $gray-500;
  }

  &__content {
    padding: $space-md;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: $space-sm;
  }

  &__field {
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-size: 0.75rem;
    color: $gray-500;
    text-transform: uppercase;
  }

  &__value {
    font-size: 0.875rem;
    color: $gray-800;
  }
}
</style>
