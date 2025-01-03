/**
 * Конфигурационная часть для работы с Firebase через серверную часть по CRUD-интерфейсу.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Описание конфигурации Firebase
interface FirebaseConfigInterface {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
  universe_domain?: string;
}

const firebaseConfig = JSON.parse(
  process.env.FIREBASE_CONFIG_ADMIN_CREDENTIALS as string
) as FirebaseConfigInterface;

// Проверяем, не инициализировано ли уже приложение
const apps = getApps();

// Инициализируем Firebase Admin только если еще не инициализирован
const app =
  apps.length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_CONFIG_PROJECT_ID,
          clientEmail: firebaseConfig.client_email,
          privateKey: firebaseConfig.private_key?.replace(/\\n/g, "\n"),
        }),
      })
    : apps[0];

// Получаем доступ к Firestore
export const db = getFirestore(app);
// Название коллекции, с которой будет работать приложение
export const COLLECTION_NAME = "shoppingItems";

/****************************************************/
/* Вспомогательные функции для работы с документами */
/****************************************************/
/**
 * Преобразует Firestore DocumentSnapshot в ShoppingItem.
 *
 * Эта функция переносит ID документа внутрь нового объекта.
 *
 * @param doc - Snapshot документа из Firestore
 * @returns Объект с данными документа и его ID (ShoppingItem)
 *
 * Пример использования:
 * const doc = await firestore.collection('users').doc('123').get();
 * return formatDocument(doc);
 */
export const formatDocument = (doc: FirebaseFirestore.DocumentSnapshot) => ({
  id: doc.id,
  ...doc.data(),
});

/**
 * Функция-предохранитель для обработки некорректных HTTP-методов.
 *
 * Эта функция специально спроектирована так, чтобы никогда не завершаться успешно.
 * Она используется как защитный механизм для перехвата случаев, когда код пытается
 * обработать неподдерживаемый HTTP-метод (например, не GET/POST/PUT и т.д.).
 *
 * @throws {Error} Всегда выбрасывает ошибку 404 с сообщением "Unknown method"
 * @returns {never} Функция никогда не возвращает значение, так как всегда выбрасывает ошибку
 *
 * Пример использования:
 * ```
 * switch (method) {
 *   case 'GET': return handleGet();
 *   case 'POST': return handlePost();
 *   default: return createErrorUnknownMethod();
 * }
 * ```
 */
export const createErrorUnknownMethod = (): never => {
  // Не должно выводиться, ловля ошибок,
  // если скрипт вызывается с неописанным методом.
  throw createError({
    statusCode: 404,
    message: "Unknown method",
  });
};
