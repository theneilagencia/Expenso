<template>
  <div class="ai-assistant">
    <div class="ai-assistant__header">
      <span class="ai-assistant__icon">AI</span>
      <h3 class="ai-assistant__title">{{ t('ai.assistant') }}</h3>
      <button v-if="isAssisting" class="ai-assistant__stop" @click="$emit('stop')">
        {{ t('ai.stop') }}
      </button>
    </div>
    <div class="ai-assistant__body">
      <div v-if="!messages.length && !isAssisting" class="ai-assistant__empty">
        <p>{{ t('ai.assistantHint') }}</p>
        <button class="ai-assistant__start" @click="$emit('start')">
          {{ t('ai.startAssistance') }}
        </button>
      </div>
      <div v-else class="ai-assistant__messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="ai-assistant__message"
        >
          {{ msg.content || msg }}
        </div>
        <div v-if="isAssisting" class="ai-assistant__typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  messages: { type: Array, default: () => [] },
  isAssisting: { type: Boolean, default: false }
})

defineEmits(['start', 'stop'])
</script>

<style lang="scss" scoped>
.ai-assistant {
  background: $white;
  border: 1px solid $primary-light;
  border-radius: $radius-md;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-sm;
    padding: $space-sm $space-md;
    background: linear-gradient(135deg, $primary-light, lighten($primary, 35%));
    border-bottom: 1px solid $primary-light;
  }

  &__icon {
    width: 24px;
    height: 24px;
    border-radius: $radius-sm;
    background: $primary;
    color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    font-weight: 700;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
    flex: 1;
  }

  &__stop {
    font-size: 0.75rem;
    background: none;
    border: 1px solid $danger;
    color: $danger;
    border-radius: $radius-sm;
    padding: 2px $space-sm;
    cursor: pointer;
  }

  &__body {
    padding: $space-md;
    max-height: 300px;
    overflow-y: auto;
  }

  &__empty {
    text-align: center;
    color: $gray-600;

    p { font-size: 0.875rem; margin: 0 0 $space-md; }
  }

  &__start {
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    padding: $space-xs $space-lg;
    font-size: 0.875rem;
    cursor: pointer;

    &:hover { background: $primary-dark; }
  }

  &__messages {
    display: flex;
    flex-direction: column;
    gap: $space-sm;
  }

  &__message {
    font-size: 0.875rem;
    color: $gray-700;
    line-height: 1.5;
  }

  &__typing {
    display: flex;
    gap: 4px;
    padding: $space-xs;

    span {
      width: 6px;
      height: 6px;
      border-radius: $radius-full;
      background: $primary;
      animation: bounce 1.4s infinite both;

      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
