<template>
  <nav class="bts-breadcrumb" aria-label="Breadcrumb">
    <ol class="bts-breadcrumb__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="bts-breadcrumb__item"
        :class="{ 'bts-breadcrumb__item--active': index === items.length - 1 }"
      >
        <span v-if="index > 0" class="bts-breadcrumb__separator" aria-hidden="true">
          <slot name="separator">{{ separator }}</slot>
        </span>

        <!-- Last item (current page) -->
        <span
          v-if="index === items.length - 1"
          class="bts-breadcrumb__text bts-breadcrumb__text--current"
          :aria-current="'page'"
        >
          {{ item.label }}
        </span>

        <!-- Router link -->
        <router-link
          v-else-if="item.to"
          :to="item.to"
          class="bts-breadcrumb__link"
          @click="handleClick(item, index, $event)"
        >
          {{ item.label }}
        </router-link>

        <!-- Anchor link -->
        <a
          v-else-if="item.href"
          :href="item.href"
          class="bts-breadcrumb__link"
          @click="handleClick(item, index, $event)"
        >
          {{ item.label }}
        </a>

        <!-- Plain text (no navigation) -->
        <span
          v-else
          class="bts-breadcrumb__link bts-breadcrumb__link--clickable"
          role="link"
          tabindex="0"
          @click="handleClick(item, index, $event)"
          @keydown.enter="handleClick(item, index, $event)"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
    validator: (value) => value.every((item) => item.label),
  },
  separator: {
    type: String,
    default: '/',
  },
});

const emit = defineEmits(['navigate']);

function handleClick(item, index, event) {
  emit('navigate', { item, index, event });
}
</script>

<style lang="scss" scoped>
.bts-breadcrumb {
  font-family: var(--font-family-primary);

  &__list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0;
  }

  &__item {
    display: inline-flex;
    align-items: center;
  }

  &__separator {
    display: inline-flex;
    align-items: center;
    margin: 0 8px;
    font-size: 12px;
    color: var(--color-neutral-gray-semi-dark);
    user-select: none;
  }

  &__link {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color-secondary-blue-s01);
    text-decoration: none;
    cursor: pointer;
    transition: color 0.15s ease;
    border-radius: 2px;

    &:hover {
      color: var(--color-secondary-blue-s02);
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }
  }

  &__text--current {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--color-text-primary);
  }
}
</style>

