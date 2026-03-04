import { ref } from 'vue'
import { useAIStore } from '@/stores/ai.store'
import { aiService } from '@/services/ai'

export function useAIAssistant() {
  const store = useAIStore()
  const loading = ref(false)
  const error = ref(null)
  let activeStream = null

  function startAssistance(requestId) {
    store.clearAssistant()
    store.isAssisting = true
    loading.value = true
    error.value = null

    activeStream = aiService.streamAssistance(
      requestId,
      (chunk) => {
        store.addAssistantMessage(chunk)
      },
      () => {
        store.isAssisting = false
        loading.value = false
      }
    )
  }

  function stopAssistance() {
    if (activeStream) {
      activeStream.close()
      activeStream = null
    }
    store.isAssisting = false
    loading.value = false
  }

  async function getAnalysis(requestId) {
    loading.value = true
    error.value = null
    try {
      return await aiService.getAnalysis(requestId)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function triggerAnalysis(requestId) {
    loading.value = true
    error.value = null
    try {
      return await aiService.triggerAnalysis(requestId)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  function sendChatMessage(message) {
    store.addChatMessage({ role: 'user', content: message })
    loading.value = true

    activeStream = aiService.streamChat(
      store.chatMessages,
      (chunk) => {
        store.addChatMessage({ role: 'assistant', content: chunk.content, streaming: true })
      },
      () => {
        loading.value = false
      }
    )
  }

  return {
    loading,
    error,
    assistantMessages: store.assistantMessages,
    chatMessages: store.chatMessages,
    isAssisting: store.isAssisting,
    isChatOpen: store.isChatOpen,
    startAssistance,
    stopAssistance,
    getAnalysis,
    triggerAnalysis,
    sendChatMessage,
    toggleChat: store.toggleChat
  }
}
