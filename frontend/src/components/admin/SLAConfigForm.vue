<template>
  <div class="sla-form">
    <div class="sla-form__row">
      <span class="sla-form__name">{{ config.name }}</span>
      <span class="sla-form__status">{{ config.status_type }}</span>
      <div class="sla-form__field">
        <label>{{ t('admin.sla.warningHours') }}</label>
        <input v-model.number="form.warning_hours" type="number" min="1" />
      </div>
      <div class="sla-form__field">
        <label>{{ t('admin.sla.deadlineHours') }}</label>
        <input v-model.number="form.deadline_hours" type="number" min="1" />
      </div>
      <label class="sla-form__toggle">
        <input v-model="form.is_active" type="checkbox" />
        {{ t('common.active') }}
      </label>
      <button
        class="sla-form__btn"
        :disabled="saving"
        @click="handleSave"
      >
        {{ saving ? t('common.saving') : t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['save'])

const props = defineProps({
  config: { type: Object, required: true },
  saving: { type: Boolean, default: false }
})

const form = reactive({
  warning_hours: props.config.warning_hours,
  deadline_hours: props.config.deadline_hours,
  is_active: props.config.is_active
})

function handleSave() {
  emit('save', { id: props.config.id, ...form })
}
</script>

<style lang="scss" scoped>
.sla-form {
  &__row {
    display: flex;
    align-items: center;
    gap: $space-md;
    padding: $space-md;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-md;
  }

  &__name {
    font-weight: 600;
    font-size: 0.875rem;
    min-width: 120px;
  }

  &__status {
    font-size: 0.75rem;
    color: $gray-500;
    min-width: 140px;
  }

  &__field {
    display: flex;
    align-items: center;
    gap: $space-xs;

    label {
      font-size: 0.75rem;
      color: $gray-600;
      white-space: nowrap;
    }

    input {
      width: 80px;
      padding: $space-xs $space-sm;
      border: 1px solid $gray-300;
      border-radius: $radius-sm;
      font-size: 0.875rem;

      &:focus { outline: none; border-color: $primary; }
    }
  }

  &__toggle {
    display: flex;
    align-items: center;
    gap: $space-xs;
    font-size: 0.875rem;
    cursor: pointer;
  }

  &__btn {
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    padding: $space-xs $space-md;
    font-size: 0.8125rem;
    cursor: pointer;
    white-space: nowrap;

    &:hover { background: $primary-dark; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}
</style>
