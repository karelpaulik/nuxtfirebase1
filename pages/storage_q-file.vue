<template>
  <section class="q-pa-md row justify-center">
    <div class="col-xs-12 col-sm-10 col-md-8">
      <p class="text-h6">Nahrát soubory na Firebase Storage</p>

      <q-file
        v-model="filesToUpload"
        label="Vyberte soubory"
        multiple
        dense
        outlined
        class="q-mb-md"
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
        <template v-slot:after>
          <q-btn
            round
            dense
            flat
            icon="cloud_upload"
            @click="handleUpload"
            :disable="!filesToUpload.length"
          />
        </template>
      </q-file>

      <div v-if="uploading">
        <q-linear-progress :value="progress / 100" class="q-mt-sm" color="primary" />
        <div class="text-caption text-center q-mt-sm">{{ progress }}%</div>
      </div>

      <q-list v-if="downloadUrls.length" bordered separator class="q-mt-lg">
        <q-item v-for="(item, index) in downloadUrls" :key="index" clickable tag="a" :href="item.url" target="_blank" class="q-py-sm">
          <q-item-section>
            <q-item-label class="text-blue-7">{{ item.name }}</q-item-label>
            <q-item-label caption>
                Unikátní název: {{ item.uniqueName }}
                <br>
                Čas nahrání: {{ new Date(item.fileUpload).toLocaleString() }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="link" color="grey-6" />
          </q-item-section>
        </q-item>
      </q-list>

      <pre v-if="downloadUrls.length">{{ downloadUrls }}</pre>

      <q-banner v-if="error" class="bg-red-2 text-red-10 q-mt-md">
        <q-icon name="error" /> {{ error }}
      </q-banner>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { initializeApp } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

const filesToUpload = ref([]);
const progress = ref(0);
const uploading = ref(false);
const downloadUrls = ref([]);
const error = ref('');

const handleUpload = async () => {
  if (!filesToUpload.value.length) {
    error.value = 'Prosím, vyberte soubory k nahrání.';
    return;
  }
  
  uploading.value = true;
  progress.value = 0;
  downloadUrls.value = [];
  error.value = '';

  const files = [...filesToUpload.value]; // Vytvoření kopie pole
  filesToUpload.value = []; // Vymazání původního pole, aby se vyčistil q-file

  for (const file of files) {
    try {
      const fileExtension = file.name.split('.').pop();// Získání přípony souboru
      const uniqueId = crypto.randomUUID();// Generování unikátního UUID
      const uniqueName = `${uniqueId}.${fileExtension}`;// Vytvoření unikátního názvu souboru

      const fileRef = storageRef(storage, `uploads/${uniqueName}`);// Změna referenční cesty v úložišti pro použití unikátního názvu
      const uploadTask = uploadBytesResumable(fileRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progress.value = Math.round(currentProgress);
            console.log("progress", progress.value)
            console.log("File: ", file.name);
            console.log("File: ", file);
          },
          (uploadError) => {
            console.error("Upload failed", uploadError);
            error.value = `Nahrání souboru ${file.name} selhalo: ${uploadError.message}`;
            reject(uploadError);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`Soubor ${file.name} je dostupný na: ${url}`);
            downloadUrls.value.push({ origName: file.name, uniqueName: uniqueName, url: url, size: file.size, fileUpload: Date.now() });
            resolve();
          }
        );
      });
    } catch (e) {
      console.error("Unexpected error during upload", e);
      error.value = `Došlo k neočekávané chybě během nahrávání: ${e.message}`;
    }
  }

  uploading.value = false;
};
</script>
