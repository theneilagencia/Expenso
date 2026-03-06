<template>
  <component
    :is="tag"
    :class="headingClasses"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * Nível do heading (h1-h6)
   * @values h1, h2, h3, h4, h5, h6
   */
  level: {
    type: [String, Number],
    default: 'h2',
    validator: (value) => {
      const level = String(value);
      return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '1', '2', '3', '4', '5', '6'].includes(level);
    },
  },

  /**
   * Estilo visual do heading (pode ser diferente do nível semântico)
   * @values display-xl, display-lg, h1, h2, h3, h4
   */
  variant: {
    type: String,
    default: null,
    validator: (value) => {
      if (!value) return true;
      return ['display-xl', 'display-lg', 'h1', 'h2', 'h3', 'h4'].includes(value);
    },
  },

  /**
   * Cor do texto
   * @values primary, secondary, tertiary, inverse
   */
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'tertiary', 'inverse'].includes(value),
  },

  /**
   * Alinhamento do texto
   * @values left, center, right
   */
  align: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right'].includes(value),
  },

  /**
   * Peso da fonte (sobrescreve o padrão do variant)
   * @values thin, light, regular, medium, semibold, bold, extrabold, black
   */
  weight: {
    type: String,
    default: null,
    validator: (value) => {
      if (!value) return true;
      return ['thin', 'light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black'].includes(value);
    },
  },

  /**
   * Remove margem padrão
   */
  noMargin: {
    type: Boolean,
    default: false,
  },
});

const tag = computed(() => {
  const level = String(props.level);
  // Se level é número (1-6), converte para h1-h6
  if (['1', '2', '3', '4', '5', '6'].includes(level)) {
    return `h${level}`;
  }
  return level;
});

const headingClasses = computed(() => {
  const variant = props.variant || tag.value;

  return [
    'bts-heading',
    `bts-heading--${variant}`,
    `bts-heading--color-${props.color}`,
    `bts-heading--align-${props.align}`,
    {
      [`bts-heading--weight-${props.weight}`]: props.weight,
      'bts-heading--no-margin': props.noMargin,
    },
  ];
});
</script>

<style lang="scss" scoped>
@import '@/styles/tokens';
@import '@/styles/mixins';

.bts-heading {
  font-family: var(--font-family-primary);
  margin: 0;
  
  // ============================================
  // VARIANTS - Estilos Tipográficos BTS
  // ============================================
  
  &--display-xl {
    font-size: var(--font-size-display-xl);
    font-weight: var(--font-weight-bold);
    line-height: 64px;
    letter-spacing: 0;
    margin-bottom: var(--spacing-6);
  }

  &--display-lg {
    font-size: var(--font-size-display-lg);
    font-weight: var(--font-weight-bold);
    line-height: 56px;
    letter-spacing: 0;
    margin-bottom: var(--spacing-6);
  }

  &--h1 {
    font-size: var(--font-size-heading-1);
    font-weight: var(--font-weight-bold);
    line-height: 48px;
    margin-bottom: var(--spacing-5);
  }

  &--h2 {
    font-size: var(--font-size-heading-2);
    font-weight: var(--font-weight-bold);
    line-height: 40px;
    margin-bottom: var(--spacing-4);
  }

  &--h3 {
    font-size: var(--font-size-heading-3);
    font-weight: var(--font-weight-semibold);
    line-height: 36px;
    margin-bottom: var(--spacing-4);
  }

  &--h4 {
    font-size: var(--font-size-heading-4);
    font-weight: var(--font-weight-medium);
    line-height: 32px;
    margin-bottom: var(--spacing-3);
  }

  &--h5 {
    font-size: var(--font-size-subtitle);
    font-weight: var(--font-weight-medium);
    line-height: 28px;
    margin-bottom: var(--spacing-3);
  }

  &--h6 {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    line-height: 24px;
    margin-bottom: var(--spacing-2);
  }
  
  // ============================================
  // COLORS
  // ============================================
  
  &--color-primary {
    color: var(--color-primary-blue);
  }
  
  &--color-secondary {
    color: var(--color-text-secondary);
  }
  
  &--color-tertiary {
    color: var(--color-text-tertiary);
  }
  
  &--color-inverse {
    color: var(--color-text-inverse);
  }
  
  // ============================================
  // ALIGNMENT
  // ============================================
  
  &--align-left {
    text-align: left;
  }
  
  &--align-center {
    text-align: center;
  }
  
  &--align-right {
    text-align: right;
  }
  
  // ============================================
  // WEIGHT OVERRIDES
  // ============================================
  
  &--weight-thin {
    font-weight: var(--font-weight-thin);
  }
  
  &--weight-light {
    font-weight: var(--font-weight-light);
  }
  
  &--weight-regular {
    font-weight: var(--font-weight-regular);
  }
  
  &--weight-medium {
    font-weight: var(--font-weight-medium);
  }
  
  &--weight-semibold {
    font-weight: var(--font-weight-semibold);
  }
  
  &--weight-bold {
    font-weight: var(--font-weight-bold);
  }
  
  &--weight-extrabold {
    font-weight: var(--font-weight-extrabold);
  }
  
  &--weight-black {
    font-weight: var(--font-weight-black);
  }
  
  // ============================================
  // MODIFIERS
  // ============================================
  
  &--no-margin {
    margin: 0;
  }
}
</style>

