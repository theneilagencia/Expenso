<template>
  <DefaultLayout>
    <div class="calendar">
      <div class="calendar__header">
        <div class="calendar__header-left">
          <h2 class="calendar__title">{{ t('admin.calendar.title') }}</h2>
          <p class="calendar__subtitle">{{ t('admin.calendar.subtitle') }}</p>
        </div>
        <button
          class="calendar__create-btn"
          @click="openCreateModal"
        >
          {{ t('admin.calendar.create') }}
        </button>
      </div>

      <div
        v-if="loading"
        class="calendar__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!holidays.length"
        class="calendar__empty"
      >
        {{ t('admin.calendar.empty') }}
      </div>

      <table
        v-else
        class="calendar__table"
      >
        <thead class="calendar__table-head">
          <tr>
            <th class="calendar__th">{{ t('admin.calendar.table.date') }}</th>
            <th class="calendar__th">{{ t('admin.calendar.table.name') }}</th>
            <th class="calendar__th">{{ t('admin.calendar.table.type') }}</th>
            <th class="calendar__th">{{ t('admin.calendar.table.stateCode') }}</th>
            <th class="calendar__th">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="calendar__table-body">
          <tr
            v-for="holiday in holidays"
            :key="holiday.id"
            class="calendar__row"
          >
            <td class="calendar__td">{{ formatDate(holiday.date) }}</td>
            <td class="calendar__td">
              <span class="calendar__name">{{ holiday.name }}</span>
            </td>
            <td class="calendar__td">
              <span :class="['calendar__type-badge', `calendar__type-badge--${holiday.type?.toLowerCase()}`]">
                {{ t(`admin.calendar.types.${holiday.type}`) }}
              </span>
            </td>
            <td class="calendar__td">{{ holiday.state_code || '-' }}</td>
            <td class="calendar__td">
              <div class="calendar__actions-cell">
                <button
                  class="calendar__action-btn"
                  @click="openEditModal(holiday)"
                >
                  {{ t('common.edit') }}
                </button>
                <button
                  class="calendar__action-btn calendar__action-btn--danger"
                  @click="confirmDelete(holiday)"
                >
                  {{ t('common.delete') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="totalPages > 1"
        class="calendar__pagination"
      >
        <button
          class="calendar__page-btn"
          :disabled="!hasPrev"
          @click="prevPage"
        >
          {{ t('common.previous') }}
        </button>
        <span class="calendar__page-info">
          {{ t('common.page') }} {{ page }} {{ t('common.of') }} {{ totalPages }}
        </span>
        <button
          class="calendar__page-btn"
          :disabled="!hasNext"
          @click="nextPage"
        >
          {{ t('common.next') }}
        </button>
      </div>

      <!-- Create/Edit Modal -->
      <div
        v-if="showModal"
        class="calendar__modal-overlay"
        @click.self="closeModal"
      >
        <div class="calendar__modal">
          <div class="calendar__modal-header">
            <h3 class="calendar__modal-title">
              {{ editingHoliday ? t('admin.calendar.editHoliday') : t('admin.calendar.createHoliday') }}
            </h3>
            <button
              class="calendar__modal-close"
              @click="closeModal"
            >
              &times;
            </button>
          </div>
          <form
            class="calendar__modal-form"
            @submit.prevent="handleSubmit"
          >
            <div class="calendar__form-group">
              <label class="calendar__form-label">{{ t('admin.calendar.form.date') }}</label>
              <input
                v-model="form.date"
                type="date"
                class="calendar__form-input"
                required
              />
            </div>
            <div class="calendar__form-group">
              <label class="calendar__form-label">{{ t('admin.calendar.form.name') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="calendar__form-input"
                required
              />
            </div>
            <div class="calendar__form-group">
              <label class="calendar__form-label">{{ t('admin.calendar.form.type') }}</label>
              <select
                v-model="form.type"
                class="calendar__form-select"
                required
              >
                <option
                  v-for="typeOption in typeOptions"
                  :key="typeOption"
                  :value="typeOption"
                >
                  {{ t(`admin.calendar.types.${typeOption}`) }}
                </option>
              </select>
            </div>
            <div
              v-if="form.type === 'STATE'"
              class="calendar__form-group"
            >
              <label class="calendar__form-label">{{ t('admin.calendar.form.stateCode') }}</label>
              <input
                v-model="form.state_code"
                type="text"
                class="calendar__form-input"
                maxlength="2"
                :placeholder="t('admin.calendar.form.stateCodePlaceholder')"
              />
            </div>
            <div class="calendar__modal-actions">
              <button
                type="button"
                class="calendar__modal-btn calendar__modal-btn--cancel"
                @click="closeModal"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="calendar__modal-btn calendar__modal-btn--submit"
                :disabled="submitting"
              >
                {{ editingHoliday ? t('common.save') : t('common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div
        v-if="showDeleteConfirm"
        class="calendar__modal-overlay"
        @click.self="cancelDelete"
      >
        <div class="calendar__modal calendar__modal--sm">
          <div class="calendar__modal-header">
            <h3 class="calendar__modal-title">{{ t('common.confirm.title') }}</h3>
            <button
              class="calendar__modal-close"
              @click="cancelDelete"
            >
              &times;
            </button>
          </div>
          <div class="calendar__modal-form">
            <p class="calendar__confirm-text">{{ t('admin.calendar.messages.deleteConfirm') }}</p>
            <div class="calendar__modal-actions">
              <button
                type="button"
                class="calendar__modal-btn calendar__modal-btn--cancel"
                @click="cancelDelete"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="button"
                class="calendar__modal-btn calendar__modal-btn--danger"
                :disabled="submitting"
                @click="handleDelete"
              >
                {{ t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { adminCalendarService } from '@/services/admin/calendar'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const holidays = ref([])
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingHoliday = ref(null)
const deletingHoliday = ref(null)

const typeOptions = ['NATIONAL', 'STATE', 'COMPANY']

const form = reactive({
  date: '',
  name: '',
  type: 'NATIONAL',
  state_code: ''
})

async function fetchHolidays(params = {}) {
  loading.value = true
  try {
    const data = await adminCalendarService.list(params)
    holidays.value = data.items || data || []
    if (data.meta?.total) {
      setTotal(data.meta.total)
    }
  } catch {
    toast.error(t('admin.calendar.messages.fetchError'))
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
} = usePagination(fetchHolidays)

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateStr))
}

function openCreateModal() {
  editingHoliday.value = null
  form.date = ''
  form.name = ''
  form.type = 'NATIONAL'
  form.state_code = ''
  showModal.value = true
}

function openEditModal(holiday) {
  editingHoliday.value = holiday
  form.date = holiday.date
  form.name = holiday.name
  form.type = holiday.type
  form.state_code = holiday.state_code || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingHoliday.value = null
}

function confirmDelete(holiday) {
  deletingHoliday.value = holiday
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  deletingHoliday.value = null
}

async function handleSubmit() {
  submitting.value = true
  try {
    const payload = {
      date: form.date,
      name: form.name,
      type: form.type,
      state_code: form.type === 'STATE' ? form.state_code : null
    }

    if (editingHoliday.value) {
      await adminCalendarService.update(editingHoliday.value.id, payload)
      toast.success(t('admin.calendar.messages.updated'))
    } else {
      await adminCalendarService.create(payload)
      toast.success(t('admin.calendar.messages.created'))
    }
    closeModal()
    await fetchHolidays()
  } catch {
    toast.error(t('admin.calendar.messages.saveError'))
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!deletingHoliday.value) return
  submitting.value = true
  try {
    await adminCalendarService.remove(deletingHoliday.value.id)
    toast.success(t('admin.calendar.messages.deleted'))
    cancelDelete()
    await fetchHolidays()
  } catch {
    toast.error(t('admin.calendar.messages.deleteError'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchHolidays()
})
</script>

<style lang="scss" scoped>
.calendar {
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

  &__name {
    font-weight: 500;
    color: $gray-800;
  }

  &__type-badge {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 500;

    &--national {
      background: rgba($primary, 0.1);
      color: $primary;
    }

    &--state {
      background: rgba($warning, 0.1);
      color: $warning;
    }

    &--company {
      background: rgba($success, 0.1);
      color: $success;
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

  &__confirm-text {
    font-size: $font-size-sm;
    color: $gray-700;
    margin-bottom: $spacing-lg;
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

    &--sm {
      max-width: 24rem;
    }
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

    &--danger {
      background: $danger;
      color: $white;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
