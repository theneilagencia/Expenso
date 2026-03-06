<template>
  <AuthLayout>
    <form v-if="!success" class="reset-form" @submit.prevent="handleSubmit">
      <div class="reset-form__field">
        <label for="password">{{ t('auth.newPassword') }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          :placeholder="t('auth.newPassword')"
          required
          minlength="8"
        />
      </div>
      <div class="reset-form__field">
        <label for="confirm">{{ t('auth.confirmPassword') }}</label>
        <input
          id="confirm"
          v-model="confirm"
          type="password"
          :placeholder="t('auth.confirmPassword')"
          required
          minlength="8"
        />
      </div>
      <p v-if="error" class="reset-form__error">{{ error }}</p>
      <button type="submit" class="reset-form__submit" :disabled="loading">
        {{ loading ? t('common.loading') : t('auth.resetPassword') }}
      </button>
    </form>
    <div v-else class="reset-form__success">
      <p>{{ t('auth.passwordChanged') }}</p>
      <router-link :to="{ name: 'login' }" class="reset-form__link">
        {{ t('auth.backToLogin') }}
      </router-link>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { authService } from '@/services/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const { t } = useI18n()
const route = useRoute()

const password = ref('')
const confirm = ref('')
const error = ref('')
const loading = ref(false)
const success = ref(false)

async function handleSubmit() {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = t('auth.passwordMismatch')
    return
  }
  loading.value = true
  try {
    await authService.confirmPasswordReset(route.query.token, password.value)
    success.value = true
  } catch {
    error.value = t('auth.resetFailed')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.reset-form {
  &__field {
    margin-bottom: $spacing-md;

    label {
      display: block;
      margin-bottom: $spacing-xs;
      font-size: $font-size-sm;
      font-weight: 500;
      color: $gray-700;
    }

    input {
      width: 100%;
      padding: $spacing-sm $spacing-md;
      border: 1px solid $gray-300;
      border-radius: $radius-md;
      font-size: $font-size-base;

      &:focus {
        outline: none;
        border-color: $primary;
        box-shadow: 0 0 0 3px $primary-light;
      }
    }
  }

  &__error {
    color: $danger;
    font-size: $font-size-sm;
    margin-bottom: $spacing-md;
  }

  &__submit {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-base;
    font-weight: 500;
    cursor: pointer;

    &:hover:not(:disabled) { background: $primary-dark; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }

  &__success {
    text-align: center;

    p {
      color: $success;
      font-size: $font-size-base;
      margin-bottom: $spacing-lg;
    }
  }

  &__link {
    display: block;
    text-align: center;
    font-size: $font-size-sm;
    color: $primary;
    text-decoration: none;

    &:hover { text-decoration: underline; }
  }
}
</style>
