<template>
  <router-view />
  <AppToast />
  <AIChatbot
    v-if="authStore.isAuthenticated"
    :messages="aiStore.chatMessages"
    :is-open="aiStore.isChatOpen"
    :loading="chatLoading"
    @toggle="aiStore.toggleChat()"
    @send="handleChatSend"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useAuthStore } from '@/stores/auth.store'
import { useAIStore } from '@/stores/ai.store'
import AppToast from '@/components/common/AppToast.vue'
import AIChatbot from '@/components/ai/AIChatbot.vue'
import { aiService } from '@/services/ai'

const { initLocale } = useLocale()
const authStore = useAuthStore()
const aiStore = useAIStore()
const chatLoading = ref(false)

onMounted(() => {
  initLocale()
})

function handleChatSend(message) {
  aiStore.addChatMessage({ role: 'user', content: message })
  chatLoading.value = true

  aiService.sendChatMessage({ messages: aiStore.chatMessages })
    .then(data => {
      aiStore.addChatMessage({ role: 'assistant', content: data.content || data.message })
    })
    .catch(() => {
      aiStore.addChatMessage({ role: 'assistant', content: 'Sorry, something went wrong.' })
    })
    .finally(() => {
      chatLoading.value = false
    })
}
</script>
