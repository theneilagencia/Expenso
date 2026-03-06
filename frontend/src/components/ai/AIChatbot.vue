<template>
  <div class="chatbot" :class="{ 'chatbot--open': isOpen }">
    <button class="chatbot__toggle" @click="$emit('toggle')">
      <span v-if="!isOpen" class="chatbot__toggle-icon">AI</span>
      <span v-else class="chatbot__toggle-icon">✕</span>
    </button>
    <div v-if="isOpen" class="chatbot__window">
      <div class="chatbot__header">
        <h3>{{ t('ai.chatbot') }}</h3>
      </div>
      <div class="chatbot__messages" ref="messagesEl">
        <div v-if="!messages.length" class="chatbot__welcome">
          {{ t('ai.chatWelcome') }}
        </div>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="chatbot__message"
          :class="`chatbot__message--${msg.role}`"
        >
          {{ msg.content }}<span v-if="msg.streaming && loading" class="chatbot__cursor">|</span>
        </div>
        <div v-if="loading && !messages.some(m => m.streaming)" class="chatbot__typing">
          <span></span><span></span><span></span>
        </div>
      </div>
      <form class="chatbot__input" @submit.prevent="handleSend">
        <input
          v-model="input"
          type="text"
          :placeholder="t('ai.chatPlaceholder')"
          :disabled="loading"
        />
        <button type="submit" :disabled="!input.trim() || loading">
          {{ t('common.send') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['send', 'toggle'])

const props = defineProps({
  messages: { type: Array, default: () => [] },
  isOpen: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const input = ref('')
const messagesEl = ref(null)

function handleSend() {
  if (!input.value.trim()) return
  emit('send', input.value.trim())
  input.value = ''
}

watch(() => props.messages.length, async () => {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
})
</script>

<style lang="scss" scoped>
.chatbot {
  position: fixed;
  bottom: $space-lg;
  right: $space-lg;
  z-index: $z-modal;

  &__toggle {
    width: 48px;
    height: 48px;
    border-radius: $radius-full;
    background: $primary;
    color: $white;
    border: none;
    cursor: pointer;
    box-shadow: $shadow-lg;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover { background: $primary-dark; }
  }

  &__toggle-icon {
    font-size: 0.875rem;
    font-weight: 700;
  }

  &--open &__toggle {
    position: absolute;
    bottom: 0;
    right: 0;
  }

  &__window {
    position: absolute;
    bottom: 60px;
    right: 0;
    width: 360px;
    height: 480px;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__header {
    padding: $space-sm $space-md;
    background: $primary;
    color: $white;

    h3 { margin: 0; font-size: 0.875rem; }
  }

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: $space-md;
    display: flex;
    flex-direction: column;
    gap: $space-sm;
  }

  &__welcome {
    text-align: center;
    color: $gray-500;
    font-size: 0.875rem;
    margin-top: $space-xl;
  }

  &__message {
    max-width: 85%;
    padding: $space-sm $space-md;
    border-radius: $radius-md;
    font-size: 0.875rem;
    line-height: 1.4;

    &--user {
      align-self: flex-end;
      background: $primary;
      color: $white;
      border-bottom-right-radius: 2px;
    }

    &--assistant {
      align-self: flex-start;
      background: $gray-100;
      color: $gray-800;
      border-bottom-left-radius: 2px;
    }
  }

  &__typing {
    display: flex;
    gap: 4px;
    padding: $space-xs;
    align-self: flex-start;

    span {
      width: 6px;
      height: 6px;
      border-radius: $radius-full;
      background: $gray-400;
      animation: bounce 1.4s infinite both;

      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }

  &__input {
    display: flex;
    border-top: 1px solid $gray-200;

    input {
      flex: 1;
      border: none;
      padding: $space-sm $space-md;
      font-size: 0.875rem;
      font-family: inherit;

      &:focus { outline: none; }
    }

    button {
      background: $primary;
      color: $white;
      border: none;
      padding: $space-sm $space-md;
      font-size: 0.875rem;
      cursor: pointer;

      &:hover { background: $primary-dark; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  }
}

.chatbot__cursor {
  animation: blink 0.7s infinite;
  font-weight: 700;
  color: $primary;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
