/**
 * Работа с Firebase через серверную часть по CRUD-интерфейсу.
 * Обработчик для маршрута /api/firebase
 */
import {
  db,
  COLLECTION_NAME,
  formatDocument,
  createErrorUnknownMethod,
} from "../../utils/firebase";

export default defineEventHandler(async (event) => {
  // Для CRUD важно определить тип запроса.
  // Тип запроса: GET или POST
  const method: string = event.method;

  // GET - получить все документы или один документ по ID
  // Вызов: const docs = await $fetch('/api/firebase')
  if (method === "GET") {
    try {
      const snapshot = await db.collection(COLLECTION_NAME).get();
      return snapshot.docs.map(formatDocument);
    } catch (e) {
      console.error("Ошибка при загрузке из Firebase: ", e);

      throw createError({
        statusCode: 500,
        message: "Ошибка при загрузке из Firebase",
      });
    }
  }

  // @TODO : Добавить обработку POST

  // В даном случае методы PUT и DELETE не поддерживаются.
  createErrorUnknownMethod();
});
