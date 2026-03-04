<template>
  <div class="form-steps">
    <div class="form-steps__indicator">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="form-steps__step"
        :class="{
          'form-steps__step--active': index === currentStep,
          'form-steps__step--completed': index < currentStep
        }"
      >
        <div class="form-steps__circle">
          <span v-if="index < currentStep">✓</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span class="form-steps__label">{{ step }}</span>
        <div v-if="index < steps.length - 1" class="form-steps__line"></div>
      </div>
    </div>
    <div class="form-steps__content">
      <slot :name="`step-${currentStep}`"></slot>
    </div>
    <div class="form-steps__actions">
      <button
        v-if="currentStep > 0"
        type="button"
        class="form-steps__btn form-steps__btn--secondary"
        @click="$emit('prev')"
      >
        {{ t('common.back') }}
      </button>
      <div class="form-steps__spacer"></div>
      <button
        v-if="currentStep < steps.length - 1"
        type="button"
        class="form-steps__btn form-steps__btn--primary"
        @click="$emit('next')"
      >
        {{ t('common.next') }}
      </button>
      <button
        v-if="currentStep === steps.length - 1"
        type="button"
        class="form-steps__btn form-steps__btn--primary"
        :disabled="submitting"
        @click="$emit('submit')"
      >
        {{ submitting ? t('common.submitting') : t('common.submit') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  steps: { type: Array, required: true },
  currentStep: { type: Number, default: 0 },
  submitting: { type: Boolean, default: false }
})

defineEmits(['prev', 'next', 'submit'])
</script>

<style lang="scss" scoped>
.form-steps {
  &__indicator {
    display: flex;
    align-items: center;
    margin-bottom: $space-xl;
  }

  &__step {
    display: flex;
    align-items: center;
    flex: 1;

    &--active .form-steps__circle {
      background: $primary;
      color: $white;
      border-color: $primary;
    }

    &--completed .form-steps__circle {
      background: $success;
      color: $white;
      border-color: $success;
    }

    &--completed .form-steps__line {
      background: $success;
    }
  }

  &__circle {
    width: 32px;
    height: 32px;
    border-radius: $radius-full;
    border: 2px solid $gray-300;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: $gray-500;
    flex-shrink: 0;
  }

  &__label {
    font-size: 0.75rem;
    color: $gray-600;
    margin-left: $space-xs;
    white-space: nowrap;
  }

  &__line {
    flex: 1;
    height: 2px;
    background: $gray-200;
    margin: 0 $space-sm;
  }

  &__content {
    min-height: 300px;
  }

  &__actions {
    display: flex;
    align-items: center;
    padding-top: $space-lg;
    border-top: 1px solid $gray-200;
    margin-top: $space-lg;
  }

  &__spacer {
    flex: 1;
  }

  &__btn {
    padding: $space-sm $space-xl;
    border-radius: $radius-md;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;

    &--primary {
      background: $primary;
      color: $white;
      &:hover { background: $primary-dark; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    &--secondary {
      background: $white;
      color: $gray-700;
      border: 1px solid $gray-300;
      &:hover { background: $gray-50; }
    }
  }
}
</style>
