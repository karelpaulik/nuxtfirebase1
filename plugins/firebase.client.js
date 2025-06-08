// plugins/firebase.client.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDHwvn6z1b0Hl7lKTCDIa9bRzFNkMKhN0U",
    authDomain: "inspired-berm-460713-t6.firebaseapp.com",
    projectId: "inspired-berm-460713-t6",
    storageBucket: "inspired-berm-460713-t6.firebasestorage.app",
    messagingSenderId: "67985739597",
    appId: "1:67985739597:web:1ffac27c3e99a4de783104",
    measurementId: "G-4LQFHVHMYN"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "firestore-in-fb-pa1");

export default defineNuxtPlugin(() => {
  return {
    provide: {
      firestore: db
    }
  }
})
