import { ref } from 'vue'
import http from '@/services/http'

export function useFileUpload() {
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref(null)

  async function upload(file, requestId) {
    uploading.value = true
    progress.value = 0
    error.value = null

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await http.post(
        `/api/v1/requests/${requestId}/attachments`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            progress.value = Math.round((e.loaded * 100) / e.total)
          }
        }
      )
      return data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      uploading.value = false
    }
  }

  async function remove(requestId, attachmentId) {
    await http.delete(`/api/v1/requests/${requestId}/attachments/${attachmentId}`)
  }

  return { uploading, progress, error, upload, remove }
}
