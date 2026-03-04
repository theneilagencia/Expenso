<template>
  <div class="batch-selector">
    <div class="batch-selector__header">
      <label class="batch-selector__check-all">
        <input type="checkbox" :checked="allSelected" @change="toggleAll" />
        <span>{{ t('payments.selectAll') }}</span>
      </label>
      <span class="batch-selector__count">
        {{ t('payments.selected', { count: selected.length }) }}
      </span>
    </div>
    <button
      v-if="selected.length > 0"
      class="batch-selector__btn"
      :disabled="processing"
      @click="$emit('process', selected)"
    >
      {{ processing ? t('payments.processing') : t('payments.processSelected') }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['update:selected', 'process'])

const props = defineProps({
  items: { type: Array, default: () => [] },
  selected: { type: Array, default: () => [] },
  processing: { type: Boolean, default: false }
})

const allSelected = computed(() =>
  props.items.length > 0 && props.selected.length === props.items.length
)

function toggleAll(e) {
  emit('update:selected', e.target.checked ? props.items.map(i => i.id) : [])
}
</script>

<style lang="scss" scoped>
.batch-selector {
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-sm $space-md;
  background: $gray-50;
  border-radius: $radius-md;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-md;
    flex: 1;
  }

  &__check-all {
    display: flex;
    align-items: center;
    gap: $space-xs;
    font-size: 0.875rem;
    cursor: pointer;
  }

  &__count {
    font-size: 0.75rem;
    color: $gray-600;
  }

  &__btn {
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    padding: $space-xs $space-lg;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;

    &:hover { background: $primary-dark; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}
</style>
