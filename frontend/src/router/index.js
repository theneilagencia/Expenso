import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { ROLES } from '@/constants/roles'

const routes = [
  // Auth
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },
  {
    path: '/auth/callback',
    name: 'sso-callback',
    component: () => import('@/views/auth/SSOCallbackView.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },

  // Employee
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/employee/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/requests',
    name: 'requests',
    component: () => import('@/views/employee/RequestsListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/requests/new',
    name: 'request-new',
    component: () => import('@/views/employee/RequestNewView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/requests/:id',
    name: 'request-detail',
    component: () => import('@/views/employee/RequestDetailView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/requests/:id/edit',
    name: 'request-edit',
    component: () => import('@/views/employee/RequestEditView.vue'),
    meta: { requiresAuth: true },
    props: true
  },

  // Manager
  {
    path: '/approvals',
    name: 'approvals',
    component: () => import('@/views/manager/ApprovalsView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.MANAGER, ROLES.FINANCE, ROLES.ADMIN] }
  },
  {
    path: '/approvals/:id',
    name: 'approval-detail',
    component: () => import('@/views/manager/ApprovalDetailView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.MANAGER, ROLES.FINANCE, ROLES.ADMIN] },
    props: true
  },

  // Finance
  {
    path: '/payments',
    name: 'payments',
    component: () => import('@/views/finance/PaymentsView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.FINANCE, ROLES.ADMIN] }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/finance/ReportsView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.FINANCE, ROLES.ADMIN] }
  },

  // Admin
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/UsersView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] }
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: () => import('@/views/admin/CategoriesView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] }
  },
  {
    path: '/admin/sla',
    name: 'admin-sla',
    component: () => import('@/views/admin/SLAView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] }
  },
  {
    path: '/admin/integrations',
    name: 'admin-integrations',
    component: () => import('@/views/admin/IntegrationsView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] }
  },
  {
    path: '/admin/audit',
    name: 'admin-audit',
    component: () => import('@/views/admin/AuditView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] }
  },
  {
    path: '/admin/ai-usage',
    name: 'admin-ai-usage',
    component: () => import('@/views/admin/AIUsageView.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] }
  },

  // Settings
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings/ProfileView.vue'),
    meta: { requiresAuth: true }
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Redirect unauthenticated users to login (except public pages)
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Redirect authenticated users away from auth pages
  if (to.meta.layout === 'auth' && authStore.isAuthenticated && to.name !== 'sso-callback') {
    return { name: 'dashboard' }
  }

  // Role-based access control
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    return { name: 'dashboard' }
  }
})
