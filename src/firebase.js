import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Эту конфигурацию нужно скопировать из консоли Firebase (Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyC8olbN8irQWQoQvJ7lxaCbrMy_75GpIVI",
  authDomain: "p-key-7xg5wbywu8c2.firebaseapp.com",
  projectId: "p-key-7xg5wbywu8c2",
  storageBucket: "p-key-7xg5wbywu8c2.firebasestorage.app",
  messagingSenderId: "618606278600",
  appId: "1:618606278600:web:73275fe0fa46fa06b432fd"
};

// Инициализация
const app = initializeApp(firebaseConfig);

// Экспорт сервисов для использования в компонентах
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;