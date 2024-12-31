import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { defineStore } from "pinia";

// Имя коллекции в Firebase
const COLLECTION_NAME: string = "shoppingItems" as const;

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

      // Добавляем элемент в базу данных, получаем ID
      // В первый раз ещё и создаст "коллекцию"
      const docRef = await this.addDocToFirebase(newItem);

      // Добавляем элемент в список, добавляя ему ID
      this.items.push({ id: docRef.id, ...newItem });

      // Сохраняем в локальное хранилище
      //this.saveToLocalStorage();
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
        // После удаления сохраняем обновленный список
        //this.saveToLocalStorage();
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
        // Сохраняем в локальное хранилище
        //this.saveToLocalStorage();
      }
    },

    // @TODO Добавление новой категории

    // Загрузка данных из локального хранилища
    loadFromLocalStorage() {
      try {
        // Пытается получить данные из localStorage по ключу "shopping-list"
        const saved = localStorage.getItem("shopping-list");
        if (saved) {
          // Если данные найдены, преобразует их из JSON строки обратно в объект
          const parsed = JSON.parse(saved);
          // Для каждого элемента списка преобразует строковое представление даты обратно в объект Date
          this.items = parsed.items.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }));
        }
      } catch (e) {
        this.error = "Ошибка при загрузке данных";
        console.error("Ошибка при загрузке из localStorage:", e);
      }
    },

    // Загрузка данных из Firebase
    async loadFromFirebase() {
      try {
        // Используем $db для доступа к базе данных
        const { $db } = useNuxtApp();

        // Делаем из полученных данных массив и приводим к формату списка ShoppingItem
        this.items = (await getDocs(collection($db, COLLECTION_NAME))).docs.map(
          (doc) => ({
            ...(doc.data() as ShoppingItem),
            id: doc.id,
          })
        );
      } catch (e) {
        this.error = "Ошибка при загрузке данных";
        console.error("Ошибка при загрузке из Firebase:", e);
      }
    },

    // Добавление элемента в Firebase
    async addDocToFirebase(
      item: Omit<ShoppingItem, "id">
    ): Promise<DocumentData> {
      // Используем $db для доступа к базе данных
      const { $db } = useNuxtApp();

      try {
        // Добавляем элемент в базу данных
        // В первый раз ещё и создаст "коллекцию"
        return await addDoc(
          // авторизация и указание на "коллекцию"
          collection($db, COLLECTION_NAME),
          // данные для добавления
          item
        );
      } catch (e) {
        this.error = "Ошибка при добавлении элемента";
        console.error("Ошибка при добавлении shoppingItem: ", e);
        return { id: undefined };
      }
    },

    // Удаление элемента из Firebase
    async deleteDocFromFirebase(id: string): Promise<void> {
      // Используем $db для доступа к базе данных
      const { $db } = useNuxtApp();

      try {
        // Получаем указатель на элемент, который нужно удалить
        const docRef = doc($db, COLLECTION_NAME, id);

        // Удаляем элемент
        await deleteDoc(docRef);
      } catch (e) {
        this.error = "Ошибка при удалении элемента";
        console.error("Ошибка при удалении shoppingItem: ", e);
      }
    },

    // Обновление элемента в Firebase
    async updateDocInFirebase(
      id: string,
      item: Partial<Omit<ShoppingItem, "id" | "createdAt">>
    ) {
      // Используем $db для доступа к базе данных
      const { $db } = useNuxtApp();

      try {
        // Получаем указатель на элемент, который нужно обновить
        const docRef = doc($db, COLLECTION_NAME, id);

        // Обновляем элемент
        await updateDoc(docRef, item);
      } catch (e) {
        this.error = "Ошибка при обновлении элемента";
        console.error("Ошибка при обновлении shoppingItem: ", e);
      }
    },

    // Сохранение данных в локальное хранилище
    saveToLocalStorage() {
      try {
        // Преобразует текущий список items в JSON строку
        // И сохраняет эту строку в localStorage
        localStorage.setItem(
          "shopping-list",
          JSON.stringify({
            items: this.items,
          })
        );
      } catch (e) {
        this.error = "Ошибка при сохранении данных";
        console.error("Ошибка при сохранении в localStorage:", e);
      }
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

      // Сохраняем изменения в localStorage
      //this.saveToLocalStorage();
    },
  },
});
