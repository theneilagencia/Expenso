import http from '@/services/http'

export const aiService = {
  async getAssistance(requestId) {
    const response = await http.get(`/api/v1/ai/assist/${requestId}`, {
      responseType: 'stream'
    })
    return response
  },

  streamAssistance(requestId, onChunk, onDone) {
    const eventSource = new EventSource(
      `${http.defaults.baseURL}/api/v1/ai/assist/${requestId}/stream`,
      { withCredentials: true }
    )

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.done) {
        eventSource.close()
        onDone?.(data)
      } else {
        onChunk?.(data)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    return eventSource
  },

  async getAnalysis(requestId) {
    const { data } = await http.get(`/api/v1/ai/analysis/${requestId}`)
    return data
  },

  async triggerAnalysis(requestId) {
    const { data } = await http.post(`/api/v1/ai/analysis/${requestId}`)
    return data
  },

  streamChat(messages, onChunk, onDone) {
    const eventSource = new EventSource(
      `${http.defaults.baseURL}/api/v1/ai/chat/stream`,
      { withCredentials: true }
    )

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.done) {
        eventSource.close()
        onDone?.(data)
      } else {
        onChunk?.(data)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    return eventSource
  },

  async sendChatMessage(payload) {
    const { data } = await http.post('/api/v1/ai/chat', payload)
    return data
  },

  async getStrategistReport(params = {}) {
    const { data } = await http.get('/api/v1/ai/strategist/report', { params })
    return data
  }
}
