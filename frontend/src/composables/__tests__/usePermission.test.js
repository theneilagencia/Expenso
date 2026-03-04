import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'

// Mock the auth store before importing the composable
const mockUserRole = ref(null)

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => {
    const store = {}
    Object.defineProperty(store, 'userRole', {
      get: () => mockUserRole.value,
      enumerable: true
    })
    return store
  }
}))

import { usePermission } from '../usePermission'
import { ROLES, ROLE_HIERARCHY } from '@/constants/roles'

describe('usePermission', () => {
  beforeEach(() => {
    mockUserRole.value = null
  })

  describe('role hierarchy constants', () => {
    it('should define ADMIN as highest level (4)', () => {
      expect(ROLE_HIERARCHY.ADMIN).toBe(4)
    })

    it('should define FINANCE as level 3', () => {
      expect(ROLE_HIERARCHY.FINANCE).toBe(3)
    })

    it('should define MANAGER as level 2', () => {
      expect(ROLE_HIERARCHY.MANAGER).toBe(2)
    })

    it('should define EMPLOYEE as lowest level (1)', () => {
      expect(ROLE_HIERARCHY.EMPLOYEE).toBe(1)
    })

    it('should enforce ADMIN > FINANCE > MANAGER > EMPLOYEE', () => {
      expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.FINANCE)
      expect(ROLE_HIERARCHY.FINANCE).toBeGreaterThan(ROLE_HIERARCHY.MANAGER)
      expect(ROLE_HIERARCHY.MANAGER).toBeGreaterThan(ROLE_HIERARCHY.EMPLOYEE)
    })
  })

  describe('hasRole', () => {
    it('should return true when user has the exact matching role', () => {
      mockUserRole.value = ROLES.ADMIN
      const { hasRole } = usePermission()
      expect(hasRole(ROLES.ADMIN)).toBe(true)
    })

    it('should return false when user has a different role', () => {
      mockUserRole.value = ROLES.EMPLOYEE
      const { hasRole } = usePermission()
      expect(hasRole(ROLES.ADMIN)).toBe(false)
    })

    it('should return false when user has no role', () => {
      mockUserRole.value = null
      const { hasRole } = usePermission()
      expect(hasRole(ROLES.EMPLOYEE)).toBe(false)
    })
  })

  describe('hasMinRole', () => {
    it('should return true when user role meets minimum', () => {
      mockUserRole.value = ROLES.ADMIN
      const { hasMinRole } = usePermission()
      expect(hasMinRole(ROLES.MANAGER)).toBe(true)
    })

    it('should return true when user role equals minimum', () => {
      mockUserRole.value = ROLES.MANAGER
      const { hasMinRole } = usePermission()
      expect(hasMinRole(ROLES.MANAGER)).toBe(true)
    })

    it('should return false when user role is below minimum', () => {
      mockUserRole.value = ROLES.EMPLOYEE
      const { hasMinRole } = usePermission()
      expect(hasMinRole(ROLES.MANAGER)).toBe(false)
    })

    it('should return false when user has no role (null)', () => {
      mockUserRole.value = null
      const { hasMinRole } = usePermission()
      expect(hasMinRole(ROLES.EMPLOYEE)).toBe(false)
    })

    it('should allow ADMIN to meet any minimum role', () => {
      mockUserRole.value = ROLES.ADMIN
      const { hasMinRole } = usePermission()
      expect(hasMinRole(ROLES.EMPLOYEE)).toBe(true)
      expect(hasMinRole(ROLES.MANAGER)).toBe(true)
      expect(hasMinRole(ROLES.FINANCE)).toBe(true)
      expect(hasMinRole(ROLES.ADMIN)).toBe(true)
    })

    it('should not allow EMPLOYEE to meet higher minimum roles', () => {
      mockUserRole.value = ROLES.EMPLOYEE
      const { hasMinRole } = usePermission()
      expect(hasMinRole(ROLES.EMPLOYEE)).toBe(true)
      expect(hasMinRole(ROLES.MANAGER)).toBe(false)
      expect(hasMinRole(ROLES.FINANCE)).toBe(false)
      expect(hasMinRole(ROLES.ADMIN)).toBe(false)
    })
  })

  describe('computed role booleans', () => {
    it('isAdmin should be true only for ADMIN role', () => {
      mockUserRole.value = ROLES.ADMIN
      const { isAdmin, isManager, isFinance, isEmployee } = usePermission()
      expect(isAdmin.value).toBe(true)
      expect(isManager.value).toBe(false)
      expect(isFinance.value).toBe(false)
      expect(isEmployee.value).toBe(false)
    })

    it('isManager should be true only for MANAGER role', () => {
      mockUserRole.value = ROLES.MANAGER
      const { isAdmin, isManager, isFinance, isEmployee } = usePermission()
      expect(isAdmin.value).toBe(false)
      expect(isManager.value).toBe(true)
      expect(isFinance.value).toBe(false)
      expect(isEmployee.value).toBe(false)
    })

    it('isFinance should be true only for FINANCE role', () => {
      mockUserRole.value = ROLES.FINANCE
      const { isAdmin, isManager, isFinance, isEmployee } = usePermission()
      expect(isAdmin.value).toBe(false)
      expect(isManager.value).toBe(false)
      expect(isFinance.value).toBe(true)
      expect(isEmployee.value).toBe(false)
    })

    it('isEmployee should be true only for EMPLOYEE role', () => {
      mockUserRole.value = ROLES.EMPLOYEE
      const { isAdmin, isManager, isFinance, isEmployee } = usePermission()
      expect(isAdmin.value).toBe(false)
      expect(isManager.value).toBe(false)
      expect(isFinance.value).toBe(false)
      expect(isEmployee.value).toBe(true)
    })
  })

  describe('canApprove', () => {
    it('should return true for MANAGER and above', () => {
      mockUserRole.value = ROLES.MANAGER
      const { canApprove } = usePermission()
      expect(canApprove()).toBe(true)
    })

    it('should return true for ADMIN', () => {
      mockUserRole.value = ROLES.ADMIN
      const { canApprove } = usePermission()
      expect(canApprove()).toBe(true)
    })

    it('should return false for EMPLOYEE', () => {
      mockUserRole.value = ROLES.EMPLOYEE
      const { canApprove } = usePermission()
      expect(canApprove()).toBe(false)
    })
  })

  describe('canProcessPayments', () => {
    it('should return true for FINANCE', () => {
      mockUserRole.value = ROLES.FINANCE
      const { canProcessPayments } = usePermission()
      expect(canProcessPayments()).toBe(true)
    })

    it('should return true for ADMIN', () => {
      mockUserRole.value = ROLES.ADMIN
      const { canProcessPayments } = usePermission()
      expect(canProcessPayments()).toBe(true)
    })

    it('should return false for MANAGER', () => {
      mockUserRole.value = ROLES.MANAGER
      const { canProcessPayments } = usePermission()
      expect(canProcessPayments()).toBe(false)
    })

    it('should return false for EMPLOYEE', () => {
      mockUserRole.value = ROLES.EMPLOYEE
      const { canProcessPayments } = usePermission()
      expect(canProcessPayments()).toBe(false)
    })
  })

  describe('canManageAdmin', () => {
    it('should return true only for ADMIN', () => {
      mockUserRole.value = ROLES.ADMIN
      const { canManageAdmin } = usePermission()
      expect(canManageAdmin()).toBe(true)
    })

    it('should return false for FINANCE', () => {
      mockUserRole.value = ROLES.FINANCE
      const { canManageAdmin } = usePermission()
      expect(canManageAdmin()).toBe(false)
    })
  })
})
