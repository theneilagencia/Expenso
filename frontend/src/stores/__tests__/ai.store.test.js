import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAIStore } from '../ai.store'

describe('ai.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('chat session history', () => {
    it('should accumulate messages as they are added', () => {
      const store = useAIStore()

      store.addChatMessage({ role: 'user', content: 'Hello' })
      store.addChatMessage({ role: 'assistant', content: 'Hi there!' })
      store.addChatMessage({ role: 'user', content: 'How are expenses trending?' })

      expect(store.chatMessages).toHaveLength(3)
      expect(store.chatMessages[0]).toEqual({ role: 'user', content: 'Hello' })
      expect(store.chatMessages[1]).toEqual({ role: 'assistant', content: 'Hi there!' })
      expect(store.chatMessages[2]).toEqual({ role: 'user', content: 'How are expenses trending?' })
    })
  })

  describe('updateLastAssistantMessage', () => {
    it('should update the last assistant message in-place without duplicating', () => {
      const store = useAIStore()

      store.addChatMessage({ role: 'user', content: 'Analyze my expenses' })
      store.addChatMessage({ role: 'assistant', content: 'Processing...' })

      expect(store.chatMessages).toHaveLength(2)

      // Update the last assistant message with new content
      store.updateLastAssistantMessage('Here is your full analysis report.')

      // Should still be 2 messages, not 3
      expect(store.chatMessages).toHaveLength(2)
      expect(store.chatMessages[1]).toEqual({
        role: 'assistant',
        content: 'Here is your full analysis report.',
        streaming: true,
      })
    })

    it('should push a new assistant message if the last message is not from assistant', () => {
      const store = useAIStore()

      store.addChatMessage({ role: 'user', content: 'Tell me about risks' })

      // Last message is from user, so updateLastAssistantMessage should push
      store.updateLastAssistantMessage('Risk analysis in progress...')

      expect(store.chatMessages).toHaveLength(2)
      expect(store.chatMessages[1]).toEqual({
        role: 'assistant',
        content: 'Risk analysis in progress...',
        streaming: true,
      })
    })
  })

  describe('clearChat', () => {
    it('should reset chat messages to an empty array', () => {
      const store = useAIStore()

      store.addChatMessage({ role: 'user', content: 'First message' })
      store.addChatMessage({ role: 'assistant', content: 'Response' })
      store.addChatMessage({ role: 'user', content: 'Follow-up' })

      expect(store.chatMessages).toHaveLength(3)

      store.clearChat()

      expect(store.chatMessages).toHaveLength(0)
      expect(store.chatMessages).toEqual([])
    })
  })
})
