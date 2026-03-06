<template>
  <DefaultLayout>
    <div class="dashboard">
      <!-- Welcome -->
      <div class="dashboard__welcome-section">
        <h2 class="dashboard__greeting">
          {{ t('dashboard.welcome', { name: userName }) }}
        </h2>
        <p class="dashboard__subtitle">{{ t('dashboard.subtitle') }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="dashboard__stats">
        <div class="dashboard__stat-card">
          <span class="dashboard__stat-label">{{ t('dashboard.totalRequests') }}</span>
          <span class="dashboard__stat-value">{{ stats.total }}</span>
        </div>
        <div class="dashboard__stat-card dashboard__stat-card--pending">
          <span class="dashboard__stat-label">{{ t('dashboard.pendingRequests') }}</span>
          <span class="dashboard__stat-value">{{ stats.pending }}</span>
        </div>
        <div class="dashboard__stat-card dashboard__stat-card--approved">
          <span class="dashboard__stat-label">{{ t('dashboard.approvedRequests') }}</span>
          <span class="dashboard__stat-value">{{ stats.approved }}</span>
        </div>
        <div class="dashboard__stat-card dashboard__stat-card--amount">
          <span class="dashboard__stat-label">{{ t('dashboard.totalAmount') }}</span>
          <span class="dashboard__stat-value">{{ formatCurrency(stats.totalAmount) }}</span>
        </div>
      </div>

      <!-- Manager / Approver Section -->
      <div v-if="canApprove()" class="dashboard__manager-section">
        <div class="dashboard__card">
          <h3 class="dashboard__card-title">{{ t('dashboard.pendingApprovals') }}</h3>
          <div class="dashboard__approval-count">
            <span class="dashboard__approval-number">{{ stats.pendingApprovals }}</span>
            <span class="dashboard__approval-text">{{ t('dashboard.awaitingYourReview') }}</span>
          </div>
          <router-link
            :to="{ name: 'approvals' }"
            class="dashboard__link-btn"
          >
            {{ t('dashboard.viewApprovals') }}
          </router-link>
        </div>
      </div>

      <!-- SLA Alerts -->
      <div v-if="overdueRequests.length" class="dashboard__alerts">
        <div class="dashboard__alert-card">
          <h3 class="dashboard__alert-title">{{ t('dashboard.slaAlerts') }}</h3>
          <div class="dashboard__alert-list">
            <div
              v-for="request in overdueRequests"
              :key="request.id"
              class="dashboard__alert-item"
              @click="goToDetail(request.id)"
            >
              <span class="dashboard__alert-name">{{ request.title }}</span>
              <span class="dashboard__alert-badge">{{ t('dashboard.overdue') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="dashboard__quick-actions">
        <h3 class="dashboard__section-title">{{ t('dashboard.quickActions') }}</h3>
        <div class="dashboard__actions-grid">
          <router-link
            :to="{ name: 'request-new' }"
            class="dashboard__action-card"
          >
            <span class="dashboard__action-icon">+</span>
            <span class="dashboard__action-label">{{ t('requests.new') }}</span>
          </router-link>
          <router-link
            :to="{ name: 'requests' }"
            class="dashboard__action-card"
          >
            <span class="dashboard__action-icon">=</span>
            <span class="dashboard__action-label">{{ t('dashboard.viewAllRequests') }}</span>
          </router-link>
          <router-link
            v-if="canApprove()"
            :to="{ name: 'approvals' }"
            class="dashboard__action-card"
          >
            <span class="dashboard__action-icon">&#10003;</span>
            <span class="dashboard__action-label">{{ t('dashboard.reviewApprovals') }}</span>
          </router-link>
          <router-link
            :to="{ name: 'settings' }"
            class="dashboard__action-card"
          >
            <span class="dashboard__action-icon">&#9881;</span>
            <span class="dashboard__action-label">{{ t('dashboard.settings') }}</span>
          </router-link>
        </div>
      </div>

      <!-- Charts -->
      <div class="dashboard__charts-section">
        <h3 class="dashboard__section-title">{{ t('dashboard.charts.title') }}</h3>
        <div class="dashboard__charts-grid">
          <div class="dashboard__chart-card">
            <h4 class="dashboard__chart-title">{{ t('dashboard.charts.spendingByCategory') }}</h4>
            <SpendingByCategoryChart :data="categoryData" :loading="chartsLoading" />
          </div>
          <div class="dashboard__chart-card">
            <h4 class="dashboard__chart-title">{{ t('dashboard.charts.monthlyTrend') }}</h4>
            <MonthlyTrendChart :data="monthlyData" :loading="chartsLoading" />
          </div>
          <div class="dashboard__chart-card">
            <h4 class="dashboard__chart-title">{{ t('dashboard.charts.statusBreakdown') }}</h4>
            <StatusBreakdownChart :data="statusBreakdown" :loading="chartsLoading" />
          </div>
          <div v-if="canApprove()" class="dashboard__chart-card">
            <h4 class="dashboard__chart-title">{{ t('dashboard.charts.departmentComparison') }}</h4>
            <DepartmentComparisonChart :data="departmentData" :loading="chartsLoading" />
          </div>
        </div>
      </div>

      <!-- Strategist Insights (MANAGER/FINANCE/ADMIN only) -->
      <div v-if="canApprove()" class="dashboard__strategist-section">
        <StrategistInsightsCard />
      </div>

      <!-- Recent Requests -->
      <div class="dashboard__recent">
        <div class="dashboard__recent-header">
          <h3 class="dashboard__section-title">{{ t('dashboard.recentRequests') }}</h3>
          <router-link
            :to="{ name: 'requests' }"
            class="dashboard__view-all"
          >
            {{ t('dashboard.viewAll') }}
          </router-link>
        </div>

        <div v-if="loading" class="dashboard__loading">
          {{ t('common.loading') }}
        </div>

        <div v-else-if="!recentRequests.length" class="dashboard__empty">
          <p class="dashboard__empty-title">{{ t('common.emptyState.title') }}</p>
          <p class="dashboard__empty-text">{{ t('common.emptyState.description') }}</p>
          <router-link
            :to="{ name: 'request-new' }"
            class="dashboard__empty-action"
          >
            {{ t('requests.new') }}
          </router-link>
        </div>

        <div v-else class="dashboard__table-wrapper">
          <table class="dashboard__table">
            <thead>
              <tr>
                <th>{{ t('requests.requestTitle') }}</th>
                <th>{{ t('common.amount') }}</th>
                <th>{{ t('common.status') }}</th>
                <th>{{ t('common.date') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="request in recentRequests"
                :key="request.id"
                class="dashboard__table-row"
                @click="goToDetail(request.id)"
              >
                <td class="dashboard__cell-title">{{ request.title }}</td>
                <td class="dashboard__cell-amount">{{ formatCurrency(request.total_amount) }}</td>
                <td>
                  <span
                    class="dashboard__status-badge"
                    :class="`dashboard__status-badge--${statusClass(request.status)}`"
                  >
                    {{ statusLabel(request.status) }}
                  </span>
                </td>
                <td class="dashboard__cell-date">{{ formatDate(request.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import SpendingByCategoryChart from '@/components/charts/SpendingByCategoryChart.vue'
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart.vue'
import StatusBreakdownChart from '@/components/charts/StatusBreakdownChart.vue'
import DepartmentComparisonChart from '@/components/charts/DepartmentComparisonChart.vue'
import StrategistInsightsCard from '@/components/dashboard/StrategistInsightsCard.vue'
import { useRequest } from '@/composables/useRequest'
import { useChartData } from '@/composables/useChartData'
import { usePermission } from '@/composables/usePermission'
import { useAuthStore } from '@/stores/auth.store'
import { REQUEST_STATUS } from '@/constants/status'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { loading, requests, fetchRequests } = useRequest()
const {
  loading: chartsLoading,
  categoryData,
  monthlyData,
  departmentData,
  statusBreakdown,
  fetchChartData,
} = useChartData()
const { canApprove, isManager, isFinance, isAdmin } = usePermission()

const userName = computed(() => authStore.user?.name || t('auth.welcomeBack'))

const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  totalAmount: 0,
  pendingApprovals: 0
})

const recentRequests = computed(() => {
  return (requests.value || []).slice(0, 5)
})

const overdueRequests = computed(() => {
  return (requests.value || []).filter(r => {
    if (!r.sla_deadline) return false
    return new Date() > new Date(r.sla_deadline)
  })
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

function formatCurrency(value) {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

function goToDetail(id) {
  router.push({ name: 'request-detail', params: { id } })
}

function computeStats(allRequests) {
  const pendingStatuses = [
    REQUEST_STATUS.PENDING_AI,
    REQUEST_STATUS.PENDING_MANAGER,
    REQUEST_STATUS.PENDING_FINANCE,
    REQUEST_STATUS.IN_CORRECTION
  ]
  const approvedStatuses = [
    REQUEST_STATUS.IN_PAYMENT,
    REQUEST_STATUS.PAID
  ]

  stats.value = {
    total: allRequests.length,
    pending: allRequests.filter(r => pendingStatuses.includes(r.status)).length,
    approved: allRequests.filter(r => approvedStatuses.includes(r.status)).length,
    totalAmount: allRequests.reduce((sum, r) => sum + (r.total_amount || 0), 0),
    pendingApprovals: allRequests.filter(r => r.status === REQUEST_STATUS.PENDING_MANAGER).length
  }
}

onMounted(async () => {
  try {
    const [data] = await Promise.all([
      fetchRequests({ perPage: 50 }),
      fetchChartData(),
    ])
    computeStats(data?.items || requests.value || [])
  } catch {
    // Dashboard should still render even if fetch fails
  }
})
</script>

<style lang="scss" scoped>
.dashboard {
  &__welcome-section {
    margin-bottom: $spacing-xl;
  }

  &__greeting {
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $gray-900;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $gray-500;
    margin-top: $spacing-xs;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__stat-card {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    padding: $spacing-lg;
    box-shadow: $shadow-sm;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    border-top: 3px solid $gray-300;

    &--pending {
      border-top-color: $warning;
    }

    &--approved {
      border-top-color: $success;
    }

    &--amount {
      border-top-color: $primary;
    }
  }

  &__stat-label {
    font-size: $font-size-xs;
    font-weight: 500;
    color: $gray-500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__stat-value {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $gray-900;
    font-variant-numeric: tabular-nums;
  }

  &__manager-section {
    margin-bottom: $spacing-xl;
  }

  &__card {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    padding: $spacing-xl;
    box-shadow: $shadow-sm;
  }

  &__card-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-md;
  }

  &__approval-count {
    display: flex;
    align-items: baseline;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
  }

  &__approval-number {
    font-size: $font-size-3xl;
    font-weight: 700;
    color: $warning;
  }

  &__approval-text {
    font-size: $font-size-sm;
    color: $gray-500;
  }

  &__link-btn {
    display: inline-block;
    padding: $spacing-sm $spacing-lg;
    background: $primary;
    color: $white;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s;

    &:hover {
      background: $primary-dark;
    }
  }

  &__alerts {
    margin-bottom: $spacing-xl;
  }

  &__alert-card {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: $radius-lg;
    padding: $spacing-xl;
  }

  &__alert-title {
    font-size: $font-size-base;
    font-weight: 600;
    color: #991b1b;
    margin-bottom: $spacing-md;
  }

  &__alert-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__alert-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-sm $spacing-md;
    background: $white;
    border-radius: $radius-md;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: $gray-50;
    }
  }

  &__alert-name {
    font-size: $font-size-sm;
    color: $gray-800;
    font-weight: 500;
  }

  &__alert-badge {
    font-size: $font-size-xs;
    font-weight: 600;
    color: #991b1b;
    background: #fee2e2;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
  }

  &__quick-actions {
    margin-bottom: $spacing-xl;
  }

  &__section-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-lg;
  }

  &__actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-lg;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      border-color: $primary;
      box-shadow: $shadow-md;
      transform: translateY(-2px);
    }
  }

  &__action-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: $primary-light;
    color: $primary;
    border-radius: $radius-full;
    font-size: $font-size-lg;
    font-weight: 600;
  }

  &__action-label {
    font-size: $font-size-sm;
    color: $gray-700;
    font-weight: 500;
    text-align: center;
  }

  &__strategist-section {
    margin-bottom: $spacing-xl;
  }

  &__charts-section {
    margin-bottom: $spacing-xl;
  }

  &__charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }

  &__chart-card {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    padding: $spacing-lg;
    box-shadow: $shadow-sm;
  }

  &__chart-title {
    font-size: $font-size-base;
    font-weight: 600;
    color: $gray-700;
    margin-bottom: $spacing-md;
  }

  &__recent {
    margin-bottom: $spacing-xl;
  }

  &__recent-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-lg;
  }

  &__view-all {
    font-size: $font-size-sm;
    color: $primary;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }

  &__loading {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-base;
  }

  &__empty {
    text-align: center;
    padding: $spacing-2xl;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
  }

  &__empty-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-700;
    margin-bottom: $spacing-sm;
  }

  &__empty-text {
    font-size: $font-size-sm;
    color: $gray-500;
    margin-bottom: $spacing-lg;
  }

  &__empty-action {
    display: inline-block;
    padding: $spacing-sm $spacing-lg;
    background: $primary;
    color: $white;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s;

    &:hover {
      background: $primary-dark;
    }
  }

  &__table-wrapper {
    overflow-x: auto;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th {
      text-align: left;
      padding: $spacing-md $spacing-lg;
      font-size: $font-size-xs;
      font-weight: 600;
      color: $gray-600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: $gray-50;
      border-bottom: 1px solid $gray-200;
    }

    td {
      padding: $spacing-md $spacing-lg;
      font-size: $font-size-sm;
      color: $gray-700;
      border-bottom: 1px solid $gray-100;
    }
  }

  &__table-row {
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: $gray-50;
    }

    &:last-child td {
      border-bottom: none;
    }
  }

  &__cell-title {
    font-weight: 500;
    color: $gray-900;
  }

  &__cell-amount {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &__cell-date {
    color: $gray-500;
  }

  &__status-badge {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;
    line-height: 1;

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
}
</style>
