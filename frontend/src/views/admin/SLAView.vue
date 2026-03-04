<template>
  <DefaultLayout>
    <div class="sla">
      <div class="sla__header">
        <h2 class="sla__title">{{ t('admin.sla.title') }}</h2>
        <p class="sla__subtitle">{{ t('admin.sla.subtitle') }}</p>
      </div>

      <div
        v-if="loading"
        class="sla__loading"
      >
        {{ t('common.loading') }}
      </div>

      <div
        v-else-if="!rules.length"
        class="sla__empty"
      >
        {{ t('admin.sla.empty') }}
      </div>

      <table
        v-else
        class="sla__table"
      >
        <thead class="sla__table-head">
          <tr>
            <th class="sla__th">{{ t('admin.sla.table.name') }}</th>
            <th class="sla__th">{{ t('admin.sla.table.statusType') }}</th>
            <th class="sla__th sla__th--center">{{ t('admin.sla.table.warningHours') }}</th>
            <th class="sla__th sla__th--center">{{ t('admin.sla.table.deadlineHours') }}</th>
            <th class="sla__th sla__th--center">{{ t('admin.sla.table.status') }}</th>
            <th class="sla__th">{{ t('admin.sla.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="sla__table-body">
          <tr
            v-for="rule in rules"
            :key="rule.id"
            class="sla__row"
          >
            <td class="sla__td">
              <span class="sla__name">{{ rule.name }}</span>
            </td>
            <td class="sla__td">
              <span class="sla__status-type">{{ t(`status.${rule.status_type}`) }}</span>
            </td>
            <td class="sla__td sla__td--center">
              <div
                v-if="editingId === rule.id"
                class="sla__inline-edit"
              >
                <input
                  v-model.number="editForm.warning_hours"
                  type="number"
                  class="sla__inline-input"
                  min="1"
                />
              </div>
              <span v-else class="sla__hours">
                {{ rule.warning_hours }}{{ t('admin.sla.hoursUnit') }}
              </span>
            </td>
            <td class="sla__td sla__td--center">
              <div
                v-if="editingId === rule.id"
                class="sla__inline-edit"
              >
                <input
                  v-model.number="editForm.deadline_hours"
                  type="number"
                  class="sla__inline-input"
                  min="1"
                />
              </div>
              <span v-else class="sla__hours">
                {{ rule.deadline_hours }}{{ t('admin.sla.hoursUnit') }}
              </span>
            </td>
            <td class="sla__td sla__td--center">
              <button
                :class="['sla__toggle', rule.active ? 'sla__toggle--active' : 'sla__toggle--inactive']"
                @click="toggleActive(rule)"
              >
                <span class="sla__toggle-knob" />
              </button>
            </td>
            <td class="sla__td">
              <div class="sla__actions-cell">
                <template v-if="editingId === rule.id">
                  <button
                    class="sla__action-btn sla__action-btn--save"
                    :disabled="saving"
                    @click="saveEdit(rule)"
                  >
                    {{ t('common.save') }}
                  </button>
                  <button
                    class="sla__action-btn"
                    @click="cancelEdit"
                  >
                    {{ t('common.cancel') }}
                  </button>
                </template>
                <button
                  v-else
                  class="sla__action-btn"
                  @click="startEdit(rule)"
                >
                  {{ t('common.edit') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { adminSlaService } from '@/services/admin/sla'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const rules = ref([])
const editingId = ref(null)

const editForm = reactive({
  warning_hours: 0,
  deadline_hours: 0
})

async function fetchRules() {
  loading.value = true
  try {
    const data = await adminSlaService.list()
    rules.value = data.items || data || []
  } catch {
    toast.error(t('admin.sla.messages.fetchError'))
  } finally {
    loading.value = false
  }
}

function startEdit(rule) {
  editingId.value = rule.id
  editForm.warning_hours = rule.warning_hours
  editForm.deadline_hours = rule.deadline_hours
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(rule) {
  saving.value = true
  try {
    await adminSlaService.update(rule.id, {
      warning_hours: editForm.warning_hours,
      deadline_hours: editForm.deadline_hours
    })
    rule.warning_hours = editForm.warning_hours
    rule.deadline_hours = editForm.deadline_hours
    editingId.value = null
    toast.success(t('admin.sla.messages.updated'))
  } catch {
    toast.error(t('admin.sla.messages.updateError'))
  } finally {
    saving.value = false
  }
}

async function toggleActive(rule) {
  try {
    await adminSlaService.update(rule.id, { active: !rule.active })
    rule.active = !rule.active
    toast.success(
      rule.active
        ? t('admin.sla.messages.activated')
        : t('admin.sla.messages.deactivated')
    )
  } catch {
    toast.error(t('admin.sla.messages.toggleError'))
  }
}

onMounted(() => {
  fetchRules()
})
</script>

<style lang="scss" scoped>
.sla {
  &__header {
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

    &--center {
      text-align: center;
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

    &--center {
      text-align: center;
    }
  }

  &__name {
    font-weight: 500;
    color: $gray-800;
  }

  &__status-type {
    display: inline-block;
    padding: $spacing-xs $spacing-sm;
    background: $gray-100;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    color: $gray-600;
  }

  &__hours {
    font-weight: 500;
    color: $gray-800;
  }

  &__inline-edit {
    display: inline-block;
  }

  &__inline-input {
    width: 5rem;
    padding: $spacing-xs $spacing-sm;
    border: 1px solid $primary;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    text-align: center;
    color: $gray-800;
    box-shadow: 0 0 0 2px $primary-light;

    &:focus {
      outline: none;
    }
  }

  &__toggle {
    position: relative;
    width: 2.75rem;
    height: 1.5rem;
    border: none;
    border-radius: $radius-full;
    cursor: pointer;
    transition: background-color 0.3s;

    &--active {
      background: $success;
    }

    &--inactive {
      background: $gray-300;
    }
  }

  &__toggle-knob {
    position: absolute;
    top: 0.15rem;
    left: 0.15rem;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: $radius-full;
    background: $white;
    box-shadow: $shadow-sm;
    transition: transform 0.3s;

    .sla__toggle--active & {
      transform: translateX(1.25rem);
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

    &--save {
      background: $primary;
      color: $white;
      border-color: $primary;

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
