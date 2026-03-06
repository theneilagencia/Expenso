<template>
  <DefaultLayout>
    <div class="mfa">
      <div class="mfa__header">
        <h2 class="mfa__title">{{ t('auth.mfa.title') }}</h2>
        <p class="mfa__subtitle">{{ t('auth.mfa.subtitle') }}</p>
      </div>

      <!-- MFA Already Enabled -->
      <div
        v-if="mfaEnabled"
        class="mfa__status-card"
      >
        <div class="mfa__status-icon mfa__status-icon--enabled">&#10003;</div>
        <h3 class="mfa__status-title">{{ t('auth.mfa.enabled') }}</h3>
        <p class="mfa__status-text">{{ t('auth.mfa.enabledDescription') }}</p>
        <button
          class="mfa__disable-btn"
          @click="showDisableModal = true"
        >
          {{ t('auth.mfa.disable') }}
        </button>
      </div>

      <!-- Step 1: Enable 2FA -->
      <div
        v-else-if="step === 1"
        class="mfa__step"
      >
        <div class="mfa__step-card">
          <h3 class="mfa__step-title">{{ t('auth.mfa.step1Title') }}</h3>
          <p class="mfa__step-text">{{ t('auth.mfa.step1Description') }}</p>
          <button
            class="mfa__enable-btn"
            :disabled="loading"
            @click="startSetup"
          >
            {{ loading ? t('common.loading') : t('auth.mfa.enableButton') }}
          </button>
        </div>
      </div>

      <!-- Step 2: QR Code -->
      <div
        v-else-if="step === 2"
        class="mfa__step"
      >
        <div class="mfa__step-card">
          <h3 class="mfa__step-title">{{ t('auth.mfa.step2Title') }}</h3>
          <p class="mfa__step-text">{{ t('auth.mfa.step2Description') }}</p>
          <div
            v-if="qrDataUri"
            class="mfa__qr-container"
          >
            <img
              :src="qrDataUri"
              :alt="t('auth.mfa.qrAlt')"
              class="mfa__qr-image"
            />
          </div>
          <div class="mfa__secret-container">
            <label class="mfa__secret-label">{{ t('auth.mfa.secretBackup') }}</label>
            <code class="mfa__secret-code">{{ secret }}</code>
          </div>
          <button
            class="mfa__next-btn"
            @click="step = 3"
          >
            {{ t('common.next') }}
          </button>
        </div>
      </div>

      <!-- Step 3: Verify code -->
      <div
        v-else-if="step === 3"
        class="mfa__step"
      >
        <div class="mfa__step-card">
          <h3 class="mfa__step-title">{{ t('auth.mfa.step3Title') }}</h3>
          <p class="mfa__step-text">{{ t('auth.mfa.step3Description') }}</p>
          <form
            class="mfa__verify-form"
            @submit.prevent="confirmMFA"
          >
            <div class="mfa__form-group">
              <label class="mfa__form-label">{{ t('auth.mfa.totpCode') }}</label>
              <input
                v-model="totpCode"
                type="text"
                inputmode="numeric"
                pattern="[0-9]{6}"
                maxlength="6"
                class="mfa__code-input"
                :placeholder="t('auth.mfa.codePlaceholder')"
                required
              />
            </div>
            <p
              v-if="verifyError"
              class="mfa__error"
            >
              {{ verifyError }}
            </p>
            <button
              type="submit"
              class="mfa__verify-btn"
              :disabled="loading || totpCode.length !== 6"
            >
              {{ loading ? t('common.loading') : t('auth.mfa.verify') }}
            </button>
          </form>
        </div>
      </div>

      <!-- Step 4: Success -->
      <div
        v-else-if="step === 4"
        class="mfa__step"
      >
        <div class="mfa__step-card">
          <div class="mfa__success-icon">&#10003;</div>
          <h3 class="mfa__step-title">{{ t('auth.mfa.successTitle') }}</h3>
          <p class="mfa__step-text">{{ t('auth.mfa.successDescription') }}</p>
          <button
            class="mfa__done-btn"
            @click="mfaEnabled = true; step = 1"
          >
            {{ t('auth.mfa.done') }}
          </button>
        </div>
      </div>

      <!-- Disable MFA Modal -->
      <div
        v-if="showDisableModal"
        class="mfa__modal-overlay"
        @click.self="showDisableModal = false"
      >
        <div class="mfa__modal">
          <div class="mfa__modal-header">
            <h3 class="mfa__modal-title">{{ t('auth.mfa.disableTitle') }}</h3>
            <button
              class="mfa__modal-close"
              @click="showDisableModal = false"
            >
              &times;
            </button>
          </div>
          <form
            class="mfa__modal-form"
            @submit.prevent="disableMFA"
          >
            <p class="mfa__modal-text">{{ t('auth.mfa.disableDescription') }}</p>
            <div class="mfa__form-group">
              <label class="mfa__form-label">{{ t('auth.currentPassword') }}</label>
              <input
                v-model="disablePassword"
                type="password"
                class="mfa__form-input"
                required
              />
            </div>
            <p
              v-if="disableError"
              class="mfa__error"
            >
              {{ disableError }}
            </p>
            <div class="mfa__modal-actions">
              <button
                type="button"
                class="mfa__modal-btn mfa__modal-btn--cancel"
                @click="showDisableModal = false"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="mfa__modal-btn mfa__modal-btn--danger"
                :disabled="loading"
              >
                {{ t('auth.mfa.disable') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { mfaService } from '@/services/mfa'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth.store'

const { t } = useI18n()
const toast = useToast()
const authStore = useAuthStore()

const loading = ref(false)
const step = ref(1)
const mfaEnabled = ref(false)
const qrDataUri = ref('')
const secret = ref('')
const totpCode = ref('')
const verifyError = ref('')
const showDisableModal = ref(false)
const disablePassword = ref('')
const disableError = ref('')

onMounted(() => {
  if (authStore.user?.mfa_enabled) {
    mfaEnabled.value = true
  }
})

async function startSetup() {
  loading.value = true
  verifyError.value = ''
  try {
    const data = await mfaService.setup()
    qrDataUri.value = data.qr_data_uri || data.qr_code || ''
    secret.value = data.secret || ''
    step.value = 2
  } catch {
    toast.error(t('auth.mfa.setupError'))
  } finally {
    loading.value = false
  }
}

async function confirmMFA() {
  loading.value = true
  verifyError.value = ''
  try {
    await mfaService.confirm(totpCode.value)
    step.value = 4
    authStore.updateUser({ mfa_enabled: true })
    toast.success(t('auth.mfa.setupSuccess'))
  } catch {
    verifyError.value = t('auth.mfa.invalidCode')
  } finally {
    loading.value = false
  }
}

async function disableMFA() {
  loading.value = true
  disableError.value = ''
  try {
    await mfaService.disable(disablePassword.value)
    mfaEnabled.value = false
    showDisableModal.value = false
    disablePassword.value = ''
    authStore.updateUser({ mfa_enabled: false })
    toast.success(t('auth.mfa.disableSuccess'))
  } catch {
    disableError.value = t('auth.mfa.disableError')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.mfa {
  max-width: 36rem;
  margin: 0 auto;

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

  &__status-card,
  &__step-card {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    padding: $spacing-xl;
    text-align: center;
  }

  &__status-icon {
    width: 3rem;
    height: 3rem;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-md;
    font-size: $font-size-xl;

    &--enabled {
      background: rgba($success, 0.1);
      color: $success;
    }
  }

  &__status-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-xs;
  }

  &__status-text {
    font-size: $font-size-sm;
    color: $gray-500;
    margin-bottom: $spacing-lg;
  }

  &__disable-btn {
    padding: $spacing-sm $spacing-lg;
    background: $white;
    color: $danger;
    border: 1px solid $danger;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba($danger, 0.05);
    }
  }

  &__step-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $gray-800;
    margin-bottom: $spacing-xs;
  }

  &__step-text {
    font-size: $font-size-sm;
    color: $gray-500;
    margin-bottom: $spacing-lg;
  }

  &__enable-btn,
  &__next-btn,
  &__verify-btn,
  &__done-btn {
    padding: $spacing-sm $spacing-xl;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background: $primary-dark;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__qr-container {
    margin-bottom: $spacing-lg;
  }

  &__qr-image {
    width: 12rem;
    height: 12rem;
    border: 1px solid $gray-200;
    border-radius: $radius-md;
  }

  &__secret-container {
    margin-bottom: $spacing-lg;
    text-align: left;
  }

  &__secret-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-700;
    margin-bottom: $spacing-xs;
  }

  &__secret-code {
    display: block;
    padding: $spacing-sm $spacing-md;
    background: $gray-50;
    border: 1px solid $gray-200;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-family: monospace;
    color: $gray-800;
    word-break: break-all;
    user-select: all;
  }

  &__verify-form {
    max-width: 16rem;
    margin: 0 auto;
  }

  &__form-group {
    margin-bottom: $spacing-md;
    text-align: left;
  }

  &__form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $gray-700;
    margin-bottom: $spacing-xs;
  }

  &__code-input {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-xl;
    text-align: center;
    letter-spacing: 0.5em;
    color: $gray-800;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }
  }

  &__form-input {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $gray-700;

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px $primary-light;
    }
  }

  &__error {
    color: $danger;
    font-size: $font-size-sm;
    margin-bottom: $spacing-md;
    text-align: left;
  }

  &__success-icon {
    width: 4rem;
    height: 4rem;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-md;
    font-size: $font-size-2xl;
    background: rgba($success, 0.1);
    color: $success;
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
    max-width: 24rem;
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

  &__modal-text {
    font-size: $font-size-sm;
    color: $gray-600;
    margin-bottom: $spacing-lg;
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
