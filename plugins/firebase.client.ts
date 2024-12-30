import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export default defineNuxtPlugin(() => {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_CONFIG_API_KEY,
    authDomain: "listsmartapp2.firebaseapp.com",
    projectId: "listsmartapp2",
    storageBucket: "listsmartapp2.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_CONFIG_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_CONFIG_APP_ID,
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  return {
    provide: {
      firebaseApp: app,
      db: db,
    },
  };
});
