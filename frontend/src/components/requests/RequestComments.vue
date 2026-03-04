<template>
  <div class="comments">
    <h3 class="comments__title">{{ t('requests.comments') }}</h3>
    <div v-if="!comments.length" class="comments__empty">{{ t('requests.noComments') }}</div>
    <div v-else class="comments__list">
      <div v-for="comment in comments" :key="comment.id" class="comments__item">
        <div class="comments__avatar">
          {{ getInitials(comment.user_name) }}
        </div>
        <div class="comments__body">
          <div class="comments__meta">
            <span class="comments__author">{{ comment.user_name }}</span>
            <span class="comments__date">{{ formatDateTime(comment.created_at) }}</span>
          </div>
          <p class="comments__text">{{ comment.content }}</p>
        </div>
      </div>
    </div>
    <form class="comments__form" @submit.prevent="handleSubmit">
      <textarea
        v-model="newComment"
        class="comments__input"
        :placeholder="t('requests.addComment')"
        rows="2"
      ></textarea>
      <button type="submit" class="comments__submit" :disabled="!newComment.trim()">
        {{ t('common.send') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDateTime } from '@/utils/formatters'

const { t } = useI18n()
const emit = defineEmits(['submit'])

defineProps({
  comments: { type: Array, default: () => [] }
})

const newComment = ref('')

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function handleSubmit() {
  if (!newComment.value.trim()) return
  emit('submit', newComment.value.trim())
  newComment.value = ''
}
</script>

<style lang="scss" scoped>
.comments {
  &__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 $space-md;
  }

  &__empty {
    color: $gray-500;
    font-size: 0.875rem;
    padding: $space-md 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-md;
    margin-bottom: $space-lg;
  }

  &__item {
    display: flex;
    gap: $space-sm;
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: $radius-full;
    background: $primary-light;
    color: $primary-dark;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    background: $gray-50;
    border-radius: $radius-md;
    padding: $space-sm $space-md;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  &__author {
    font-size: 0.875rem;
    font-weight: 600;
    color: $gray-800;
  }

  &__date {
    font-size: 0.75rem;
    color: $gray-500;
  }

  &__text {
    font-size: 0.875rem;
    color: $gray-700;
    margin: 0;
  }

  &__form {
    display: flex;
    gap: $space-sm;
    align-items: flex-end;
  }

  &__input {
    flex: 1;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    padding: $space-sm $space-md;
    font-size: 0.875rem;
    resize: vertical;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: $primary;
    }
  }

  &__submit {
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    padding: $space-sm $space-lg;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;

    &:hover { background: $primary-dark; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}
</style>
