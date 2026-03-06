<template>
  <AuthLayout>
    <form v-if="!sent" class="forgot-form" @submit.prevent="handleSubmit">
      <p class="forgot-form__text">{{ t('auth.forgotPasswordText') }}</p>
      <div class="forgot-form__field">
        <label for="email">{{ t('auth.email') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          :placeholder="t('auth.email')"
          required
        />
      </div>
      <p v-if="error" class="forgot-form__error">{{ error }}</p>
      <button type="submit" class="forgot-form__submit" :disabled="loading">
        {{ loading ? t('common.loading') : t('auth.sendResetLink') }}
      </button>
      <router-link :to="{ name: 'login' }" class="forgot-form__back">
        {{ t('auth.backToLogin') }}
      </router-link>
    </form>
    <div v-else class="forgot-form__success">
      <p>{{ t('auth.resetLinkSent') }}</p>
      <router-link :to="{ name: 'login' }" class="forgot-form__back">
        {{ t('auth.backToLogin') }}
      </router-link>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authService } from '@/services/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const { t } = useI18n()

const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await authService.requestPasswordReset(email.value)
    sent.value = true
  } catch {
    error.value = t('auth.resetRequestFailed')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.forgot-form {
  &__text {
    font-size: $font-size-sm;
    color: $gray-600;
    margin-bottom: $spacing-lg;
  }

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

  &__back {
    display: block;
    text-align: center;
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    color: $primary;
    text-decoration: none;

    &:hover { text-decoration: underline; }
  }

  &__success {
    text-align: center;

    p {
      color: $success;
      font-size: $font-size-base;
      margin-bottom: $spacing-lg;
    }
  }
}
</style>
