<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'

const { initLocale } = useLocale()

onMounted(() => {
  initLocale()
})
</script>
