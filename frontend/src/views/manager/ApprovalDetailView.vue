<template>
  <DefaultLayout>
    <div class="approval-detail">
      <div
        v-if="loading"
        class="approval-detail__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="error"
        class="approval-detail__error"
      >
        {{ t('common.error') }}
      </div>

      <template v-else-if="currentRequest">
        <div class="approval-detail__header">
          <button
            class="approval-detail__back"
            @click="goBack"
          >
            &larr; {{ t('common.back') }}
          </button>
          <h2 class="approval-detail__title">{{ currentRequest.title }}</h2>
          <span :class="['approval-detail__status', `approval-detail__status--${currentRequest.status?.toLowerCase()}`]">
            {{ t(`status.${currentRequest.status}`) }}
          </span>
        </div>

        <!-- Request Info Card -->
        <div class="approval-detail__card">
          <h3 class="approval-detail__card-title">{{ t('approvals.detail.requestInfo') }}</h3>
          <div class="approval-detail__info-grid">
            <div class="approval-detail__info-item">
              <span class="approval-detail__info-label">{{ t('approvals.detail.requester') }}</span>
              <span class="approval-detail__info-value">{{ currentRequest.requester_name }}</span>
            </div>
            <div class="approval-detail__info-item">
              <span class="approval-detail__info-label">{{ t('approvals.detail.department') }}</span>
              <span class="approval-detail__info-value">{{ currentRequest.department }}</span>
            </div>
            <div class="approval-detail__info-item">
              <span class="approval-detail__info-label">{{ t('approvals.detail.totalAmount') }}</span>
              <span class="approval-detail__info-value approval-detail__info-value--highlight">
                {{ formatCurrency(currentRequest.total_amount) }}
              </span>
            </div>
            <div class="approval-detail__info-item">
              <span class="approval-detail__info-label">{{ t('approvals.detail.submittedAt') }}</span>
              <span class="approval-detail__info-value">{{ formatDate(currentRequest.created_at) }}</span>
            </div>
            <div class="approval-detail__info-item">
              <span class="approval-detail__info-label">{{ t('approvals.detail.category') }}</span>
              <span class="approval-detail__info-value">{{ currentRequest.category }}</span>
            </div>
            <div class="approval-detail__info-item">
              <span class="approval-detail__info-label">{{ t('approvals.detail.slaDeadline') }}</span>
              <span class="approval-detail__info-value">{{ formatDate(currentRequest.sla_deadline) }}</span>
            </div>
          </div>
          <div
            v-if="currentRequest.description"
            class="approval-detail__description"
          >
            <span class="approval-detail__info-label">{{ t('approvals.detail.description') }}</span>
            <p class="approval-detail__description-text">{{ currentRequest.description }}</p>
          </div>
        </div>

        <!-- Items -->
        <div
          v-if="currentRequest.items?.length"
          class="approval-detail__card"
        >
          <h3 class="approval-detail__card-title">{{ t('approvals.detail.items') }}</h3>
          <table class="approval-detail__items-table">
            <thead>
              <tr>
                <th class="approval-detail__items-th">{{ t('approvals.detail.itemDescription') }}</th>
                <th class="approval-detail__items-th approval-detail__items-th--right">
                  {{ t('approvals.detail.itemQuantity') }}
                </th>
                <th class="approval-detail__items-th approval-detail__items-th--right">
                  {{ t('approvals.detail.itemUnitPrice') }}
                </th>
                <th class="approval-detail__items-th approval-detail__items-th--right">
                  {{ t('approvals.detail.itemTotal') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in currentRequest.items"
                :key="item.id"
                class="approval-detail__items-row"
              >
                <td class="approval-detail__items-td">{{ item.description }}</td>
                <td class="approval-detail__items-td approval-detail__items-td--right">{{ item.quantity }}</td>
                <td class="approval-detail__items-td approval-detail__items-td--right">
                  {{ formatCurrency(item.unit_price) }}
                </td>
                <td class="approval-detail__items-td approval-detail__items-td--right">
                  {{ formatCurrency(item.total) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Attachments -->
        <div
          v-if="currentRequest.attachments?.length"
          class="approval-detail__card"
        >
          <h3 class="approval-detail__card-title">{{ t('approvals.detail.attachments') }}</h3>
          <ul class="approval-detail__attachments">
            <li
              v-for="attachment in currentRequest.attachments"
              :key="attachment.id"
              class="approval-detail__attachment"
            >
              <a
                :href="attachment.url"
                target="_blank"
                rel="noopener noreferrer"
                class="approval-detail__attachment-link"
              >
                {{ attachment.filename }}
              </a>
              <span class="approval-detail__attachment-size">{{ formatFileSize(attachment.size) }}</span>
            </li>
          </ul>
        </div>

        <!-- AI Analysis -->
        <div
          v-if="currentRequest.ai_analysis"
          class="approval-detail__card"
        >
          <h3 class="approval-detail__card-title">{{ t('approvals.detail.aiAnalysis') }}</h3>
          <div class="approval-detail__ai">
            <div class="approval-detail__ai-scores">
              <div class="approval-detail__ai-score">
                <span class="approval-detail__ai-score-label">{{ t('approvals.detail.riskScore') }}</span>
                <span :class="['approval-detail__ai-score-value', getRiskClass(currentRequest.ai_analysis.risk_score)]">
                  {{ currentRequest.ai_analysis.risk_score }}/100
                </span>
              </div>
              <div class="approval-detail__ai-score">
                <span class="approval-detail__ai-score-label">{{ t('approvals.detail.qualityScore') }}</span>
                <span :class="['approval-detail__ai-score-value', getQualityClass(currentRequest.ai_analysis.quality_score)]">
                  {{ currentRequest.ai_analysis.quality_score }}/100
                </span>
              </div>
            </div>
            <div
              v-if="currentRequest.ai_analysis.recommendations?.length"
              class="approval-detail__ai-recommendations"
            >
              <h4 class="approval-detail__ai-recommendations-title">
                {{ t('approvals.detail.recommendations') }}
              </h4>
              <ul class="approval-detail__ai-recommendations-list">
                <li
                  v-for="(rec, index) in currentRequest.ai_analysis.recommendations"
                  :key="index"
                  class="approval-detail__ai-recommendation"
                >
                  {{ rec }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- AI Summary -->
        <div
          v-if="aiSummary || summaryLoading"
          class="approval-detail__card"
        >
          <h3 class="approval-detail__card-title">{{ t('approvals.aiSummary') }}</h3>
          <div
            v-if="summaryLoading"
            class="approval-detail__loading"
          >
            {{ t('common.loading') }}
          </div>
          <p
            v-else
            class="approval-detail__summary-text"
          >
            {{ aiSummary }}
          </p>
        </div>

        <!-- Audit Trail -->
        <div
          v-if="auditLog.length"
          class="approval-detail__card"
        >
          <h3 class="approval-detail__card-title">{{ t('approvals.detail.auditTrail') }}</h3>
          <div class="approval-detail__timeline">
            <div
              v-for="entry in auditLog"
              :key="entry.id"
              class="approval-detail__timeline-item"
            >
              <div class="approval-detail__timeline-dot" />
              <div class="approval-detail__timeline-content">
                <div class="approval-detail__timeline-header">
                  <span class="approval-detail__timeline-action">{{ entry.action }}</span>
                  <span class="approval-detail__timeline-date">{{ formatDateTime(entry.created_at) }}</span>
                </div>
                <span class="approval-detail__timeline-user">{{ entry.user_name }}</span>
                <p
                  v-if="entry.comment"
                  class="approval-detail__timeline-comment"
                >
                  {{ entry.comment }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Comment Form -->
        <div class="approval-detail__card">
          <h3 class="approval-detail__card-title">{{ t('approvals.detail.comment') }}</h3>
          <div class="approval-detail__suggest-actions">
            <button
              class="approval-detail__suggest-btn"
              :disabled="suggestLoading"
              @click="handleSuggestComment('approve')"
            >
              {{ t('approvals.suggestApprove') }}
            </button>
            <button
              class="approval-detail__suggest-btn approval-detail__suggest-btn--reject"
              :disabled="suggestLoading"
              @click="handleSuggestComment('reject')"
            >
              {{ t('approvals.suggestReject') }}
            </button>
          </div>
          <textarea
            v-model="comment"
            class="approval-detail__comment-input"
            :placeholder="t('approvals.detail.commentPlaceholder')"
            rows="4"
          />
          <p
            v-if="commentRequired && !comment.trim()"
            class="approval-detail__comment-error"
          >
            {{ t('approvals.detail.commentRequired') }}
          </p>
        </div>

        <!-- Action Bar -->
        <div class="approval-detail__actions">
          <button
            class="approval-detail__action-btn approval-detail__action-btn--approve"
            :disabled="actionLoading"
            @click="handleApprove"
          >
            {{ t('approvals.actions.approve') }}
          </button>
          <button
            class="approval-detail__action-btn approval-detail__action-btn--reject"
            :disabled="actionLoading"
            @click="handleReject"
          >
            {{ t('approvals.actions.reject') }}
          </button>
          <button
            class="approval-detail__action-btn approval-detail__action-btn--edit"
            :disabled="actionLoading"
            @click="handleRequestEdit"
          >
            {{ t('approvals.actions.requestEdit') }}
          </button>
        </div>
      </template>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useApproval } from '@/composables/useApproval'
import { useRequest } from '@/composables/useRequest'
import { useToast } from '@/composables/useToast'
import { aiService } from '@/services/ai'
import { ROUTE_NAMES } from '@/constants/routes'

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
  loading: actionLoading,
  approve,
  reject,
  requestEdit
} = useApproval()

const {
  loading,
  error,
  currentRequest,
  fetchRequest,
  fetchAuditLog
} = useRequest()

const auditLog = ref([])
const comment = ref('')
const commentRequired = ref(false)
const aiSummary = ref(null)
const summaryLoading = ref(false)
const suggestLoading = ref(false)

const requestId = props.id || route.params.id

function goBack() {
  router.push({ name: ROUTE_NAMES.APPROVALS })
}

function formatCurrency(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateStr))
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(1)} ${units[i]}`
}

function getRiskClass(score) {
  if (score >= 70) return 'approval-detail__ai-score-value--danger'
  if (score >= 40) return 'approval-detail__ai-score-value--warning'
  return 'approval-detail__ai-score-value--success'
}

function getQualityClass(score) {
  if (score >= 70) return 'approval-detail__ai-score-value--success'
  if (score >= 40) return 'approval-detail__ai-score-value--warning'
  return 'approval-detail__ai-score-value--danger'
}

async function handleApprove() {
  try {
    await approve(requestId, comment.value)
    toast.success(t('approvals.messages.approved'))
    goBack()
  } catch {
    toast.error(t('approvals.messages.approveError'))
  }
}

async function handleReject() {
  commentRequired.value = true
  if (!comment.value.trim()) return

  try {
    await reject(requestId, comment.value)
    toast.success(t('approvals.messages.rejected'))
    goBack()
  } catch {
    toast.error(t('approvals.messages.rejectError'))
  }
}

async function handleRequestEdit() {
  commentRequired.value = true
  if (!comment.value.trim()) return

  try {
    await requestEdit(requestId, comment.value)
    toast.success(t('approvals.messages.editRequested'))
    goBack()
  } catch {
    toast.error(t('approvals.messages.editRequestError'))
  }
}

async function handleGenerateSummary() {
  summaryLoading.value = true
  try {
    const result = await aiService.generateSummary(requestId)
    aiSummary.value = result.summary || null
  } catch {
    // Summary is non-critical
  } finally {
    summaryLoading.value = false
  }
}

async function handleSuggestComment(action) {
  suggestLoading.value = true
  try {
    const result = await aiService.suggestComment(requestId, action)
    comment.value = result.suggestion || ''
  } catch {
    toast.error(t('common.error'))
  } finally {
    suggestLoading.value = false
  }
}

onMounted(async () => {
  await fetchRequest(requestId)
  handleGenerateSummary()
  try {
    const log = await fetchAuditLog(requestId)
    auditLog.value = log || []
  } catch {
    // Audit log fetch is non-critical
  }
})
</script>

<style lang="scss" scoped>
.approval-detail {
  max-width: 56rem;
  margin: 0 auto;

  &__loading,
  &__error {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-lg;
  }

  &__error {
    color: $danger;
  }

  &__header {
    margin-bottom: $spacing-xl;
  }

  &__back {
    display: inline-block;
    margin-bottom: $spacing-md;
    padding: $spacing-xs $spacing-sm;
    background: none;
    border: none;
    color: $primary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: $primary-dark;
    }
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $gray-900;
    margin-bottom: $spacing-sm;
  }

  &__status {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;

    &--pending_manager {
      background: rgba($warning, 0.1);
      color: $warning;
    }

    &--pending_ai {
      background: rgba($info, 0.1);
      color: $info;
    }

    &--in_correction {
      background: rgba($secondary, 0.1);
      color: $secondary;
    }

    &--pending_finance {
      background: rgba($primary, 0.1);
      color: $primary;
    }
  }

  &__card {
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    padding: $spacing-lg;
    margin-bottom: $spacing-lg;
  }

  &__card-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $gray-100;
  }

  &__info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-md;
  }

  &__info-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__info-label {
    font-size: $font-size-sm;
    color: $gray-500;
    font-weight: 500;
  }

  &__info-value {
    font-size: $font-size-base;
    color: $gray-800;

    &--highlight {
      font-size: $font-size-lg;
      font-weight: 700;
      color: $primary;
    }
  }

  &__description {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid $gray-100;
  }

  &__description-text {
    margin-top: $spacing-xs;
    color: $gray-700;
    line-height: 1.6;
  }

  &__items-table {
    width: 100%;
    border-collapse: collapse;
  }

  &__items-th {
    padding: $spacing-sm $spacing-md;
    text-align: left;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-600;
    border-bottom: 1px solid $gray-200;

    &--right {
      text-align: right;
    }
  }

  &__items-row {
    &:not(:last-child) {
      border-bottom: 1px solid $gray-100;
    }
  }

  &__items-td {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-sm;
    color: $gray-700;

    &--right {
      text-align: right;
    }
  }

  &__attachments {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__attachment {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm 0;

    &:not(:last-child) {
      border-bottom: 1px solid $gray-100;
    }
  }

  &__attachment-link {
    color: $primary;
    text-decoration: none;
    font-size: $font-size-sm;

    &:hover {
      text-decoration: underline;
    }
  }

  &__attachment-size {
    font-size: $font-size-xs;
    color: $gray-400;
  }

  &__ai {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__ai-scores {
    display: flex;
    gap: $spacing-xl;
  }

  &__ai-score {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__ai-score-label {
    font-size: $font-size-sm;
    color: $gray-500;
    font-weight: 500;
  }

  &__ai-score-value {
    font-size: $font-size-xl;
    font-weight: 700;

    &--success {
      color: $success;
    }

    &--warning {
      color: $warning;
    }

    &--danger {
      color: $danger;
    }
  }

  &__ai-recommendations-title {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-700;
    margin-bottom: $spacing-sm;
  }

  &__ai-recommendations-list {
    padding-left: $spacing-lg;
    margin: 0;
  }

  &__ai-recommendation {
    font-size: $font-size-sm;
    color: $gray-600;
    padding: $spacing-xs 0;
    line-height: 1.5;
  }

  &__timeline {
    position: relative;
    padding-left: $spacing-lg;

    &::before {
      content: '';
      position: absolute;
      left: 0.4rem;
      top: 0.5rem;
      bottom: 0.5rem;
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
    left: -#{$spacing-lg};
    top: 0.35rem;
    width: 0.625rem;
    height: 0.625rem;
    border-radius: $radius-full;
    background: $primary;
    border: 2px solid $white;
    box-shadow: 0 0 0 2px $primary-light;
  }

  &__timeline-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__timeline-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__timeline-action {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-800;
  }

  &__timeline-date {
    font-size: $font-size-xs;
    color: $gray-400;
  }

  &__timeline-user {
    font-size: $font-size-sm;
    color: $gray-600;
  }

  &__timeline-comment {
    font-size: $font-size-sm;
    color: $gray-500;
    font-style: italic;
    margin: 0;
  }

  &__summary-text {
    color: $gray-700;
    line-height: 1.6;
    font-size: $font-size-sm;
    margin: 0;
  }

  &__suggest-actions {
    display: flex;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }

  &__suggest-btn {
    padding: $spacing-xs $spacing-md;
    background: $white;
    color: $primary;
    border: 1px solid $primary;
    border-radius: $radius-md;
    font-size: $font-size-xs;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: $primary;
      color: $white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--reject {
      color: $danger;
      border-color: $danger;

      &:hover:not(:disabled) {
        background: $danger;
        color: $white;
      }
    }
  }

  &__comment-input {
    width: 100%;
    padding: $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;
    resize: vertical;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }
  }

  &__comment-error {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
    color: $danger;
  }

  &__actions {
    position: sticky;
    bottom: 0;
    display: flex;
    gap: $spacing-md;
    padding: $spacing-lg;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    margin-top: $spacing-lg;
  }

  &__action-btn {
    flex: 1;
    padding: $spacing-md $spacing-lg;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-base;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--approve {
      background: $success;
      color: $white;

      &:hover:not(:disabled) {
        background: darken($success, 8%);
      }
    }

    &--reject {
      background: $danger;
      color: $white;

      &:hover:not(:disabled) {
        background: darken($danger, 8%);
      }
    }

    &--edit {
      background: $warning;
      color: $white;

      &:hover:not(:disabled) {
        background: darken($warning, 8%);
      }
    }
  }
}
</style>
