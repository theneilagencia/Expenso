<template>
  <form class="user-form" @submit.prevent="handleSubmit">
    <div class="user-form__field">
      <label>{{ t('admin.users.fullName') }}</label>
      <input v-model="form.full_name" type="text" required />
    </div>
    <div class="user-form__field">
      <label>{{ t('admin.users.email') }}</label>
      <input v-model="form.email" type="email" required />
    </div>
    <div class="user-form__field">
      <label>{{ t('admin.users.role') }}</label>
      <select v-model="form.role" required>
        <option v-for="role in roles" :key="role" :value="role">
          {{ t(`admin.users.roles.${role}`) }}
        </option>
      </select>
    </div>
    <div class="user-form__field">
      <label>{{ t('admin.users.department') }}</label>
      <input v-model="form.department" type="text" />
    </div>
    <div v-if="!isEdit" class="user-form__field">
      <label>{{ t('admin.users.password') }}</label>
      <input v-model="form.password" type="password" :required="!isEdit" minlength="8" />
    </div>
    <div class="user-form__actions">
      <button type="button" class="user-form__btn user-form__btn--cancel" @click="$emit('cancel')">
        {{ t('common.cancel') }}
      </button>
      <button type="submit" class="user-form__btn user-form__btn--submit" :disabled="submitting">
        {{ submitting ? t('common.saving') : (isEdit ? t('common.save') : t('common.create')) }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ROLES } from '@/constants/roles'

const { t } = useI18n()
const emit = defineEmits(['submit', 'cancel'])

const props = defineProps({
  user: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false }
})

const roles = Object.values(ROLES)

const form = reactive({
  full_name: props.user?.full_name || '',
  email: props.user?.email || '',
  role: props.user?.role || ROLES.EMPLOYEE,
  department: props.user?.department || '',
  password: ''
})

function handleSubmit() {
  const payload = { ...form }
  if (props.isEdit) delete payload.password
  if (!payload.password) delete payload.password
  emit('submit', payload)
}
</script>

<style lang="scss" scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: $space-md;

  &__field {
    display: flex;
    flex-direction: column;
    gap: $space-xs;

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: $gray-700;
    }

    input, select {
      padding: $space-sm $space-md;
      border: 1px solid $gray-300;
      border-radius: $radius-md;
      font-size: 0.875rem;
      font-family: inherit;

      &:focus { outline: none; border-color: $primary; }
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-sm;
    margin-top: $space-md;
  }

  &__btn {
    padding: $space-sm $space-xl;
    border-radius: $radius-md;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;

    &--submit {
      background: $primary;
      color: $white;
      &:hover { background: $primary-dark; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    &--cancel {
      background: $white;
      color: $gray-700;
      border: 1px solid $gray-300;
      &:hover { background: $gray-50; }
    }
  }
}
</style>
