<template>
  <div class="shopping-list">
    <!-- Форма добавления нового элемента -->
    <ShoppingItemForm />

    <!-- Фильтры и статистика -->
    <div class="flex justify-between items-center mb-4">
      <!-- @TODO статистика -->
      <select v-model="currentCategory" class="p-2 border rounded">
        <option value="">Все категории</option>
        <option
          v-for="category in store.categories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </div>

    <!-- Список покупок -->
    <div class="space-y-2">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="flex items-center p-3 border rounded hover:bg-gray-50"
        :class="{ 'bg-gray-100': item.completed }"
      >
        <div class="flex-grow">
          <div :class="{ 'line-through text-gray-500': item.completed }">
            {{ item.name }}
          </div>
          <div class="text-sm text-gray-600">
            {{ item.category || "Без категории" }} • {{ item.quantity }} шт.
          </div>
        </div>
        Удалить
      </div>
    </div>

    <!-- Сообщение, если список пуст -->
    <div
      v-if="filteredItems.length === 0"
      class="text-center py-8 text-gray-500"
    >
      {{
        currentCategory ? "В этой категории нет покупок" : "Список покупок пуст"
      }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useShoppingStore } from "@/stores/useShoppingStore";

// Инициализируем store
const store = useShoppingStore();

// Текущая выбранная категория для фильтрации
const currentCategory = ref("");

// Вычисляемый список с учётом фильтра по категории
const filteredItems = computed(() => {
  if (!currentCategory.value) {
    return store.items;
  }
  return store.getItemsByCategory(currentCategory.value);
});
</script>
