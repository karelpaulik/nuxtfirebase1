<template>
  <section>
    <p>This page will be displayed at the /about route.</p>
  </section>
</template>

<script setup>
// npm install firebase

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';

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

//čtení dat
async function readDoc(coll, idDocum) {
  const docRef = doc(db, coll, idDocum); // Specifický dokument
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document ref.:", docRef);
    console.log("Document data:", docSnap.data());
  } else {
    console.log("No such document!");
  }
}




readDoc("users", "25FtIyKObF2YuY2Fhene");

</script>