<template>
  <BtsDialog
    :modelValue="visible"
    :title="title || t('common.confirm.title')"
    size="sm"
    @update:modelValue="handleVisibilityChange"
  >
    <p class="app-confirm-dialog__message">
      {{ message || t('common.confirm.message') }}
    </p>

    <template #footer>
      <BtsButton
        variant="secondary"
        size="sm"
        @click="handleCancel"
      >
        {{ cancelText || t('common.cancel') }}
      </BtsButton>
      <BtsButton
        :variant="mappedVariant"
        size="sm"
        @click="handleConfirm"
      >
        {{ confirmText || t('common.confirm') }}
      </BtsButton>
    </template>
  </BtsDialog>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BtsDialog, BtsButton } from '@/design-system'

const { t } = useI18n()

const props = defineProps({
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

const mappedVariant = computed(() => {
  return props.variant === 'danger' ? 'danger' : 'primary'
})

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
    font-size: 14px;
    color: var(--color-text-primary, $gray-600);
    line-height: 1.6;
    margin: 0;
  }
}
</style>
