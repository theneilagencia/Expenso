<template>
  <transition name="slide">
    <div v-if="isVisible" class="bts-toast" :class="toastClasses" role="alert">
      <div class="bts-toast__icon">
        <BtsStatusIcon :variant="statusIconVariant" />
      </div>
      <div class="bts-toast__content">
        <div v-if="title" class="bts-toast__title">{{ title }}</div>
        <div class="bts-toast__message">{{ message }}</div>
      </div>
      <button v-if="closable" class="bts-toast__close" @click="close" aria-label="Fechar">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L9 9M9 1L1 9" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import BtsStatusIcon from '@/components/BtsStatusIcon/BtsStatusIcon.vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value)
  },
  title: { type: String, default: '' },
  message: { type: String, required: true },
  closable: { type: Boolean, default: true },
  duration: { type: Number, default: 5000 },
  visible: { type: Boolean, default: true }
});

const emit = defineEmits(['close']);

const isVisible = ref(props.visible);
let timeout = null;

const toastClasses = computed(() => [`bts-toast--${props.variant}`]);

const statusIconVariant = computed(() => {
  // Map toast variant to StatusIcon variant
  return props.variant;
});

function startTimer() {
  if (props.duration > 0) {
    timeout = setTimeout(() => close(), props.duration);
  }
}

function close() {
  clearTimeout(timeout);
  isVisible.value = false;
  emit('close');
}

watch(() => props.visible, (val) => {
  isVisible.value = val;
  if (val) startTimer();
});

onMounted(() => {
  if (props.duration > 0) startTimer();
});

onBeforeUnmount(() => {
  clearTimeout(timeout);
});
</script>

<style lang="scss" scoped>
/* Toast - Figma specs */
.bts-toast {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--color-primary-white);
  border: 1px solid;
  border-radius: 12px;
  font-family: var(--font-family-primary);

  &__icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-family: var(--font-family-primary);
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: var(--color-text-primary);
  }

  &__message {
    font-family: var(--font-family-primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-text-primary);
  }

  &__close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 4px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  /* Type variants - border colors from Figma */
  &--info {
    border-color: var(--color-primary-blue-highlight);
  }

  &--success {
    border-color: var(--color-success-dark);
  }

  &--warning {
    border-color: var(--color-warning-semi-dark);
  }

  &--danger {
    border-color: var(--color-error-semi-dark);
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

