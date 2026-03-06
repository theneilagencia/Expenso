import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAIStore = defineStore('ai', () => {
  const assistantMessages = ref([])
  const chatMessages = ref([])
  const isAssisting = ref(false)
  const isChatOpen = ref(false)

  function addAssistantMessage(msg) {
    assistantMessages.value.push(msg)
  }

  function addChatMessage(msg) {
    chatMessages.value.push(msg)
  }

  function updateLastAssistantMessage(content) {
    const lastIndex = chatMessages.value.length - 1
    if (lastIndex >= 0 && chatMessages.value[lastIndex].role === 'assistant') {
      chatMessages.value[lastIndex] = { role: 'assistant', content, streaming: true }
    } else {
      chatMessages.value.push({ role: 'assistant', content, streaming: true })
    }
  }

  function clearAssistant() {
    assistantMessages.value = []
  }

  function clearChat() {
    chatMessages.value = []
  }

  function toggleChat() {
    isChatOpen.value = !isChatOpen.value
  }

  return {
    assistantMessages, chatMessages, isAssisting, isChatOpen,
    addAssistantMessage, addChatMessage, updateLastAssistantMessage,
    clearAssistant, clearChat, toggleChat,
  }
})
