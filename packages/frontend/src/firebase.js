import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCAQ9dz9koiEA5_oGi0Bl9go8H50DW3uU",
  authDomain: "garden-data-dd423.firebaseapp.com",
  projectId: "garden-data-dd423",
  storageBucket: "garden-data-dd423.firebasestorage.app",
  messagingSenderId: "899574886410",
  appId: "1:899574886410:web:034d78147c61316e8aaff3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);