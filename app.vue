<template>
  <div>
    <ShoppingList />
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
import { useShoppingStore } from '@/stores/useShoppingStore'

// начиная со следующей строчки мы получаем доступ
const shoppingStore = useShoppingStore()

// Добавление элемента
shoppingStore.addItem({
  name: 'Молоко',
  quantity: 1,
  completed: false,
  category: 'Продукты'
})

console.log(shoppingStore.items);
</script>