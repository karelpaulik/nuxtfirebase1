// plugins/firebase.client.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "",
//   authDomain: "",
//   projectId: "",
//   storageBucket: "",
//   messagingSenderId: "",
//   appId: "",
//   measurementId: ""
// };

import { firebaseConfig } from '~/firebase.config'; // Příklad, pokud je v kořeni projektu

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "firestore-in-fb-pa1");
const storage = getStorage(app);
const auth = getAuth(app);

export default defineNuxtPlugin(() => {
  return {
    provide: {
      firestore: db,
      fireStorage: storage,
      fireAuth: auth,
    }
  }
})

