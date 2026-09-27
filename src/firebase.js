import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyDmt4yIj6s-1Br9J4LIb0zt-FgpbnLzEdE",
  authDomain: "knockd-86eb4.firebaseapp.com",
  projectId: "knockd-86eb4",
  storageBucket: "knockd-86eb4.firebasestorage.app",
  messagingSenderId: "670393014705",
  appId: "1:670393014705:web:0a6df04f2eeeebb7850590"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
