<template>
  <DefaultLayout>
    <div class="hierarchy">
      <div class="hierarchy__header">
        <div class="hierarchy__header-left">
          <h2 class="hierarchy__title">{{ t('admin.hierarchy.title') }}</h2>
          <p class="hierarchy__subtitle">{{ t('admin.hierarchy.subtitle') }}</p>
        </div>
      </div>

      <div
        v-if="loading"
        class="hierarchy__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!tree.length"
        class="hierarchy__empty"
      >
        {{ t('admin.hierarchy.empty') }}
      </div>

      <div
        v-else
        class="hierarchy__tree"
      >
        <DepartmentNode
          v-for="dept in tree"
          :key="dept.id"
          :department="dept"
          :depth="0"
          @edit-parent="openEditParentModal"
        />
      </div>

      <!-- Edit Parent Modal -->
      <div
        v-if="showEditModal"
        class="hierarchy__modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="hierarchy__modal">
          <div class="hierarchy__modal-header">
            <h3 class="hierarchy__modal-title">{{ t('admin.hierarchy.editParent') }}</h3>
            <button
              class="hierarchy__modal-close"
              @click="closeEditModal"
            >
              &times;
            </button>
          </div>
          <form
            class="hierarchy__modal-form"
            @submit.prevent="handleEditParent"
          >
            <div class="hierarchy__form-group">
              <label class="hierarchy__form-label">{{ t('admin.hierarchy.form.department') }}</label>
              <input
                :value="editingDept?.name"
                type="text"
                class="hierarchy__form-input"
                disabled
              />
            </div>
            <div class="hierarchy__form-group">
              <label class="hierarchy__form-label">{{ t('admin.hierarchy.form.parentDepartment') }}</label>
              <select
                v-model="editParentId"
                class="hierarchy__form-select"
              >
                <option value="">{{ t('admin.hierarchy.form.noParent') }}</option>
                <option
                  v-for="dept in allDepartments"
                  :key="dept.id"
                  :value="dept.id"
                  :disabled="dept.id === editingDept?.id"
                >
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div class="hierarchy__modal-actions">
              <button
                type="button"
                class="hierarchy__modal-btn hierarchy__modal-btn--cancel"
                @click="closeEditModal"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="hierarchy__modal-btn hierarchy__modal-btn--submit"
                :disabled="submitting"
              >
                {{ t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { adminHierarchyService } from '@/services/admin/hierarchy'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const tree = ref([])
const showEditModal = ref(false)
const editingDept = ref(null)
const editParentId = ref('')

const allDepartments = computed(() => {
  const flat = []
  function flatten(nodes) {
    for (const node of nodes) {
      flat.push({ id: node.id, name: node.name })
      if (node.children?.length) {
        flatten(node.children)
      }
    }
  }
  flatten(tree.value)
  return flat
})

async function fetchHierarchy() {
  loading.value = true
  try {
    const data = await adminHierarchyService.getTree()
    tree.value = Array.isArray(data) ? data : data.departments || data.tree || []
  } catch {
    toast.error(t('admin.hierarchy.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

function openEditParentModal(dept) {
  editingDept.value = dept
  editParentId.value = dept.parent_id || ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingDept.value = null
}

async function handleEditParent() {
  if (!editingDept.value) return
  submitting.value = true
  try {
    await adminHierarchyService.updateDepartmentParent(
      editingDept.value.id,
      editParentId.value || null
    )
    toast.success(t('admin.hierarchy.messages.updated'))
    closeEditModal()
    await fetchHierarchy()
  } catch {
    toast.error(t('admin.hierarchy.messages.saveError'))
  } finally {
    submitting.value = false
  }
}

// Recursive DepartmentNode component
const DepartmentNode = defineComponent({
  name: 'DepartmentNode',
  props: {
    department: { type: Object, required: true },
    depth: { type: Number, default: 0 }
  },
  emits: ['edit-parent'],
  setup(props, { emit }) {
    const expanded = ref(true)

    function toggle() {
      expanded.value = !expanded.value
    }

    function getRoleBadgeClass(role) {
      const map = {
        ADMIN: 'hierarchy__role-badge--admin',
        FINANCE: 'hierarchy__role-badge--finance',
        MANAGER: 'hierarchy__role-badge--manager',
        EMPLOYEE: 'hierarchy__role-badge--employee'
      }
      return map[role] || 'hierarchy__role-badge--employee'
    }

    return () => {
      const dept = props.department
      const hasChildren = dept.children?.length > 0
      const hasUsers = dept.users?.length > 0
      const userCount = dept.users?.length || 0

      const headerChildren = [
        h('div', { class: 'hierarchy__node-info' }, [
          h('button', {
            class: 'hierarchy__expand-btn',
            onClick: toggle,
            disabled: !hasChildren && !hasUsers
          }, expanded.value ? '\u25BC' : '\u25B6'),
          h('h4', { class: 'hierarchy__dept-name' }, dept.name),
          h('span', { class: 'hierarchy__user-count' },
            `${userCount} ${t(userCount === 1 ? 'admin.hierarchy.user' : 'admin.hierarchy.users')}`
          )
        ]),
        h('button', {
          class: 'hierarchy__edit-btn',
          onClick: () => emit('edit-parent', dept)
        }, t('admin.hierarchy.editParent'))
      ]

      const nodeChildren = [
        h('div', { class: 'hierarchy__node-header' }, headerChildren)
      ]

      if (expanded.value && hasUsers) {
        const userEls = dept.users.map(user =>
          h('div', { class: 'hierarchy__user', key: user.id }, [
            h('div', { class: 'hierarchy__user-avatar' },
              user.name ? user.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : '?'
            ),
            h('span', { class: 'hierarchy__user-name' }, user.name || user.email),
            h('span', { class: ['hierarchy__role-badge', getRoleBadgeClass(user.role)] },
              t(`admin.hierarchy.roles.${user.role}`)
            )
          ])
        )
        nodeChildren.push(h('div', { class: 'hierarchy__user-list' }, userEls))
      }

      if (expanded.value && hasChildren) {
        const childEls = dept.children.map(child =>
          h(DepartmentNode, {
            key: child.id,
            department: child,
            depth: props.depth + 1,
            'onEdit-parent': (d) => emit('edit-parent', d)
          })
        )
        nodeChildren.push(h('div', { class: 'hierarchy__children' }, childEls))
      }

      return h('div', {
        class: 'hierarchy__node',
        style: { marginLeft: props.depth > 0 ? '1.5rem' : '0' }
      }, nodeChildren)
    }
  }
})

onMounted(() => {
  fetchHierarchy()
})
</script>

<style lang="scss" scoped>
.hierarchy {
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

  &__loading,
  &__empty {
    text-align: center;
    padding: $spacing-2xl;
    color: $gray-500;
    font-size: $font-size-lg;
  }

  &__tree {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__node {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    overflow: hidden;
  }

  &__node-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md $spacing-lg;
    background: $gray-50;
  }

  &__node-info {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__expand-btn {
    background: none;
    border: none;
    color: $gray-400;
    font-size: $font-size-xs;
    cursor: pointer;
    padding: $spacing-xs;
    line-height: 1;

    &:hover:not(:disabled) {
      color: $primary;
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  }

  &__dept-name {
    font-size: $font-size-base;
    font-weight: 600;
    color: $gray-800;
    margin: 0;
  }

  &__user-count {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;
    background: rgba($primary, 0.1);
    color: $primary;
  }

  &__edit-btn {
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
  }

  &__user-list {
    padding: $spacing-sm $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-sm;

    &:hover {
      background: $gray-50;
    }
  }

  &__user-avatar {
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
    flex-shrink: 0;
  }

  &__user-name {
    font-size: $font-size-sm;
    color: $gray-700;
    flex: 1;
  }

  &__role-badge {
    display: inline-block;
    padding: 2px $spacing-xs;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: 500;

    &--admin {
      background: rgba($danger, 0.1);
      color: $danger;
    }

    &--finance {
      background: rgba($primary, 0.1);
      color: $primary;
    }

    &--manager {
      background: rgba($warning, 0.1);
      color: $warning;
    }

    &--employee {
      background: rgba($success, 0.1);
      color: $success;
    }
  }

  &__children {
    padding: $spacing-xs $spacing-sm $spacing-sm;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
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
    max-width: 28rem;
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
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }

    &:disabled {
      background: $gray-100;
      color: $gray-500;
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
