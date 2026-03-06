import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAIAssistant } from '../useAIAssistant'

vi.mock('@/services/ai', () => ({
  aiService: {
    streamAssistanceDraft: vi.fn(() => ({ close: vi.fn() })),
    streamAssistance: vi.fn(() => ({ close: vi.fn() })),
    streamChatWithAuth: vi.fn(() => ({ close: vi.fn() })),
    getAnalysis: vi.fn(),
    triggerAnalysis: vi.fn(),
  }
}))

vi.mock('@/stores/ai.store', () => ({
  useAIStore: vi.fn(() => ({
    assistantMessages: [],
    chatMessages: [],
    isAssisting: false,
    isChatOpen: false,
    addAssistantMessage: vi.fn(),
    addChatMessage: vi.fn(),
    updateLastAssistantMessage: vi.fn(),
    clearAssistant: vi.fn(),
    clearChat: vi.fn(),
    toggleChat: vi.fn(),
  }))
}))

import { aiService } from '@/services/ai'

describe('useAIAssistant', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mockFormData = {
    description: 'Office supplies purchase',
    justification: 'Needed for Q2 projects',
    category_id: 'cat-1',
    amount: 150.00,
    expense_date: '2026-03-05',
  }

  describe('startAssistanceDraft debounce', () => {
    it('should wait 800ms before calling the service', () => {
      const { startAssistanceDraft } = useAIAssistant()

      startAssistanceDraft(mockFormData)

      // Service should NOT be called immediately
      expect(aiService.streamAssistanceDraft).not.toHaveBeenCalled()

      // Advance past the 800ms debounce threshold
      vi.advanceTimersByTime(800)

      // Now the service should have been called
      expect(aiService.streamAssistanceDraft).toHaveBeenCalledTimes(1)
    })

    it('should cancel the previous timer when called again within 800ms', () => {
      const { startAssistanceDraft } = useAIAssistant()

      // First call
      startAssistanceDraft(mockFormData)
      vi.advanceTimersByTime(400)

      // Second call before debounce fires
      startAssistanceDraft({ ...mockFormData, description: 'Updated description' })
      vi.advanceTimersByTime(400)

      // Only 400ms since second call — service still not called
      expect(aiService.streamAssistanceDraft).not.toHaveBeenCalled()

      // Advance remaining 400ms for the second debounce
      vi.advanceTimersByTime(400)

      // Service called exactly once (first timer was cancelled)
      expect(aiService.streamAssistanceDraft).toHaveBeenCalledTimes(1)
    })
  })

  describe('quality score extraction', () => {
    it('should extract quality score from streamed text containing QUALITY_SCORE', () => {
      // Configure the mock to capture the onChunk callback and invoke it
      aiService.streamAssistanceDraft.mockImplementation((params, onChunk, onDone) => {
        onChunk({ content: 'Analysis complete. QUALITY_SCORE: 85 - Good submission.' })
        return { close: vi.fn() }
      })

      const { startAssistanceDraft, qualityScore } = useAIAssistant()

      startAssistanceDraft(mockFormData)
      vi.advanceTimersByTime(800)

      expect(qualityScore.value).toBe(85)
    })
  })

  describe('stopAssistance', () => {
    it('should clear loading and assisting state', () => {
      const { startAssistanceDraft, stopAssistance, loading } = useAIAssistant()

      // Start a draft to set loading/assisting state
      startAssistanceDraft(mockFormData)
      vi.advanceTimersByTime(800)

      // Stop assistance
      stopAssistance()

      expect(loading.value).toBe(false)
    })
  })
})
