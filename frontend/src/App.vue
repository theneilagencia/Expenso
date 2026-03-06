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
let activeStream = null

onMounted(() => {
  initLocale()
})

function handleChatSend(message) {
  aiStore.addChatMessage({ role: 'user', content: message })
  chatLoading.value = true
  let assistantContent = ''

  if (activeStream) {
    activeStream.close()
  }

  activeStream = aiService.streamChatWithAuth(
    aiStore.chatMessages.filter(m => !m.streaming),
    (chunk) => {
      assistantContent += chunk.content || ''
      aiStore.updateLastAssistantMessage(assistantContent)
    },
    () => {
      chatLoading.value = false
      activeStream = null
    }
  )
}
</script>
