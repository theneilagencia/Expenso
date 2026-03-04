<template>
  <div class="app-filter-bar">
    <div class="app-filter-bar__filters">
      <div
        v-for="filter in filters"
        :key="filter.key"
        class="app-filter-bar__field"
      >
        <label
          :for="`filter-${filter.key}`"
          class="app-filter-bar__label"
        >
          {{ filter.label }}
        </label>

        <!-- Text input -->
        <input
          v-if="filter.type === 'text'"
          :id="`filter-${filter.key}`"
          type="text"
          class="app-filter-bar__input"
          :placeholder="filter.placeholder || t('common.search')"
          :value="modelValue[filter.key] || ''"
          @input="updateFilter(filter.key, $event.target.value)"
        />

        <!-- Select input -->
        <select
          v-else-if="filter.type === 'select'"
          :id="`filter-${filter.key}`"
          class="app-filter-bar__select"
          :value="modelValue[filter.key] || ''"
          @change="updateFilter(filter.key, $event.target.value)"
        >
          <option value="">
            {{ filter.placeholder || t('common.filter') }}
          </option>
          <option
            v-for="option in filter.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <!-- Date input -->
        <input
          v-else-if="filter.type === 'date'"
          :id="`filter-${filter.key}`"
          type="date"
          class="app-filter-bar__input app-filter-bar__input--date"
          :value="modelValue[filter.key] || ''"
          @change="updateFilter(filter.key, $event.target.value)"
        />
      </div>
    </div>

    <button
      class="app-filter-bar__reset"
      @click="handleReset"
    >
      {{ t('common.resetFilters') }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  filters: {
    type: Array,
    required: true,
    validator: (filters) => filters.every((f) => f.key && f.label && f.type)
  },
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'reset'])

function updateFilter(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

function handleReset() {
  const emptyFilters = {}
  for (const filter of props.filters) {
    emptyFilters[filter.key] = ''
  }
  emit('update:modelValue', emptyFilters)
  emit('reset')
}
</script>

<style lang="scss" scoped>
.app-filter-bar {
  display: flex;
  align-items: flex-end;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: $gray-50;
  border: 1px solid $gray-200;
  border-radius: $radius-lg;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    align-items: stretch;
  }

  &__filters {
    display: flex;
    align-items: flex-end;
    gap: $spacing-md;
    flex: 1;
    flex-wrap: wrap;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    min-width: 160px;
    flex: 1;
    max-width: 240px;

    @media (max-width: $breakpoint-md) {
      max-width: none;
    }
  }

  &__label {
    font-size: $font-size-xs;
    font-weight: 500;
    color: $gray-600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__input,
  &__select {
    height: 38px;
    padding: 0 $spacing-sm;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;
    background-color: $white;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba($primary, 0.1);
    }

    &::placeholder {
      color: $gray-400;
    }
  }

  &__select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right $spacing-sm center;
    padding-right: $spacing-xl;
  }

  &__input--date {
    cursor: pointer;
  }

  &__reset {
    flex-shrink: 0;
    height: 38px;
    padding: 0 $spacing-md;
    border: 1px solid $gray-300;
    background-color: $white;
    color: $gray-600;
    font-size: $font-size-sm;
    font-weight: 500;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;

    &:hover {
      background-color: $gray-50;
      border-color: $gray-400;
      color: $gray-700;
    }
  }
}
</style>
