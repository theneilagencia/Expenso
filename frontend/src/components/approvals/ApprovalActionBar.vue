<template>
  <div class="approval-bar">
    <div class="approval-bar__actions">
      <button
        class="approval-bar__btn approval-bar__btn--approve"
        :disabled="loading"
        @click="handleApprove"
      >
        {{ t('approvals.approve') }}
      </button>
      <button
        class="approval-bar__btn approval-bar__btn--edit"
        :disabled="loading"
        @click="showEditForm = true"
      >
        {{ t('approvals.requestEdit') }}
      </button>
      <button
        class="approval-bar__btn approval-bar__btn--reject"
        :disabled="loading"
        @click="showRejectForm = true"
      >
        {{ t('approvals.reject') }}
      </button>
    </div>

    <div v-if="showRejectForm || showEditForm" class="approval-bar__comment">
      <textarea
        v-model="comment"
        class="approval-bar__textarea"
        :placeholder="t('approvals.commentPlaceholder')"
        rows="3"
      ></textarea>
      <div class="approval-bar__comment-actions">
        <button class="approval-bar__btn approval-bar__btn--cancel" @click="cancelComment">
          {{ t('common.cancel') }}
        </button>
        <button
          class="approval-bar__btn"
          :class="showRejectForm ? 'approval-bar__btn--reject' : 'approval-bar__btn--edit'"
          :disabled="!comment.trim() || loading"
          @click="submitComment"
        >
          {{ showRejectForm ? t('approvals.confirmReject') : t('approvals.confirmEdit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['approve', 'reject', 'request-edit'])

defineProps({
  loading: { type: Boolean, default: false }
})

const comment = ref('')
const showRejectForm = ref(false)
const showEditForm = ref(false)

function handleApprove() {
  emit('approve')
}

function submitComment() {
  if (!comment.value.trim()) return
  if (showRejectForm.value) {
    emit('reject', comment.value.trim())
  } else {
    emit('request-edit', comment.value.trim())
  }
  cancelComment()
}

function cancelComment() {
  comment.value = ''
  showRejectForm.value = false
  showEditForm.value = false
}
</script>

<style lang="scss" scoped>
.approval-bar {
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-md;
  padding: $space-lg;

  &__actions {
    display: flex;
    gap: $space-md;
  }

  &__btn {
    padding: $space-sm $space-lg;
    border-radius: $radius-md;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;

    &--approve {
      background: $success;
      color: $white;
      &:hover { filter: brightness(0.9); }
    }

    &--reject {
      background: $danger;
      color: $white;
      &:hover { filter: brightness(0.9); }
    }

    &--edit {
      background: $warning;
      color: $white;
      &:hover { filter: brightness(0.9); }
    }

    &--cancel {
      background: $white;
      color: $gray-700;
      border: 1px solid $gray-300;
      &:hover { background: $gray-50; }
    }

    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &__comment {
    margin-top: $space-md;
    padding-top: $space-md;
    border-top: 1px solid $gray-200;
  }

  &__textarea {
    width: 100%;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    padding: $space-sm $space-md;
    font-size: 0.875rem;
    font-family: inherit;
    resize: vertical;

    &:focus { outline: none; border-color: $primary; }
  }

  &__comment-actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-sm;
    margin-top: $space-sm;
  }
}
</style>
