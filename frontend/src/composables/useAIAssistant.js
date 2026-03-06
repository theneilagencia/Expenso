import { ref } from 'vue'
import { useAIStore } from '@/stores/ai.store'
import { aiService } from '@/services/ai'

export function useAIAssistant() {
  const store = useAIStore()
  const loading = ref(false)
  const error = ref(null)
  const qualityScore = ref(0)
  let activeStream = null
  let debounceTimer = null

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

  function startAssistanceDraft(formData) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      _doStreamDraft(formData)
    }, 800)
  }

  function _doStreamDraft(formData) {
    stopAssistance()
    store.clearAssistant()
    store.isAssisting = true
    loading.value = true
    error.value = null
    let fullText = ''

    activeStream = aiService.streamAssistanceDraft(
      {
        description: formData.description,
        justification: formData.justification,
        category_id: formData.category_id,
        amount: formData.amount || formData.totalAmount,
        expense_date: formData.expense_date,
      },
      (chunk) => {
        fullText += chunk.content || ''
        store.addAssistantMessage(chunk)
        const match = fullText.match(/QUALITY_SCORE:\s*(\d+)/)
        if (match) {
          qualityScore.value = parseInt(match[1], 10)
        }
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
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
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

    activeStream = aiService.streamChatWithAuth(
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
    qualityScore,
    assistantMessages: store.assistantMessages,
    chatMessages: store.chatMessages,
    isAssisting: store.isAssisting,
    isChatOpen: store.isChatOpen,
    startAssistance,
    startAssistanceDraft,
    stopAssistance,
    getAnalysis,
    triggerAnalysis,
    sendChatMessage,
    toggleChat: store.toggleChat
  }
}
