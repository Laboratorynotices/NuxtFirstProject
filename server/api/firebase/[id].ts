/**
 * Работа с Firebase через серверную часть по CRUD-интерфейсу.
 * Обработчик для маршрута /api/firebase/[id]
 */
import { DocumentReference, DocumentSnapshot } from "firebase-admin/firestore";
import {
  db,
  COLLECTION_NAME,
  formatDocument,
  createErrorUnknownMethod,
} from "../../utils/firebase";

export default defineEventHandler(async (event) => {
  // Для CRUD важно определить тип запроса.
  // Тип запроса.
  const method: string = event.method;
  // Идентификатор (документа коллекции) элемента покупок
  const id: string | undefined = event.context.params?.id;

  // id - обязательное поле.
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID is required",
    });
  }

  interface DocumentWithRef {
    docRef: DocumentReference;
    doc: DocumentSnapshot;
  }

  /**
   * Получает документ из Firestore по ID и возвращает объект, содержащий ссылку на документ и сам документ
   * @param id - ID документа для получения
   * @returns Promise с объектом, содержащим ссылку на документ (docRef) и сам документ (doc)
   * @throws {Error} Ошибка 404, если документ не найден
   * @throws {Error} Ошибка 500 при проблемах с доступом к Firebase
   */
  const { docRef, doc } = await (async (
    id: string
  ): Promise<DocumentWithRef> => {
    try {
      // Возвращает ссылку на документ
      const docRef: DocumentReference<
        FirebaseFirestore.DocumentData,
        FirebaseFirestore.DocumentData
      > = db.collection(COLLECTION_NAME).doc(id);
      // Возвращает документ
      const doc: DocumentSnapshot<
        FirebaseFirestore.DocumentData,
        FirebaseFirestore.DocumentData
      > = await docRef.get();

      // Если документ не найден, вернуть ошибку
      if (!doc.exists) {
        throw createError({
          statusCode: 404,
          message: `Документ с ID ${id} не найден`,
        });
      }

      // Документ существует, возвращаем объект с ссылкой и документом
      return {
        docRef,
        doc,
      };
    } catch (e) {
      console.error(
        `Ошибка при загрузке документа с ID ${id} из Firebase: `,
        e
      );

      throw createError({
        statusCode: 500,
        message: `Ошибка при загрузке документа с ID ${id} из Firebase`,
      });
    }
  })(id);

  // GET - получить один документ по ID
  // Вызов: const doc = await $fetch('/api/firebase/[id]')
  if (event.method === "GET") {
    return formatDocument(doc);
  }

  // DELETE - удалить документ
  /* Вызов:
    await $fetch('/api/firebase/[id]', {
      method: 'DELETE'
    })
    */
  if (method === "DELETE") {
    try {
      await docRef.delete();
      return { message: "Document deleted successfully" };
    } catch (e) {
      console.error(
        `Ошибка при удалении документа с ID ${id} из Firebase: `,
        e
      );

      throw createError({
        statusCode: 500,
        message: `Ошибка при удалении документа с ID ${id} из Firebase`,
      });
    }
  }

  createErrorUnknownMethod();
});
