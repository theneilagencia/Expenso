<template>
  <div class="print-layout">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.print-layout {
  padding: 2rem;
  background: white;

  @media print {
    padding: 0;
  }
}
</style>
