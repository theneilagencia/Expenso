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

  function clearAssistant() {
    assistantMessages.value = []
  }

  function toggleChat() {
    isChatOpen.value = !isChatOpen.value
  }

  return { assistantMessages, chatMessages, isAssisting, isChatOpen, addAssistantMessage, addChatMessage, clearAssistant, toggleChat }
})
