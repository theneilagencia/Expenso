<template>
  <DefaultLayout>
    <div class="users">
      <div class="users__header">
        <div class="users__header-left">
          <h2 class="users__title">{{ t('admin.users.title') }}</h2>
          <p class="users__subtitle">{{ t('admin.users.subtitle') }}</p>
        </div>
        <button
          class="users__create-btn"
          @click="openCreateModal"
        >
          {{ t('admin.users.create') }}
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="users__filters">
        <div class="users__search">
          <input
            v-model="searchQuery"
            type="text"
            class="users__search-input"
            :placeholder="t('admin.users.searchPlaceholder')"
            @input="handleSearch"
          />
        </div>
        <div class="users__filter-group">
          <select
            v-model="filterRole"
            class="users__filter-select"
            @change="handleFilter"
          >
            <option value="">{{ t('admin.users.allRoles') }}</option>
            <option
              v-for="role in roleOptions"
              :key="role"
              :value="role"
            >
              {{ t(`roles.${role}`) }}
            </option>
          </select>
        </div>
        <div class="users__filter-group">
          <select
            v-model="filterDepartment"
            class="users__filter-select"
            @change="handleFilter"
          >
            <option value="">{{ t('admin.users.allDepartments') }}</option>
          </select>
        </div>
      </div>

      <div
        v-if="loading"
        class="users__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!users.length"
        class="users__empty"
      >
        {{ t('admin.users.empty') }}
      </div>

      <table
        v-else
        class="users__table"
      >
        <thead class="users__table-head">
          <tr>
            <th class="users__th">{{ t('admin.users.table.name') }}</th>
            <th class="users__th">{{ t('admin.users.table.email') }}</th>
            <th class="users__th">{{ t('admin.users.table.role') }}</th>
            <th class="users__th">{{ t('admin.users.table.department') }}</th>
            <th class="users__th">{{ t('admin.users.table.status') }}</th>
            <th class="users__th">{{ t('admin.users.table.lastLogin') }}</th>
            <th class="users__th">{{ t('admin.users.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="users__table-body">
          <tr
            v-for="user in users"
            :key="user.id"
            class="users__row"
          >
            <td class="users__td">
              <div class="users__name-cell">
                <div class="users__avatar">{{ getInitials(user.name) }}</div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td class="users__td">{{ user.email }}</td>
            <td class="users__td">
              <select
                class="users__role-select"
                :value="user.role"
                @change="handleRoleChange(user, ($event.target).value)"
              >
                <option
                  v-for="role in roleOptions"
                  :key="role"
                  :value="role"
                >
                  {{ t(`roles.${role}`) }}
                </option>
              </select>
            </td>
            <td class="users__td">{{ user.department || '-' }}</td>
            <td class="users__td">
              <span :class="['users__status', user.active ? 'users__status--active' : 'users__status--inactive']">
                {{ user.active ? t('admin.users.active') : t('admin.users.inactive') }}
              </span>
            </td>
            <td class="users__td">{{ formatDate(user.last_login_at) }}</td>
            <td class="users__td">
              <div class="users__actions-cell">
                <button
                  class="users__action-btn"
                  @click="openEditModal(user)"
                >
                  {{ t('common.edit') }}
                </button>
                <button
                  :class="['users__action-btn', user.active ? 'users__action-btn--danger' : 'users__action-btn--success']"
                  @click="toggleUserStatus(user)"
                >
                  {{ user.active ? t('admin.users.deactivate') : t('admin.users.activate') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="totalPages > 1"
        class="users__pagination"
      >
        <button
          class="users__page-btn"
          :disabled="!hasPrev"
          @click="prevPage"
        >
          {{ t('common.previous') }}
        </button>
        <span class="users__page-info">
          {{ t('common.pageOf', { current: page, total: totalPages }) }}
        </span>
        <button
          class="users__page-btn"
          :disabled="!hasNext"
          @click="nextPage"
        >
          {{ t('common.next') }}
        </button>
      </div>

      <!-- User Modal -->
      <div
        v-if="showModal"
        class="users__modal-overlay"
        @click.self="closeModal"
      >
        <div class="users__modal">
          <div class="users__modal-header">
            <h3 class="users__modal-title">
              {{ editingUser ? t('admin.users.editUser') : t('admin.users.createUser') }}
            </h3>
            <button
              class="users__modal-close"
              @click="closeModal"
            >
              &times;
            </button>
          </div>
          <form
            class="users__modal-form"
            @submit.prevent="handleSubmit"
          >
            <div class="users__form-group">
              <label class="users__form-label">{{ t('admin.users.form.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="users__form-input"
                required
              />
            </div>
            <div class="users__form-group">
              <label class="users__form-label">{{ t('admin.users.form.email') }}</label>
              <input
                v-model="form.email"
                type="email"
                class="users__form-input"
                required
              />
            </div>
            <div class="users__form-group">
              <label class="users__form-label">{{ t('admin.users.form.role') }}</label>
              <select
                v-model="form.role"
                class="users__form-select"
                required
              >
                <option
                  v-for="role in roleOptions"
                  :key="role"
                  :value="role"
                >
                  {{ t(`roles.${role}`) }}
                </option>
              </select>
            </div>
            <div class="users__form-group">
              <label class="users__form-label">{{ t('admin.users.form.department') }}</label>
              <input
                v-model="form.department"
                type="text"
                class="users__form-input"
              />
            </div>
            <div class="users__modal-actions">
              <button
                type="button"
                class="users__modal-btn users__modal-btn--cancel"
                @click="closeModal"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="users__modal-btn users__modal-btn--submit"
                :disabled="submitting"
              >
                {{ editingUser ? t('common.save') : t('common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { adminUsersService } from '@/services/admin/users'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import { ROLES } from '@/constants/roles'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const users = ref([])
const showModal = ref(false)
const editingUser = ref(null)
const searchQuery = ref('')
const filterRole = ref('')
const filterDepartment = ref('')

const roleOptions = [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.FINANCE, ROLES.ADMIN]

const form = reactive({
  name: '',
  email: '',
  role: ROLES.EMPLOYEE,
  department: ''
})

async function fetchUsers(params = {}) {
  loading.value = true
  try {
    const data = await adminUsersService.list({
      ...params,
      search: searchQuery.value || undefined,
      role: filterRole.value || undefined,
      department: filterDepartment.value || undefined
    })
    users.value = data.items || data
    if (data.meta?.total) {
      setTotal(data.meta.total)
    }
  } catch {
    toast.error(t('admin.users.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

const {
  page,
  totalPages,
  hasNext,
  hasPrev,
  nextPage,
  prevPage,
  setTotal
} = usePagination(fetchUsers)

let searchTimeout = null
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchUsers(), 300)
}

function handleFilter() {
  fetchUsers()
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}

function openCreateModal() {
  editingUser.value = null
  form.name = ''
  form.email = ''
  form.role = ROLES.EMPLOYEE
  form.department = ''
  showModal.value = true
}

function openEditModal(user) {
  editingUser.value = user
  form.name = user.name
  form.email = user.email
  form.role = user.role
  form.department = user.department || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (editingUser.value) {
      await adminUsersService.update(editingUser.value.id, { ...form })
      toast.success(t('admin.users.messages.updated'))
    } else {
      await adminUsersService.create({ ...form })
      toast.success(t('admin.users.messages.created'))
    }
    closeModal()
    await fetchUsers()
  } catch {
    toast.error(t('admin.users.messages.saveError'))
  } finally {
    submitting.value = false
  }
}

async function handleRoleChange(user, newRole) {
  try {
    await adminUsersService.update(user.id, { role: newRole })
    user.role = newRole
    toast.success(t('admin.users.messages.roleUpdated'))
  } catch {
    toast.error(t('admin.users.messages.roleError'))
  }
}

async function toggleUserStatus(user) {
  try {
    await adminUsersService.update(user.id, { active: !user.active })
    user.active = !user.active
    toast.success(
      user.active
        ? t('admin.users.messages.activated')
        : t('admin.users.messages.deactivated')
    )
  } catch {
    toast.error(t('admin.users.messages.statusError'))
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style lang="scss" scoped>
.users {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $gray-900;
  }

  &__subtitle {
    color: $gray-500;
    margin-top: $spacing-xs;
  }

  &__create-btn {
    padding: $spacing-sm $spacing-lg;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: $primary-dark;
    }
  }

  &__filters {
    display: flex;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  &__search {
    flex: 1;
  }

  &__search-input {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }
  }

  &__filter-select {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;
    background: $white;
    min-width: 10rem;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-lg;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  &__table-head {
    background: $gray-50;
  }

  &__th {
    padding: $spacing-md $spacing-lg;
    text-align: left;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $gray-600;
    border-bottom: 1px solid $gray-200;
  }

  &__row {
    &:not(:last-child) {
      border-bottom: 1px solid $gray-100;
    }

    &:hover {
      background: $gray-50;
    }
  }

  &__td {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-sm;
    color: $gray-700;
  }

  &__name-cell {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: $radius-full;
    background: $primary-light;
    color: $primary;
    font-size: $font-size-xs;
    font-weight: 600;
  }

  &__role-select {
    padding: $spacing-xs $spacing-sm;
    border: 1px solid $gray-200;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    color: $gray-700;
    background: $white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: $primary;
    }
  }

  &__status {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;

    &--active {
      background: rgba($success, 0.1);
      color: $success;
    }

    &--inactive {
      background: rgba($gray-500, 0.1);
      color: $gray-500;
    }
  }

  &__actions-cell {
    display: flex;
    gap: $spacing-xs;
  }

  &__action-btn {
    padding: $spacing-xs $spacing-sm;
    border: 1px solid $gray-300;
    border-radius: $radius-sm;
    background: $white;
    color: $gray-600;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: $primary;
      color: $primary;
    }

    &--danger {
      &:hover {
        border-color: $danger;
        color: $danger;
      }
    }

    &--success {
      &:hover {
        border-color: $success;
        color: $success;
      }
    }
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    margin-top: $spacing-lg;
  }

  &__page-btn {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    background: $white;
    color: $gray-700;
    font-size: $font-size-sm;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: $gray-50;
      border-color: $primary;
      color: $primary;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__page-info {
    font-size: $font-size-sm;
    color: $gray-600;
  }

  // Modal
  &__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba($gray-900, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: $z-modal;
  }

  &__modal {
    width: 100%;
    max-width: 32rem;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    overflow: hidden;
  }

  &__modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg;
    border-bottom: 1px solid $gray-200;
  }

  &__modal-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
  }

  &__modal-close {
    background: none;
    border: none;
    font-size: $font-size-2xl;
    color: $gray-400;
    cursor: pointer;
    line-height: 1;

    &:hover {
      color: $gray-600;
    }
  }

  &__modal-form {
    padding: $spacing-lg;
  }

  &__form-group {
    margin-bottom: $spacing-md;
  }

  &__form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-700;
    margin-bottom: $spacing-xs;
  }

  &__form-input,
  &__form-select {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }
  }

  &__modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
    padding-top: $spacing-md;
    border-top: 1px solid $gray-100;
    margin-top: $spacing-lg;
  }

  &__modal-btn {
    padding: $spacing-sm $spacing-lg;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &--cancel {
      background: $white;
      color: $gray-600;
      border: 1px solid $gray-300;

      &:hover {
        background: $gray-50;
      }
    }

    &--submit {
      background: $primary;
      color: $white;

      &:hover:not(:disabled) {
        background: $primary-dark;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
