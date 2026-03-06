<template>
  <div class="bts-stat-card">
    <div v-if="icon" class="bts-stat-card__icon" :class="`bts-stat-card__icon--${variant}`">
      <BtsIcon :name="icon" :prefix="iconPrefix" size="md" color="currentColor" />
    </div>
    <div class="bts-stat-card__content">
      <span class="bts-stat-card__title">{{ title }}</span>
      <span class="bts-stat-card__value">{{ value }}</span>
      <div v-if="subtitle || trendValue" class="bts-stat-card__footer">
        <span v-if="trendValue" class="bts-stat-card__trend" :class="`bts-stat-card__trend--${trend}`">
          <BtsIcon v-if="trend === 'up'" name="arrow-trend-up" prefix="fas" size="sm" color="currentColor" />
          <BtsIcon v-else-if="trend === 'down'" name="arrow-trend-down" prefix="fas" size="sm" color="currentColor" />
          {{ trendValue }}
        </span>
        <span v-else-if="subtitle" class="bts-stat-card__subtitle">{{ subtitle }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import BtsIcon from '../BtsIcon/BtsIcon.vue';

defineProps({
  icon: {
    type: String,
    default: '',
  },
  iconPrefix: {
    type: String,
    default: 'fas',
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['success', 'warning', 'danger', 'info', 'default', 'primary'].includes(value),
  },
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  trend: {
    type: String,
    default: 'neutral',
    validator: (value) => ['up', 'down', 'neutral'].includes(value),
  },
  trendValue: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped>
.bts-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-primary-white);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--shadow-sm);

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: 50%;
    flex-shrink: 0;

    // Variantes usando as mesmas cores do BtsBadge
    &--success {
      background-color: #d9fbd3;
      color: var(--color-success-dark);
    }

    &--warning {
      background-color: #fff6d1;
      color: var(--color-warning-dark);
    }

    &--danger {
      background-color: rgba(255, 159, 131, 0.4);
      color: var(--color-error-dark);
    }

    &--info {
      background-color: rgba(107, 208, 255, 0.4);
      color: var(--color-primary-blue-highlight);
    }

    &--default {
      background-color: var(--color-neutral-gray-light);
      color: var(--color-primary-blue-highlight);
    }

    &--primary {
      background-color: rgba(24, 90, 180, 0.1);
      color: var(--color-primary-blue-highlight);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-family: var(--font-family-primary);
    font-size: 12px;
    font-weight: 500;
    color: var(--color-neutral-gray-dark);
    line-height: 1.4;
  }

  &__value {
    font-family: var(--font-family-primary);
    font-size: 28px;
    font-weight: 600;
    color: var(--color-neutral-black);
    line-height: 1.2;
  }

  &__footer {
    margin-top: 4px;
  }

  &__subtitle {
    font-family: var(--font-family-primary);
    font-size: 12px;
    font-weight: 400;
    color: var(--color-neutral-gray-semi-dark);
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-family-primary);
    font-size: 12px;
    font-weight: 500;

    &--up {
      color: var(--color-success-dark);
    }

    &--down {
      color: var(--color-error-dark);
    }

    &--neutral {
      color: var(--color-primary-blue-highlight);
    }
  }
}
</style>

