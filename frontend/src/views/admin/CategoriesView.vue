<template>
  <DefaultLayout>
    <div class="categories">
      <div class="categories__header">
        <div class="categories__header-left">
          <h2 class="categories__title">{{ t('admin.categories.title') }}</h2>
          <p class="categories__subtitle">{{ t('admin.categories.subtitle') }}</p>
        </div>
        <button
          class="categories__create-btn"
          @click="openCreateModal"
        >
          {{ t('admin.categories.create') }}
        </button>
      </div>

      <div
        v-if="loading"
        class="categories__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!categories.length"
        class="categories__empty"
      >
        {{ t('admin.categories.empty') }}
      </div>

      <table
        v-else
        class="categories__table"
      >
        <thead class="categories__table-head">
          <tr>
            <th class="categories__th categories__th--order">{{ t('admin.categories.table.order') }}</th>
            <th class="categories__th">{{ t('admin.categories.table.name') }}</th>
            <th class="categories__th">{{ t('admin.categories.table.description') }}</th>
            <th class="categories__th">{{ t('admin.categories.table.status') }}</th>
            <th class="categories__th categories__th--right">
              {{ t('admin.categories.table.expenseCount') }}
            </th>
            <th class="categories__th">{{ t('admin.categories.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="categories__table-body">
          <tr
            v-for="(category, index) in categories"
            :key="category.id"
            class="categories__row"
          >
            <td class="categories__td categories__td--order">
              <div class="categories__reorder">
                <button
                  class="categories__reorder-btn"
                  :disabled="index === 0"
                  @click="moveUp(index)"
                >
                  &#9650;
                </button>
                <button
                  class="categories__reorder-btn"
                  :disabled="index === categories.length - 1"
                  @click="moveDown(index)"
                >
                  &#9660;
                </button>
              </div>
            </td>
            <td class="categories__td">
              <span class="categories__name">{{ category.name }}</span>
            </td>
            <td class="categories__td">
              <span class="categories__description">{{ category.description || '-' }}</span>
            </td>
            <td class="categories__td">
              <span :class="['categories__status', category.active ? 'categories__status--active' : 'categories__status--inactive']">
                {{ category.active ? t('admin.categories.active') : t('admin.categories.inactive') }}
              </span>
            </td>
            <td class="categories__td categories__td--right">
              {{ category.expense_count ?? 0 }}
            </td>
            <td class="categories__td">
              <div class="categories__actions-cell">
                <button
                  class="categories__action-btn"
                  @click="openEditModal(category)"
                >
                  {{ t('common.edit') }}
                </button>
                <button
                  :class="['categories__action-btn', category.active ? 'categories__action-btn--danger' : 'categories__action-btn--success']"
                  @click="toggleCategoryStatus(category)"
                >
                  {{ category.active ? t('admin.categories.deactivate') : t('admin.categories.activate') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Category Modal -->
      <div
        v-if="showModal"
        class="categories__modal-overlay"
        @click.self="closeModal"
      >
        <div class="categories__modal">
          <div class="categories__modal-header">
            <h3 class="categories__modal-title">
              {{ editingCategory ? t('admin.categories.editCategory') : t('admin.categories.createCategory') }}
            </h3>
            <button
              class="categories__modal-close"
              @click="closeModal"
            >
              &times;
            </button>
          </div>
          <form
            class="categories__modal-form"
            @submit.prevent="handleSubmit"
          >
            <div class="categories__form-group">
              <label class="categories__form-label">{{ t('admin.categories.form.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="categories__form-input"
                required
              />
            </div>
            <div class="categories__form-group">
              <label class="categories__form-label">{{ t('admin.categories.form.description') }}</label>
              <textarea
                v-model="form.description"
                class="categories__form-textarea"
                rows="3"
              />
            </div>
            <div class="categories__form-group">
              <label class="categories__form-checkbox-label">
                <input
                  v-model="form.active"
                  type="checkbox"
                  class="categories__form-checkbox"
                />
                {{ t('admin.categories.form.active') }}
              </label>
            </div>
            <div class="categories__modal-actions">
              <button
                type="button"
                class="categories__modal-btn categories__modal-btn--cancel"
                @click="closeModal"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="categories__modal-btn categories__modal-btn--submit"
                :disabled="submitting"
              >
                {{ editingCategory ? t('common.save') : t('common.create') }}
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
import { adminCategoriesService } from '@/services/admin/categories'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const categories = ref([])
const showModal = ref(false)
const editingCategory = ref(null)

const form = reactive({
  name: '',
  description: '',
  active: true
})

async function fetchCategories() {
  loading.value = true
  try {
    const data = await adminCategoriesService.list()
    categories.value = data.items || data || []
  } catch {
    toast.error(t('admin.categories.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingCategory.value = null
  form.name = ''
  form.description = ''
  form.active = true
  showModal.value = true
}

function openEditModal(category) {
  editingCategory.value = category
  form.name = category.name
  form.description = category.description || ''
  form.active = category.active !== false
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCategory.value = null
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (editingCategory.value) {
      await adminCategoriesService.update(editingCategory.value.id, { ...form })
      toast.success(t('admin.categories.messages.updated'))
    } else {
      await adminCategoriesService.create({ ...form })
      toast.success(t('admin.categories.messages.created'))
    }
    closeModal()
    await fetchCategories()
  } catch {
    toast.error(t('admin.categories.messages.saveError'))
  } finally {
    submitting.value = false
  }
}

async function toggleCategoryStatus(category) {
  try {
    await adminCategoriesService.update(category.id, { active: !category.active })
    category.active = !category.active
    toast.success(
      category.active
        ? t('admin.categories.messages.activated')
        : t('admin.categories.messages.deactivated')
    )
  } catch {
    toast.error(t('admin.categories.messages.statusError'))
  }
}

function moveUp(index) {
  if (index === 0) return
  const items = [...categories.value]
  const temp = items[index]
  items[index] = items[index - 1]
  items[index - 1] = temp
  categories.value = items
  saveOrder()
}

function moveDown(index) {
  if (index === categories.value.length - 1) return
  const items = [...categories.value]
  const temp = items[index]
  items[index] = items[index + 1]
  items[index + 1] = temp
  categories.value = items
  saveOrder()
}

async function saveOrder() {
  try {
    const orderedIds = categories.value.map((c, i) => ({ id: c.id, order: i }))
    await Promise.all(
      orderedIds.map(item =>
        adminCategoriesService.update(item.id, { order: item.order })
      )
    )
  } catch {
    toast.error(t('admin.categories.messages.reorderError'))
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.categories {
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

    &--order {
      width: 3.5rem;
      text-align: center;
    }

    &--right {
      text-align: right;
    }
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

    &--order {
      text-align: center;
    }

    &--right {
      text-align: right;
      font-weight: 600;
    }
  }

  &__reorder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__reorder-btn {
    background: none;
    border: none;
    color: $gray-400;
    font-size: $font-size-xs;
    cursor: pointer;
    padding: 0;
    line-height: 1;

    &:hover:not(:disabled) {
      color: $primary;
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  &__name {
    font-weight: 500;
    color: $gray-800;
  }

  &__description {
    color: $gray-500;
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
  &__form-textarea {
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
  }

  &__form-textarea {
    resize: vertical;
  }

  &__form-checkbox-label {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-sm;
    color: $gray-700;
    cursor: pointer;
  }

  &__form-checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: $primary;
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
