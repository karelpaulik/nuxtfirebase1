// plugins/firebase.client.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
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
