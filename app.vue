<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
import { useShoppingStore } from '@/stores/useShoppingStore'

// начиная со следующей строчки мы получаем доступ
const shoppingStore = useShoppingStore()
console.log(shoppingStore.items)
</script>