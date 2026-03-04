<template>
  <DefaultLayout>
    <div class="profile">
      <div class="profile__header">
        <h2 class="profile__title">{{ t('settings.profile') }}</h2>
        <p class="profile__subtitle">{{ t('settings.profileSubtitle') }}</p>
      </div>

      <!-- User Info Card -->
      <div class="profile__card">
        <h3 class="profile__card-title">{{ t('settings.personalInfo') }}</h3>

        <form class="profile__form" @submit.prevent="handleSaveProfile">
          <div class="profile__field">
            <label class="profile__label" for="profile-name">
              {{ t('settings.name') }}
            </label>
            <input
              id="profile-name"
              v-model="profileForm.name"
              type="text"
              class="profile__input"
              :placeholder="t('settings.name')"
            />
          </div>

          <div class="profile__field">
            <label class="profile__label" for="profile-email">
              {{ t('settings.email') }}
            </label>
            <input
              id="profile-email"
              :value="user?.email"
              type="email"
              class="profile__input profile__input--readonly"
              disabled
            />
            <span class="profile__field-hint">{{ t('settings.emailReadonly') }}</span>
          </div>

          <div class="profile__field">
            <label class="profile__label" for="profile-role">
              {{ t('settings.role') }}
            </label>
            <input
              id="profile-role"
              :value="roleLabel"
              type="text"
              class="profile__input profile__input--readonly"
              disabled
            />
          </div>

          <div class="profile__field">
            <label class="profile__label" for="profile-department">
              {{ t('settings.department') }}
            </label>
            <input
              id="profile-department"
              :value="user?.department"
              type="text"
              class="profile__input profile__input--readonly"
              disabled
            />
          </div>

          <button
            type="submit"
            class="profile__btn profile__btn--primary"
            :disabled="savingProfile"
          >
            {{ savingProfile ? t('common.loading') : t('common.save') }}
          </button>
        </form>
      </div>

      <!-- Language Preference -->
      <div class="profile__card">
        <h3 class="profile__card-title">{{ t('settings.language') }}</h3>
        <p class="profile__card-description">{{ t('settings.languageDescription') }}</p>

        <div class="profile__locale-options">
          <button
            v-for="loc in SUPPORTED_LOCALES"
            :key="loc.code"
            class="profile__locale-option"
            :class="{ 'profile__locale-option--active': selectedLocale === loc.code }"
            @click="selectedLocale = loc.code"
          >
            <span class="profile__locale-flag">{{ loc.flag }}</span>
            <span class="profile__locale-label">{{ loc.label }}</span>
          </button>
        </div>

        <button
          class="profile__btn profile__btn--primary"
          :disabled="savingLocale"
          @click="handleSaveLocale"
        >
          {{ savingLocale ? t('common.loading') : t('common.save') }}
        </button>
      </div>

      <!-- Change Password -->
      <div class="profile__card">
        <h3 class="profile__card-title">{{ t('settings.changePassword') }}</h3>

        <form class="profile__form" @submit.prevent="handleChangePassword">
          <div class="profile__field">
            <label class="profile__label" for="current-password">
              {{ t('settings.currentPassword') }}
            </label>
            <input
              id="current-password"
              v-model="passwordForm.current_password"
              type="password"
              class="profile__input"
              :placeholder="t('settings.currentPassword')"
              required
            />
          </div>

          <div class="profile__field">
            <label class="profile__label" for="new-password">
              {{ t('auth.newPassword') }}
            </label>
            <input
              id="new-password"
              v-model="passwordForm.new_password"
              type="password"
              class="profile__input"
              :placeholder="t('auth.newPassword')"
              required
              minlength="8"
            />
          </div>

          <div class="profile__field">
            <label class="profile__label" for="confirm-password">
              {{ t('auth.confirmPassword') }}
            </label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirm_password"
              type="password"
              class="profile__input"
              :placeholder="t('auth.confirmPassword')"
              required
            />
            <span
              v-if="passwordMismatch"
              class="profile__field-error"
            >
              {{ t('settings.passwordMismatch') }}
            </span>
          </div>

          <button
            type="submit"
            class="profile__btn profile__btn--primary"
            :disabled="savingPassword || passwordMismatch"
          >
            {{ savingPassword ? t('common.loading') : t('settings.updatePassword') }}
          </button>
        </form>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useAuth } from '@/composables/useAuth'
import { useLocale } from '@/composables/useLocale'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth.store'
import { SUPPORTED_LOCALES } from '@/constants/locales'
import { ROLES } from '@/constants/roles'
import http from '@/services/http'

const { t } = useI18n()
const { fetchMe } = useAuth()
const { setLocale, currentLocale } = useLocale()
const toast = useToast()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const savingProfile = ref(false)
const savingLocale = ref(false)
const savingPassword = ref(false)
const selectedLocale = ref(currentLocale.value)

const profileForm = reactive({
  name: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordMismatch = computed(() => {
  if (!passwordForm.new_password || !passwordForm.confirm_password) return false
  return passwordForm.new_password !== passwordForm.confirm_password
})

const roleLabel = computed(() => {
  const map = {
    [ROLES.EMPLOYEE]: t('settings.roleEmployee'),
    [ROLES.MANAGER]: t('settings.roleManager'),
    [ROLES.FINANCE]: t('settings.roleFinance'),
    [ROLES.ADMIN]: t('settings.roleAdmin')
  }
  return map[user.value?.role] || user.value?.role
})

async function handleSaveProfile() {
  savingProfile.value = true
  try {
    await http.patch('/api/v1/users/me', {
      name: profileForm.name
    })
    await fetchMe()
    toast.success(t('common.success'))
  } catch {
    toast.error(t('common.error'))
  } finally {
    savingProfile.value = false
  }
}

async function handleSaveLocale() {
  savingLocale.value = true
  try {
    setLocale(selectedLocale.value)
    await http.patch('/api/v1/users/me', {
      locale: selectedLocale.value
    })
    toast.success(t('common.success'))
  } catch {
    toast.error(t('common.error'))
  } finally {
    savingLocale.value = false
  }
}

async function handleChangePassword() {
  if (passwordMismatch.value) return

  savingPassword.value = true
  try {
    await http.post('/api/v1/auth/change-password', {
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password
    })
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
    toast.success(t('auth.passwordChanged'))
  } catch {
    toast.error(t('common.error'))
  } finally {
    savingPassword.value = false
  }
}

onMounted(async () => {
  await fetchMe()
  profileForm.name = user.value?.name || ''
  selectedLocale.value = user.value?.locale || currentLocale.value
})
</script>

<style lang="scss" scoped>
.profile {
  max-width: 700px;
  margin: 0 auto;

  &__header {
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $gray-900;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $gray-500;
    margin-top: $spacing-xs;
  }

  &__card {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    padding: $spacing-xl;
    margin-bottom: $spacing-lg;
  }

  &__card-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-lg;
  }

  &__card-description {
    font-size: $font-size-sm;
    color: $gray-500;
    margin-bottom: $spacing-lg;
    margin-top: -$spacing-sm;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-700;
  }

  &__input {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-base;
    color: $gray-800;
    background: $white;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 3px $primary-light;
    }

    &--readonly {
      background: $gray-50;
      color: $gray-500;
      cursor: not-allowed;
    }
  }

  &__field-hint {
    font-size: $font-size-xs;
    color: $gray-400;
  }

  &__field-error {
    font-size: $font-size-xs;
    color: $danger;
  }

  &__locale-options {
    display: flex;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  &__locale-option {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-lg;
    background: $white;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
    cursor: pointer;
    transition: all 0.2s;
    font-size: $font-size-sm;
    color: $gray-700;

    &:hover {
      border-color: $primary-light;
      background: $gray-50;
    }

    &--active {
      border-color: $primary;
      background: $primary-light;
      color: $primary-dark;
      font-weight: 500;
    }
  }

  &__locale-flag {
    font-size: $font-size-xl;
  }

  &__locale-label {
    font-size: $font-size-sm;
  }

  &__btn {
    padding: $spacing-sm $spacing-xl;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    align-self: flex-start;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--primary {
      background: $primary;
      color: $white;

      &:hover:not(:disabled) {
        background: $primary-dark;
      }
    }
  }
}
</style>
