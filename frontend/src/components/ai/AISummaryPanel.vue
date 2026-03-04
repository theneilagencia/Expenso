<template>
  <div class="ai-summary" v-if="summary">
    <div class="ai-summary__header">
      <span class="ai-summary__badge">AI</span>
      <span class="ai-summary__label">{{ t('ai.summary') }}</span>
    </div>
    <p class="ai-summary__text">{{ summary }}</p>
    <div v-if="tags?.length" class="ai-summary__tags">
      <span v-for="tag in tags" :key="tag" class="ai-summary__tag">{{ tag }}</span>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  summary: { type: String, default: '' },
  tags: { type: Array, default: () => [] }
})
</script>

<style lang="scss" scoped>
.ai-summary {
  background: lighten($primary, 40%);
  border: 1px solid $primary-light;
  border-radius: $radius-md;
  padding: $space-md;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-sm;
    margin-bottom: $space-sm;
  }

  &__badge {
    background: $primary;
    color: $white;
    font-size: 0.625rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: $radius-sm;
  }

  &__label {
    font-size: 0.75rem;
    font-weight: 600;
    color: $primary-dark;
  }

  &__text {
    font-size: 0.875rem;
    color: $gray-700;
    line-height: 1.5;
    margin: 0;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $space-xs;
    margin-top: $space-sm;
  }

  &__tag {
    font-size: 0.75rem;
    background: $white;
    color: $primary;
    padding: 2px $space-sm;
    border-radius: $radius-full;
    border: 1px solid $primary-light;
  }
}
</style>
