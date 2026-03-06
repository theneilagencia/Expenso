import http from '@/services/http'
import { useAuthStore } from '@/stores/auth.store'

function _createSSEStream(url, options, onChunk, onDone) {
  const authStore = useAuthStore()
  const controller = new AbortController()

  fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${authStore.token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: controller.signal,
  })
    .then(response => {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            onDone?.()
            return
          }
          const text = decoder.decode(value)
          const lines = text.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.done) {
                  onDone?.(data)
                } else {
                  onChunk?.(data)
                }
              } catch {
                // skip malformed lines
              }
            }
          }
          read()
        })
      }
      read()
    })
    .catch(() => {
      onDone?.()
    })

  return { close: () => controller.abort() }
}

export const aiService = {
  async getAssistance(requestId) {
    const response = await http.get(`/api/v1/ai/assist/${requestId}`, {
      responseType: 'stream'
    })
    return response
  },

  streamAssistance(requestId, onChunk, onDone) {
    return _createSSEStream(
      `${http.defaults.baseURL}/api/v1/ai/assist/${requestId}/stream`,
      {},
      onChunk,
      onDone
    )
  },

  streamAssistanceDraft(params, onChunk, onDone) {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
      )
    ).toString()

    return _createSSEStream(
      `${http.defaults.baseURL}/api/v1/ai/assist/stream?${queryString}`,
      {},
      onChunk,
      onDone
    )
  },

  async getAnalysis(requestId) {
    const { data } = await http.get(`/api/v1/ai/analysis/${requestId}`)
    return data
  },

  async triggerAnalysis(requestId) {
    const { data } = await http.post(`/api/v1/ai/analysis/${requestId}`)
    return data
  },

  streamChatWithAuth(messages, onChunk, onDone) {
    return _createSSEStream(
      `${http.defaults.baseURL}/api/v1/ai/chat/stream`,
      { method: 'POST', body: { messages } },
      onChunk,
      onDone
    )
  },

  async sendChatMessage(payload) {
    const { data } = await http.post('/api/v1/ai/chat', payload)
    return data
  },

  async getStrategistReport(params = {}) {
    const { data } = await http.get('/api/v1/ai/strategist/report', { params })
    return data
  },

  async getAIUsage(params = {}) {
    const { data } = await http.get('/api/v1/ai/admin/ai-usage', { params })
    return data
  }
}
