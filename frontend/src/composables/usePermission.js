import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { ROLES, ROLE_HIERARCHY } from '@/constants/roles'

export function usePermission() {
  const authStore = useAuthStore()

  const role = computed(() => authStore.userRole)

  function hasRole(requiredRole) {
    return role.value === requiredRole
  }

  function hasMinRole(minRole) {
    const userLevel = ROLE_HIERARCHY[role.value] || 0
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0
    return userLevel >= requiredLevel
  }

  function canApprove() {
    return hasMinRole(ROLES.MANAGER)
  }

  function canProcessPayments() {
    return hasMinRole(ROLES.FINANCE)
  }

  function canManageAdmin() {
    return hasRole(ROLES.ADMIN)
  }

  const isEmployee = computed(() => role.value === ROLES.EMPLOYEE)
  const isManager = computed(() => role.value === ROLES.MANAGER)
  const isFinance = computed(() => role.value === ROLES.FINANCE)
  const isAdmin = computed(() => role.value === ROLES.ADMIN)

  return {
    role,
    hasRole,
    hasMinRole,
    canApprove,
    canProcessPayments,
    canManageAdmin,
    isEmployee,
    isManager,
    isFinance,
    isAdmin
  }
}
