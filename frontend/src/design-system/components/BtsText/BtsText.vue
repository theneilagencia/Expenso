<template>
  <component
    :is="tag"
    :class="textClasses"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * Tag HTML a ser renderizada
   * @values p, span, div, label
   */
  tag: {
    type: String,
    default: 'p',
    validator: (value) => ['p', 'span', 'div', 'label'].includes(value),
  },

  /**
   * Variante tipográfica
   * @values subtitle, body, body-sm, caption
   */
  variant: {
    type: String,
    default: 'body',
    validator: (value) => ['subtitle', 'body', 'body-sm', 'caption'].includes(value),
  },

  /**
   * Cor do texto
   * @values primary, secondary, tertiary, disabled, inverse, link
   */
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'tertiary', 'disabled', 'inverse', 'link'].includes(value),
  },

  /**
   * Alinhamento do texto
   * @values left, center, right, justify
   */
  align: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right', 'justify'].includes(value),
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
   * Estilo itálico
   */
  italic: {
    type: Boolean,
    default: false,
  },

  /**
   * Texto sublinhado
   */
  underline: {
    type: Boolean,
    default: false,
  },

  /**
   * Texto em maiúsculas
   */
  uppercase: {
    type: Boolean,
    default: false,
  },

  /**
   * Truncar texto com ellipsis
   */
  truncate: {
    type: Boolean,
    default: false,
  },

  /**
   * Limitar número de linhas (com ellipsis)
   */
  lineClamp: {
    type: Number,
    default: null,
    validator: (value) => value > 0,
  },

  /**
   * Remove margem padrão
   */
  noMargin: {
    type: Boolean,
    default: false,
  },
});

const textClasses = computed(() => [
  'bts-text',
  `bts-text--${props.variant}`,
  `bts-text--color-${props.color}`,
  `bts-text--align-${props.align}`,
  {
    [`bts-text--weight-${props.weight}`]: props.weight,
    'bts-text--italic': props.italic,
    'bts-text--underline': props.underline,
    'bts-text--uppercase': props.uppercase,
    'bts-text--truncate': props.truncate,
    'bts-text--line-clamp': props.lineClamp,
    'bts-text--no-margin': props.noMargin,
  },
]);
</script>

<style lang="scss" scoped>
.bts-text {
  font-family: var(--font-family-primary);
  margin: 0;
  
  // ============================================
  // VARIANTS - Estilos Tipográficos BTS
  // ============================================
  
  &--subtitle {
    font-size: var(--font-size-subtitle);
    font-weight: var(--font-weight-medium);
    line-height: 28px;
    margin-bottom: var(--spacing-3);
  }

  &--body {
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-regular);
    line-height: 24px;
    margin-bottom: var(--spacing-4);
  }

  &--body-sm {
    font-size: var(--font-size-body-sm);
    font-weight: var(--font-weight-regular);
    line-height: 20px;
    margin-bottom: var(--spacing-3);
  }

  &--caption {
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-regular);
    line-height: 16px;
    letter-spacing: 0;
    margin-bottom: var(--spacing-2);
  }
  
  // ============================================
  // COLORS
  // ============================================
  
  &--color-primary {
    color: var(--color-text-primary);
  }
  
  &--color-secondary {
    color: var(--color-text-secondary);
  }
  
  &--color-tertiary {
    color: var(--color-text-tertiary);
  }
  
  &--color-disabled {
    color: var(--color-text-disabled);
  }
  
  &--color-inverse {
    color: var(--color-text-inverse);
  }
  
  &--color-link {
    color: var(--color-text-link);
    cursor: pointer;
    
    &:hover {
      color: var(--color-text-link-hover);
      text-decoration: underline;
    }
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
  
  &--align-justify {
    text-align: justify;
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
  
  &--italic {
    font-style: italic;
  }
  
  &--underline {
    text-decoration: underline;
  }
  
  &--uppercase {
    text-transform: uppercase;
  }
  
  &--truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &--line-clamp {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: v-bind(lineClamp);
  }
  
  &--no-margin {
    margin: 0;
  }
}
</style>

