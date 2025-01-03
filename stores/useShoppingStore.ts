import { defineStore } from "pinia";

// Определяем интерфейс для отдельного элемента списка покупок
interface ShoppingItem {
  id?: string;
  name: string;
  quantity: number;
  completed: boolean;
  createdAt: Date;
  category?: string;
  notes?: string;
}

// Определяем интерфейс для состояния хранилища
interface ShoppingState {
  items: ShoppingItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

// Создаём store с использованием Composition API стиля
export const useShoppingStore = defineStore("shopping", {
  // Начальное состояние
  state: (): ShoppingState => ({
    items: [],
    categories: ["Продукты", "Бытовая химия", "Другое"],
    isLoading: false,
    error: null,
  }),

  // Геттеры - вычисляемые свойства store
  getters: {
    // Получаем количество элементов в списке
    totalItems: (state) => state.items.length,

    // Получаем только невыполненные элементы
    activeItems: (state) => state.items.filter((item) => !item.completed),

    // Получаем элементы по категории
    getItemsByCategory: (state) => {
      return (category: string) =>
        state.items.filter((item) => item.category === category);
    },

    // Проверяем, есть ли незавершённые элементы
    hasActiveItems: (state) => state.items.some((item) => !item.completed),
  },

  // Actions - методы для изменения состояния
  actions: {
    // @TODO Добавление нового элемента в список
    async addItem(item: Omit<ShoppingItem, "id" | "createdAt">) {
      // @TODO проверить есть ли элемент с таким именем
      // Создаём новый элемент
      const newItem: ShoppingItem = {
        createdAt: new Date(),
        ...item,
      };

      // Добавляем элемент в базу данных, получаем новый элемент
      // В первый раз ещё и создаст "коллекцию" в базе данных
      const savedItem: ShoppingItem = JSON.parse(
        await $fetch("/api/firebase", {
          method: "POST",
          body: {
            newItem,
          },
        })
      );

      // Добавляем элемент в список
      this.items.push(savedItem);
    },

    // Удаление элемента из списка
    removeItem(itemId: string) {
      // Используем метод findIndex для поиска индекса элемента в массиве по его id
      const index = this.items.findIndex((item) => item.id === itemId);
      if (index > -1) {
        // Если элемент найден (индекс больше -1),
        // используем метод splice для удаления одного элемента начиная с найденного индекса
        this.items.splice(index, 1);

        // Удаляем элемент из базы данных
        this.deleteDocFromFirebase(itemId);
      }
    },

    // @TODO Обновление существующего элемента

    // Переключение статуса выполнения
    toggleComplete(itemId: string) {
      // Используем метод findIndex для поиска индекса элемента в массив
      const item = this.items.find((item) => item.id === itemId);
      if (item) {
        // Если элемент найден, переключаем его статус
        item.completed = !item.completed;

        // Сохраняем изменения в Firebase
        this.updateDocInFirebase(itemId, { completed: item.completed });
      }
    },

    // @TODO Добавление новой категории

    // Загрузка данных из Firebase
    async loadFromFirebase() {
      this.items = await $fetch("/api/firebase");
    },

    // Удаление элемента из Firebase
    async deleteDocFromFirebase(id: string): Promise<void> {
      await $fetch("/api/firebase/" + id, {
        method: "DELETE",
      });
    },

    // Обновление элемента в Firebase
    async updateDocInFirebase(
      id: string,
      item: Partial<Omit<ShoppingItem, "id" | "createdAt">>
    ) {
      return await $fetch("/api/firebase/" + id, {
        method: "PUT",
        body: item,
      });
    },

    // Очистка списка
    clearCompleted() {
      // Отдельно сохраняем элементы, которые надо удалить
      const itemsToDelete: ShoppingItem[] = this.items.filter(
        (item) => item.completed
      );

      // Удаляем все элементы, которые были отмечены как завершенные
      this.items = this.items.filter((item) => !item.completed);

      // Проходимся по всем элементам, которые нужно удалить,...
      itemsToDelete.forEach((item) => {
        // ... и удаляем их из базы данных
        this.deleteDocFromFirebase(item.id as string);
      });
    },
  },
});
