<template>
  <AppModal
    :visible="visible"
    :title="title || t('common.confirm.title')"
    size="sm"
    @update:visible="handleVisibilityChange"
  >
    <p class="app-confirm-dialog__message">
      {{ message || t('common.confirm.message') }}
    </p>

    <template #footer>
      <button
        class="app-confirm-dialog__btn app-confirm-dialog__btn--cancel"
        @click="handleCancel"
      >
        {{ cancelText || t('common.cancel') }}
      </button>
      <button
        class="app-confirm-dialog__btn"
        :class="`app-confirm-dialog__btn--${variant}`"
        @click="handleConfirm"
      >
        {{ confirmText || t('common.confirm') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import AppModal from './AppModal.vue'

const { t } = useI18n()

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (val) => ['danger', 'warning'].includes(val)
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

function handleConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

function handleVisibilityChange(val) {
  emit('update:visible', val)
  if (!val) {
    emit('cancel')
  }
}
</script>

<style lang="scss" scoped>
.app-confirm-dialog {
  &__message {
    font-size: $font-size-sm;
    color: $gray-600;
    line-height: 1.6;
    margin: 0;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    padding: 0 $spacing-lg;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &--cancel {
      background-color: $white;
      color: $gray-700;
      border: 1px solid $gray-300;

      &:hover {
        background-color: $gray-50;
        border-color: $gray-400;
      }
    }

    &--danger {
      background-color: $danger;
      color: $white;

      &:hover {
        background-color: darken($danger, 8%);
      }
    }

    &--warning {
      background-color: $warning;
      color: $white;

      &:hover {
        background-color: darken($warning, 8%);
      }
    }
  }
}
</style>
