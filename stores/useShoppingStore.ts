import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

// Определяем интерфейс для отдельного элемента списка покупок
interface ShoppingItem {
  id: string
  name: string
  quantity: number
  completed: boolean
  createdAt: Date
  category?: string
  notes?: string
}

// Определяем интерфейс для состояния хранилища
interface ShoppingState {
  items: ShoppingItem[]
  categories: string[]
  isLoading: boolean
  error: string | null
}

// Создаём store с использованием Composition API стиля
export const useShoppingStore = defineStore('shopping', {
  // Начальное состояние
  state: (): ShoppingState => ({
    items: [],
    categories: ['Продукты', 'Бытовая химия', 'Другое'],
    isLoading: false,
    error: null
  }),

  // Геттеры - вычисляемые свойства store
  getters: {
    // @TODO Получаем количество элементов в списке
    
    // @TODO Получаем только невыполненные элементы

    // Получаем элементы по категории
    getItemsByCategory: (state) => {
      return (category: string) => state.items.filter(item => item.category === category)
    }

    // @TODO Проверяем, есть ли незавершённые элементы
  },

  // Actions - методы для изменения состояния
  actions: {
    // @TODO Добавление нового элемента в список
    addItem(item: Omit<ShoppingItem, 'id' | 'createdAt'>) {
      // @TODO проверить есть ли элемент с таким именем
      const newItem: ShoppingItem = {
        id: uuidv4(), // Генерируем уникальный ID
        createdAt: new Date(),
        ...item
      }
      this.items.push(newItem)

      // @TODO Сохраняем в локальное хранилище
      //this.saveToLocalStorage()
    }

    // @TODO Удаление элемента из списка

    // @TODO Обновление существующего элемента

    // @TODO Переключение статуса выполнения

    // @TODO Добавление новой категории

    // @TODO Загрузка данных из локального хранилища

    // @TODO saveToLocalStorage() Сохранение данных в локальное хранилище

    // @TODO Очистка списка
  }
})