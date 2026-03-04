<template>
  <AuthLayout>
    <div class="sso-callback">
      <p v-if="loading">{{ t('common.loading') }}</p>
      <p v-if="error" class="sso-callback__error">{{ error }}</p>
      <router-link v-if="error" :to="{ name: 'login' }" class="sso-callback__link">
        {{ t('auth.backToLogin') }}
      </router-link>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const code = route.query.code
  const provider = route.query.state
  if (!code || !provider) {
    error.value = t('auth.ssoFailed')
    loading.value = false
    return
  }
  try {
    const data = await authService.ssoLogin(provider, code)
    authStore.setAuth(data)
    router.push({ name: 'dashboard' })
  } catch {
    error.value = t('auth.ssoFailed')
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.sso-callback {
  text-align: center;
  padding: $spacing-xl;

  &__error {
    color: $danger;
    margin-bottom: $spacing-md;
  }

  &__link {
    color: $primary;
    font-size: $font-size-sm;
    text-decoration: none;

    &:hover { text-decoration: underline; }
  }
}
</style>
