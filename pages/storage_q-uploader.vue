<template>
  <section>
    <p>Srovnání nahrávání souborů na Firebase storage: q-uploader vs. q-file. Q-file je lepší.</p>

    <q-uploader
      :factory="uploadFile"
      label="Vyber soubor"
      accept="*/*"
    />
    <q-linear-progress
      :value="progress / 100"
      color="primary"
      size="lg"
      class="q-mt-md"
      rounded
    />
    <div class="text-center">{{ progress.toFixed(2) }}%</div>

  </section>
</template>

<script setup>
// npm install firebase
import { ref as ref } from 'vue';
const progress = ref(0);

console.log("start scriptu");

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref as refStorage, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);


//------------------------------

// QUploader potřebuje "factory" funkci, která provede upload
function uploadFile(files) {
  return new Promise((resolve, reject) => {
    const file = files[0]
    const fileRef = refStorage(storage, 'uploads/' + file.name)
    const uploadTask = uploadBytesResumable(fileRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        progress.value=(snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log(`Nahráno: ${progress.value}`)
      },
      (error) => {
        console.error('Chyba při uploadu:', error)
        reject(error)
      },
      async () => {
        console.log('Upload dokončen!')
        const downloadURL = await getDownloadURL(fileRef)
        console.log(downloadURL);
        resolve({ url: downloadURL }) // Zde je nějaký problém. Pokud nahrávám větší soubor, tak zde běží progress znovu. Nechápu proč.
      }
    )
  })
}

</script>