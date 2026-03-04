<template>
  <form class="comment-form" @submit.prevent="handleSubmit">
    <h4 class="comment-form__title">{{ title }}</h4>
    <textarea
      v-model="comment"
      class="comment-form__input"
      :placeholder="t('approvals.commentPlaceholder')"
      rows="3"
      :required="required"
    ></textarea>
    <div class="comment-form__actions">
      <button type="button" class="comment-form__btn comment-form__btn--cancel" @click="$emit('cancel')">
        {{ t('common.cancel') }}
      </button>
      <button
        type="submit"
        class="comment-form__btn"
        :class="`comment-form__btn--${variant}`"
        :disabled="required && !comment.trim()"
      >
        {{ confirmLabel }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['submit', 'cancel'])

defineProps({
  title: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  variant: { type: String, default: 'primary' },
  required: { type: Boolean, default: true }
})

const comment = ref('')

function handleSubmit() {
  emit('submit', comment.value.trim())
  comment.value = ''
}
</script>

<style lang="scss" scoped>
.comment-form {
  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 $space-sm;
  }

  &__input {
    width: 100%;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    padding: $space-sm $space-md;
    font-size: 0.875rem;
    font-family: inherit;
    resize: vertical;

    &:focus { outline: none; border-color: $primary; }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-sm;
    margin-top: $space-sm;
  }

  &__btn {
    padding: $space-xs $space-lg;
    border-radius: $radius-md;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;

    &--cancel {
      background: $white;
      color: $gray-700;
      border: 1px solid $gray-300;
    }

    &--primary { background: $primary; color: $white; }
    &--danger { background: $danger; color: $white; }
    &--warning { background: $warning; color: $white; }

    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}
</style>
