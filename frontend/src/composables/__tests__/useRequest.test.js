import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockList = vi.fn()
const mockGetById = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockSubmit = vi.fn()
const mockGetAuditLog = vi.fn()
const mockGetVersions = vi.fn()

vi.mock('@/services/requests', () => ({
  requestsService: {
    list: (...args) => mockList(...args),
    getById: (...args) => mockGetById(...args),
    create: (...args) => mockCreate(...args),
    update: (...args) => mockUpdate(...args),
    submit: (...args) => mockSubmit(...args),
    getAuditLog: (...args) => mockGetAuditLog(...args),
    getVersions: (...args) => mockGetVersions(...args),
  },
}))

import { useRequest } from '../useRequest'

describe('useRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('should initialize with loading=false', () => {
    const { loading } = useRequest()
    expect(loading.value).toBe(false)
  })

  it('should set loading during fetchRequest', async () => {
    const requestData = { id: '1', title: 'Test', status: 'DRAFT' }
    mockGetById.mockResolvedValue(requestData)

    const { loading, fetchRequest } = useRequest()
    const promise = fetchRequest('1')
    expect(loading.value).toBe(true)

    const result = await promise
    expect(loading.value).toBe(false)
    expect(result).toEqual(requestData)
    expect(mockGetById).toHaveBeenCalledWith('1')
  })

  it('should call requestsService.create on createRequest', async () => {
    const payload = { title: 'New', amount: 100 }
    mockCreate.mockResolvedValue({ id: 'new', ...payload })

    const { createRequest } = useRequest()
    const result = await createRequest(payload)
    expect(result.id).toBe('new')
    expect(mockCreate).toHaveBeenCalledWith(payload)
  })

  it('should set error on failed fetchRequest', async () => {
    mockGetById.mockRejectedValue(new Error('Not found'))

    const { error, fetchRequest } = useRequest()
    await fetchRequest('bad-id').catch(() => {})
    expect(error.value).toBeTruthy()
  })

  it('should call update service and return data', async () => {
    const updated = { id: '1', title: 'Updated' }
    mockUpdate.mockResolvedValue(updated)

    const { updateRequest } = useRequest()
    const result = await updateRequest('1', { title: 'Updated' })
    expect(result).toEqual(updated)
    expect(mockUpdate).toHaveBeenCalledWith('1', { title: 'Updated' })
  })

  it('should call action method on performAction', async () => {
    mockSubmit.mockResolvedValue({ id: '1', status: 'PENDING_AI' })

    const { performAction } = useRequest()
    const result = await performAction('1', 'submit')
    expect(result.status).toBe('PENDING_AI')
    expect(mockSubmit).toHaveBeenCalledWith('1', {})
  })

  it('should delegate fetchAuditLog to service', async () => {
    mockGetAuditLog.mockResolvedValue([{ action: 'submit' }])
    const { fetchAuditLog } = useRequest()
    const result = await fetchAuditLog('1')
    expect(result).toHaveLength(1)
    expect(mockGetAuditLog).toHaveBeenCalledWith('1')
  })

  it('should delegate fetchVersions to service', async () => {
    mockGetVersions.mockResolvedValue([{ version_number: 1 }])
    const { fetchVersions } = useRequest()
    const result = await fetchVersions('1')
    expect(result).toHaveLength(1)
    expect(mockGetVersions).toHaveBeenCalledWith('1')
  })
})
