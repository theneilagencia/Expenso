<template>
  <AuthLayout>
    <form class="login-form" @submit.prevent="handleLogin">
      <div class="login-form__field">
        <label for="email">{{ t('auth.email') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          :placeholder="t('auth.email')"
          required
        />
      </div>
      <div class="login-form__field">
        <label for="password">{{ t('auth.password') }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          :placeholder="t('auth.password')"
          required
        />
      </div>
      <p v-if="error" class="login-form__error">{{ error }}</p>
      <button type="submit" class="login-form__submit" :disabled="loading">
        {{ loading ? t('common.loading') : t('auth.login') }}
      </button>
      <router-link :to="{ name: 'forgot-password' }" class="login-form__forgot">
        {{ t('auth.forgotPassword') }}
      </router-link>
      <div v-if="ssoProviders.length" class="login-form__sso">
        <div class="login-form__divider">
          <span>{{ t('auth.orContinueWith') }}</span>
        </div>
        <button
          v-for="provider in ssoProviders"
          :key="provider.provider"
          type="button"
          class="login-form__sso-btn"
          @click="handleSSO(provider)"
        >
          {{ provider.provider === 'azure_ad' ? 'Microsoft' : 'Google' }}
        </button>
      </div>
    </form>
  </AuthLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { authService } from '@/services/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const { t } = useI18n()
const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const ssoProviders = ref([])

onMounted(async () => {
  try {
    const data = await authService.getSSOConfig()
    ssoProviders.value = data.providers || []
  } catch {
    // SSO not available — continue with email/password only
  }
})

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = t('auth.invalidCredentials')
  } finally {
    loading.value = false
  }
}

function handleSSO(provider) {
  const redirectUri = `${window.location.origin}/auth/callback`
  const scopes = provider.provider === 'azure_ad'
    ? 'openid email profile'
    : 'openid email profile'
  const params = new URLSearchParams({
    client_id: provider.client_id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state: provider.provider,
  })
  window.location.href = `${provider.authorize_url}?${params.toString()}`
}
</script>

<style lang="scss" scoped>
.login-form {
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
      transition: border-color 0.2s;

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
    transition: background 0.2s;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: $primary-dark;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__forgot {
    display: block;
    text-align: center;
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    color: $primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__sso {
    margin-top: $spacing-lg;
  }

  &__divider {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-md;

    &::before,
    &::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid $gray-300;
    }

    span {
      padding: 0 $spacing-sm;
      font-size: $font-size-sm;
      color: $gray-500;
    }
  }

  &__sso-btn {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: $white;
    color: $gray-700;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-base;
    cursor: pointer;
    margin-bottom: $spacing-sm;
    transition: background 0.2s;

    &:hover {
      background: $gray-50;
    }
  }
}
</style>
