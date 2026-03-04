<template>
  <form class="category-form" @submit.prevent="handleSubmit">
    <div class="category-form__field">
      <label>{{ t('admin.categories.name') }}</label>
      <input v-model="form.name" type="text" required />
    </div>
    <div class="category-form__field">
      <label>{{ t('admin.categories.description') }}</label>
      <textarea v-model="form.description" rows="3"></textarea>
    </div>
    <div class="category-form__field">
      <label>{{ t('admin.categories.maxAmount') }}</label>
      <input v-model.number="form.max_amount" type="number" min="0" step="0.01" />
    </div>
    <div class="category-form__field">
      <label class="category-form__checkbox">
        <input v-model="form.requires_receipt" type="checkbox" />
        {{ t('admin.categories.requiresReceipt') }}
      </label>
    </div>
    <div class="category-form__actions">
      <button type="button" class="category-form__btn category-form__btn--cancel" @click="$emit('cancel')">
        {{ t('common.cancel') }}
      </button>
      <button type="submit" class="category-form__btn category-form__btn--submit" :disabled="submitting">
        {{ submitting ? t('common.saving') : t('common.save') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['submit', 'cancel'])

const props = defineProps({
  category: { type: Object, default: null },
  submitting: { type: Boolean, default: false }
})

const form = reactive({
  name: props.category?.name || '',
  description: props.category?.description || '',
  max_amount: props.category?.max_amount || null,
  requires_receipt: props.category?.requires_receipt ?? true
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<style lang="scss" scoped>
.category-form {
  display: flex;
  flex-direction: column;
  gap: $space-md;

  &__field {
    display: flex;
    flex-direction: column;
    gap: $space-xs;

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: $gray-700;
    }

    input, textarea {
      padding: $space-sm $space-md;
      border: 1px solid $gray-300;
      border-radius: $radius-md;
      font-size: 0.875rem;
      font-family: inherit;

      &:focus { outline: none; border-color: $primary; }
    }
  }

  &__checkbox {
    display: flex;
    align-items: center;
    gap: $space-sm;
    cursor: pointer;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-sm;
    margin-top: $space-md;
  }

  &__btn {
    padding: $space-sm $space-xl;
    border-radius: $radius-md;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;

    &--submit {
      background: $primary;
      color: $white;
      &:hover { background: $primary-dark; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    &--cancel {
      background: $white;
      color: $gray-700;
      border: 1px solid $gray-300;
    }
  }
}
</style>
