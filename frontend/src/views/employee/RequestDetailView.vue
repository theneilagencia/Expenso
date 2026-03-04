<template>
  <DefaultLayout>
    <div class="request-detail">
      <div v-if="loading && !currentRequest" class="request-detail__loading">
        {{ t('common.loading') }}
      </div>

      <template v-else-if="currentRequest">
        <!-- Header -->
        <div class="request-detail__header">
          <div class="request-detail__header-left">
            <router-link
              :to="{ name: 'requests' }"
              class="request-detail__back-link"
            >
              {{ t('common.back') }}
            </router-link>
            <h2 class="request-detail__title">{{ currentRequest.title }}</h2>
            <span
              class="request-detail__status"
              :class="`request-detail__status--${statusClass(currentRequest.status)}`"
            >
              {{ statusLabel(currentRequest.status) }}
            </span>
          </div>
          <div class="request-detail__header-actions">
            <router-link
              v-if="canEdit"
              :to="{ name: 'request-edit', params: { id: currentRequest.id } }"
              class="request-detail__btn request-detail__btn--secondary"
            >
              {{ t('common.edit') }}
            </router-link>
            <button
              v-if="canSubmit"
              class="request-detail__btn request-detail__btn--primary"
              :disabled="loading"
              @click="handleSubmit"
            >
              {{ t('requests.submit') }}
            </button>
            <button
              v-if="canCancel"
              class="request-detail__btn request-detail__btn--danger"
              :disabled="loading"
              @click="handleCancel"
            >
              {{ t('requests.cancel') }}
            </button>
          </div>
        </div>

        <!-- SLA Indicator -->
        <div
          v-if="slaDeadline"
          class="request-detail__sla"
          :class="`request-detail__sla--${slaStatus}`"
        >
          <span class="request-detail__sla-label">{{ t('requests.slaDeadline') }}</span>
          <span class="request-detail__sla-value">
            <template v-if="isOverdue">
              {{ t('requests.slaOverdue') }}
            </template>
            <template v-else>
              {{ hoursRemaining }} {{ t('requests.slaHoursRemaining') }}
            </template>
          </span>
        </div>

        <div class="request-detail__content">
          <!-- Main Info Card -->
          <div class="request-detail__card">
            <h3 class="request-detail__card-title">{{ t('requests.requestInfo') }}</h3>

            <div class="request-detail__info-grid">
              <div class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('common.description') }}</span>
                <p class="request-detail__info-value">{{ currentRequest.description }}</p>
              </div>
              <div class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('common.amount') }}</span>
                <span class="request-detail__info-value request-detail__info-value--amount">
                  {{ formatCurrency(currentRequest.total_amount) }}
                </span>
              </div>
              <div class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('requests.category') }}</span>
                <span class="request-detail__info-value">{{ currentRequest.category?.name }}</span>
              </div>
              <div class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('requests.costCenter') }}</span>
                <span class="request-detail__info-value">{{ currentRequest.cost_center?.name }}</span>
              </div>
              <div class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('requests.urgencyLevel') }}</span>
                <span class="request-detail__info-value">{{ currentRequest.urgency }}</span>
              </div>
              <div class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('common.date') }}</span>
                <span class="request-detail__info-value">{{ formatDate(currentRequest.created_at) }}</span>
              </div>
            </div>

            <!-- Line Items -->
            <div v-if="currentRequest.items?.length" class="request-detail__items">
              <h4 class="request-detail__items-title">{{ t('requests.lineItems') }}</h4>
              <table class="request-detail__items-table">
                <thead>
                  <tr>
                    <th>{{ t('common.description') }}</th>
                    <th>{{ t('requests.quantity') }}</th>
                    <th>{{ t('requests.unitPrice') }}</th>
                    <th>{{ t('requests.itemTotal') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in currentRequest.items" :key="index">
                    <td>{{ item.description }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.unit_price) }}</td>
                    <td class="request-detail__item-total">
                      {{ formatCurrency(item.quantity * item.unit_price) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- AI Analysis Card -->
          <div v-if="aiAnalysis" class="request-detail__card request-detail__card--ai">
            <h3 class="request-detail__card-title">{{ t('ai.assistant') }}</h3>

            <div class="request-detail__ai-content">
              <div class="request-detail__ai-row">
                <span class="request-detail__ai-label">{{ t('ai.riskScore') }}</span>
                <span
                  class="request-detail__ai-risk"
                  :class="`request-detail__ai-risk--${aiAnalysis.risk_level}`"
                >
                  {{ aiRiskLabel(aiAnalysis.risk_level) }}
                </span>
              </div>
              <div class="request-detail__ai-row">
                <span class="request-detail__ai-label">{{ t('ai.recommendation') }}</span>
                <span class="request-detail__ai-value">{{ aiAnalysis.recommendation }}</span>
              </div>
              <div v-if="aiAnalysis.attention_points?.length" class="request-detail__ai-section">
                <span class="request-detail__ai-label">{{ t('ai.attentionPoints') }}</span>
                <ul class="request-detail__ai-list">
                  <li v-for="(point, i) in aiAnalysis.attention_points" :key="i">
                    {{ point }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Attachments -->
          <div class="request-detail__card">
            <h3 class="request-detail__card-title">{{ t('requests.attachments') }}</h3>
            <div v-if="currentRequest.attachments?.length" class="request-detail__attachments">
              <div
                v-for="attachment in currentRequest.attachments"
                :key="attachment.id"
                class="request-detail__attachment"
              >
                <span class="request-detail__attachment-name">{{ attachment.filename }}</span>
                <a
                  :href="attachment.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="request-detail__attachment-link"
                >
                  {{ t('requests.download') }}
                </a>
              </div>
            </div>
            <p v-else class="request-detail__empty-text">
              {{ t('requests.noAttachments') }}
            </p>
          </div>

          <!-- Timeline / Audit Log -->
          <div class="request-detail__card">
            <h3 class="request-detail__card-title">{{ t('requests.timeline') }}</h3>
            <div v-if="auditLog.length" class="request-detail__timeline">
              <div
                v-for="(entry, index) in auditLog"
                :key="index"
                class="request-detail__timeline-item"
              >
                <div class="request-detail__timeline-dot" />
                <div class="request-detail__timeline-content">
                  <span class="request-detail__timeline-action">{{ entry.action }}</span>
                  <span class="request-detail__timeline-user">{{ entry.user?.name }}</span>
                  <span class="request-detail__timeline-date">{{ formatDate(entry.created_at) }}</span>
                  <p v-if="entry.comment" class="request-detail__timeline-comment">
                    {{ entry.comment }}
                  </p>
                </div>
              </div>
            </div>
            <p v-else class="request-detail__empty-text">
              {{ t('requests.noTimeline') }}
            </p>
          </div>

          <!-- Comments -->
          <div class="request-detail__card">
            <h3 class="request-detail__card-title">{{ t('requests.comments') }}</h3>
            <div v-if="currentRequest.comments?.length" class="request-detail__comments">
              <div
                v-for="comment in currentRequest.comments"
                :key="comment.id"
                class="request-detail__comment"
              >
                <div class="request-detail__comment-header">
                  <span class="request-detail__comment-author">{{ comment.user?.name }}</span>
                  <span class="request-detail__comment-date">{{ formatDate(comment.created_at) }}</span>
                </div>
                <p class="request-detail__comment-body">{{ comment.content }}</p>
              </div>
            </div>

            <form class="request-detail__comment-form" @submit.prevent="handleAddComment">
              <textarea
                v-model="newComment"
                class="request-detail__comment-input"
                :placeholder="t('requests.addComment')"
                rows="3"
              />
              <button
                type="submit"
                class="request-detail__btn request-detail__btn--primary request-detail__btn--small"
                :disabled="!newComment.trim()"
              >
                {{ t('requests.sendComment') }}
              </button>
            </form>
          </div>

          <!-- Version History -->
          <div class="request-detail__card">
            <button
              class="request-detail__collapsible-header"
              @click="showVersions = !showVersions"
            >
              <h3 class="request-detail__card-title">{{ t('requests.versionHistory') }}</h3>
              <span class="request-detail__collapse-icon">{{ showVersions ? '-' : '+' }}</span>
            </button>
            <div v-if="showVersions" class="request-detail__versions">
              <div v-if="versions.length" class="request-detail__versions-list">
                <div
                  v-for="(version, index) in versions"
                  :key="index"
                  class="request-detail__version"
                >
                  <span class="request-detail__version-number">v{{ version.version }}</span>
                  <span class="request-detail__version-date">{{ formatDate(version.created_at) }}</span>
                  <span class="request-detail__version-author">{{ version.user?.name }}</span>
                </div>
              </div>
              <p v-else class="request-detail__empty-text">
                {{ t('requests.noVersions') }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useRequest } from '@/composables/useRequest'
import { useSLA } from '@/composables/useSLA'
import { useAIAssistant } from '@/composables/useAIAssistant'
import { useToast } from '@/composables/useToast'
import { REQUEST_STATUS } from '@/constants/status'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const {
  loading,
  currentRequest,
  fetchRequest,
  performAction,
  fetchAuditLog,
  fetchVersions
} = useRequest()

const { slaDeadline, hoursRemaining, isOverdue, isWarning, slaStatus } = useSLA(currentRequest)
const { getAnalysis } = useAIAssistant()

const auditLog = ref([])
const versions = ref([])
const aiAnalysis = ref(null)
const newComment = ref('')
const showVersions = ref(false)

const canEdit = computed(() => {
  const status = currentRequest.value?.status
  return status === REQUEST_STATUS.DRAFT || status === REQUEST_STATUS.IN_CORRECTION
})

const canSubmit = computed(() => {
  return currentRequest.value?.status === REQUEST_STATUS.DRAFT
})

const canCancel = computed(() => {
  const status = currentRequest.value?.status
  return status === REQUEST_STATUS.DRAFT ||
         status === REQUEST_STATUS.PENDING_MANAGER ||
         status === REQUEST_STATUS.IN_CORRECTION
})

function statusLabel(status) {
  const map = {
    [REQUEST_STATUS.DRAFT]: t('requests.statusDraft'),
    [REQUEST_STATUS.PENDING_AI]: t('requests.statusPendingAI'),
    [REQUEST_STATUS.PENDING_MANAGER]: t('requests.statusPendingManager'),
    [REQUEST_STATUS.IN_CORRECTION]: t('requests.statusInCorrection'),
    [REQUEST_STATUS.PENDING_FINANCE]: t('requests.statusPendingFinance'),
    [REQUEST_STATUS.IN_PAYMENT]: t('requests.statusInPayment'),
    [REQUEST_STATUS.PAID]: t('requests.statusPaid'),
    [REQUEST_STATUS.REJECTED_AI]: t('requests.statusRejectedAI'),
    [REQUEST_STATUS.REJECTED_MANAGER]: t('requests.statusRejectedManager'),
    [REQUEST_STATUS.REJECTED_FINANCE]: t('requests.statusRejectedFinance'),
    [REQUEST_STATUS.CANCELLED]: t('requests.statusCancelled')
  }
  return map[status] || status
}

function statusClass(status) {
  const map = {
    [REQUEST_STATUS.DRAFT]: 'draft',
    [REQUEST_STATUS.PENDING_AI]: 'pending',
    [REQUEST_STATUS.PENDING_MANAGER]: 'pending',
    [REQUEST_STATUS.IN_CORRECTION]: 'warning',
    [REQUEST_STATUS.PENDING_FINANCE]: 'pending',
    [REQUEST_STATUS.IN_PAYMENT]: 'info',
    [REQUEST_STATUS.PAID]: 'success',
    [REQUEST_STATUS.REJECTED_AI]: 'danger',
    [REQUEST_STATUS.REJECTED_MANAGER]: 'danger',
    [REQUEST_STATUS.REJECTED_FINANCE]: 'danger',
    [REQUEST_STATUS.CANCELLED]: 'cancelled'
  }
  return map[status] || 'default'
}

function aiRiskLabel(level) {
  const map = {
    low: t('ai.riskLow'),
    medium: t('ai.riskMedium'),
    high: t('ai.riskHigh'),
    block: t('ai.riskBlock')
  }
  return map[level] || level
}

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

async function handleSubmit() {
  try {
    await performAction(props.id, 'submit')
    toast.success(t('requests.submitSuccess'))
  } catch {
    toast.error(t('common.error'))
  }
}

async function handleCancel() {
  try {
    await performAction(props.id, 'cancel')
    toast.success(t('requests.cancelSuccess'))
  } catch {
    toast.error(t('common.error'))
  }
}

async function handleAddComment() {
  if (!newComment.value.trim()) return
  try {
    await performAction(props.id, 'comment', { content: newComment.value })
    newComment.value = ''
    await fetchRequest(props.id)
  } catch {
    toast.error(t('common.error'))
  }
}

async function loadAuditLog() {
  try {
    const data = await fetchAuditLog(props.id)
    auditLog.value = data || []
  } catch {
    // Audit log is non-critical
  }
}

async function loadVersions() {
  try {
    const data = await fetchVersions(props.id)
    versions.value = data || []
  } catch {
    // Versions are non-critical
  }
}

async function loadAIAnalysis() {
  try {
    const data = await getAnalysis(props.id)
    aiAnalysis.value = data
  } catch {
    // AI analysis is optional
  }
}

onMounted(async () => {
  await fetchRequest(props.id)
  loadAuditLog()
  loadVersions()
  loadAIAnalysis()
})
</script>

<style lang="scss" scoped>
.request-detail {
  max-width: 960px;
  margin: 0 auto;

  &__loading {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-base;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;
    gap: $spacing-md;
  }

  &__header-left {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__back-link {
    font-size: $font-size-sm;
    color: $primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $gray-900;
  }

  &__status {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;
    width: fit-content;

    &--draft {
      background: $gray-100;
      color: $gray-700;
    }

    &--pending {
      background: #fef3c7;
      color: #92400e;
    }

    &--warning {
      background: #fff7ed;
      color: #9a3412;
    }

    &--info {
      background: #dbeafe;
      color: #1e40af;
    }

    &--success {
      background: #dcfce7;
      color: #166534;
    }

    &--danger {
      background: #fee2e2;
      color: #991b1b;
    }

    &--cancelled {
      background: $gray-100;
      color: $gray-500;
    }

    &--default {
      background: $gray-100;
      color: $gray-600;
    }
  }

  &__header-actions {
    display: flex;
    gap: $spacing-sm;
  }

  &__btn {
    padding: $spacing-sm $spacing-lg;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--primary {
      background: $primary;
      color: $white;

      &:hover:not(:disabled) {
        background: $primary-dark;
      }
    }

    &--secondary {
      background: $white;
      color: $gray-700;
      border: 1px solid $gray-300;

      &:hover:not(:disabled) {
        background: $gray-50;
      }
    }

    &--danger {
      background: $white;
      color: $danger;
      border: 1px solid $danger;

      &:hover:not(:disabled) {
        background: $danger;
        color: $white;
      }
    }

    &--small {
      padding: $spacing-xs $spacing-md;
      font-size: $font-size-xs;
    }
  }

  &__sla {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    border-radius: $radius-md;
    margin-bottom: $spacing-lg;
    font-size: $font-size-sm;
    font-weight: 500;

    &--ok {
      background: #dcfce7;
      color: #166534;
    }

    &--warning {
      background: #fef3c7;
      color: #92400e;
    }

    &--overdue {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  &__sla-label {
    font-weight: 600;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  &__card {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    padding: $spacing-xl;

    &--ai {
      border-left: 4px solid $info;
    }
  }

  &__card-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-lg;
  }

  &__info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;
  }

  &__info-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__info-label {
    font-size: $font-size-xs;
    font-weight: 500;
    color: $gray-500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__info-value {
    font-size: $font-size-sm;
    color: $gray-800;

    &--amount {
      font-size: $font-size-xl;
      font-weight: 700;
      color: $gray-900;
      font-variant-numeric: tabular-nums;
    }
  }

  &__items {
    border-top: 1px solid $gray-100;
    padding-top: $spacing-lg;
  }

  &__items-title {
    font-size: $font-size-base;
    font-weight: 600;
    color: $gray-700;
    margin-bottom: $spacing-md;
  }

  &__items-table {
    width: 100%;
    border-collapse: collapse;

    th {
      text-align: left;
      padding: $spacing-sm $spacing-md;
      font-size: $font-size-xs;
      font-weight: 600;
      color: $gray-600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: $gray-50;
      border-bottom: 1px solid $gray-200;
    }

    td {
      padding: $spacing-sm $spacing-md;
      font-size: $font-size-sm;
      color: $gray-700;
      border-bottom: 1px solid $gray-100;
    }
  }

  &__item-total {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &__ai-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__ai-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__ai-label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-600;
  }

  &__ai-value {
    font-size: $font-size-sm;
    color: $gray-800;
  }

  &__ai-risk {
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 600;

    &--low {
      background: #dcfce7;
      color: #166534;
    }

    &--medium {
      background: #fef3c7;
      color: #92400e;
    }

    &--high {
      background: #fee2e2;
      color: #991b1b;
    }

    &--block {
      background: $gray-900;
      color: $white;
    }
  }

  &__ai-section {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__ai-list {
    padding-left: $spacing-lg;
    font-size: $font-size-sm;
    color: $gray-700;

    li {
      margin-bottom: $spacing-xs;
    }
  }

  &__attachments {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__attachment {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-sm $spacing-md;
    background: $gray-50;
    border-radius: $radius-md;
  }

  &__attachment-name {
    font-size: $font-size-sm;
    color: $gray-700;
  }

  &__attachment-link {
    font-size: $font-size-xs;
    color: $primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__timeline {
    position: relative;
    padding-left: $spacing-xl;

    &::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: $gray-200;
    }
  }

  &__timeline-item {
    position: relative;
    padding-bottom: $spacing-lg;

    &:last-child {
      padding-bottom: 0;
    }
  }

  &__timeline-dot {
    position: absolute;
    left: -#{$spacing-xl};
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: $radius-full;
    background: $primary;
    border: 2px solid $white;
    box-shadow: 0 0 0 2px $primary-light;
    z-index: 1;
  }

  &__timeline-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__timeline-action {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-800;
  }

  &__timeline-user {
    font-size: $font-size-xs;
    color: $gray-600;
  }

  &__timeline-date {
    font-size: $font-size-xs;
    color: $gray-400;
  }

  &__timeline-comment {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
    color: $gray-600;
    padding: $spacing-sm;
    background: $gray-50;
    border-radius: $radius-sm;
  }

  &__comments {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  &__comment {
    padding: $spacing-md;
    background: $gray-50;
    border-radius: $radius-md;
  }

  &__comment-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
  }

  &__comment-author {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-800;
  }

  &__comment-date {
    font-size: $font-size-xs;
    color: $gray-400;
  }

  &__comment-body {
    font-size: $font-size-sm;
    color: $gray-700;
    line-height: 1.5;
  }

  &__comment-form {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    align-items: flex-end;
  }

  &__comment-input {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-800;
    resize: vertical;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 3px $primary-light;
    }
  }

  &__collapsible-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;

    .request-detail__card-title {
      margin-bottom: 0;
    }
  }

  &__collapse-icon {
    font-size: $font-size-xl;
    color: $gray-500;
    font-weight: 300;
    line-height: 1;
  }

  &__versions {
    margin-top: $spacing-lg;
  }

  &__versions-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__version {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-sm $spacing-md;
    background: $gray-50;
    border-radius: $radius-sm;
  }

  &__version-number {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $primary;
    min-width: 40px;
  }

  &__version-date {
    font-size: $font-size-xs;
    color: $gray-500;
  }

  &__version-author {
    font-size: $font-size-xs;
    color: $gray-600;
    margin-left: auto;
  }

  &__empty-text {
    font-size: $font-size-sm;
    color: $gray-500;
    text-align: center;
    padding: $spacing-md;
  }
}
</style>
