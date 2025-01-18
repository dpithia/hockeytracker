// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyArVUjD-_piU-eftze3VNSJMuCkkLXW10M",
  authDomain: "hockey-league-app-f35be.firebaseapp.com",
  projectId: "hockey-league-app-f35be",
  storageBucket: "hockey-league-app-f35be.firebasestorage.app",
  messagingSenderId: "754052742196",
  appId: "1:754052742196:web:ce89315c5be04fb9561e61",
  measurementId: "G-GYVSYGDB0S",
  databaseURL: "https://hockey-league-app-f35be-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);
