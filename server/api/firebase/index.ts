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

  // POST - создать новый документ
  /* Вызов:
    const newDoc = await $fetch('/api/firebase', {
      method: 'POST',
      body: {
        ShoppingItem
      }
    })
    */
  if (event.method === "POST") {
    try {
      const item = await readBody(event);

      const docRef = await db.collection(COLLECTION_NAME).add({
        ...item,
        createdAt: new Date(),
      });

      const newDoc = await docRef.get();
      console.log(formatDocument(newDoc));
      return formatDocument(newDoc);
    } catch (e) {
      console.error("Ошибка при добавлении элемента: ", e);

      throw createError({
        statusCode: 500,
        message: "Ошибка при добавлении элемента",
      });
    }
  }

  // В даном случае методы PUT и DELETE не поддерживаются.
  createErrorUnknownMethod();
});
