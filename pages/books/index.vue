<template>
  <section>   
    <div class="fixed z-top">
      <q-toolbar class="bg-blue-grey text-white shadow-2">
        <q-btn flat stretch no-caps @click="navigateTo(`/${PAGE_NAME}/new`)" label="Nový záznam" />
      </q-toolbar>
    </div>

    <div class="q-pt-xl">
      <h4 class="q-pa-xs q-mt-none q-mb-none">Všechny dokumenty</h4>

      <p v-if="loading">Načítám data...</p>
      <p v-else-if="error?.message">Chyba při načítání dat: {{ error.message }}</p>
      <div v-else-if="documents && documents.length > 0">
        <ul>
          <li v-for="doc in documents" :key="doc.id" class="q-pa-xs">
            <NuxtLink :to="`/${PAGE_NAME}/${doc.id}`">
              {{ doc.data.title }} {{ doc.data.author }} (Created Date: {{ doc.data.createdDate }}) {{ doc.data.currUserRef?.id }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <p v-else>Žádná data v databázi (nebo žádné výsledky filtru).</p>

      

    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'; 
import {
  useCollectionHandlers, 
  handleReadAllDocs,    
  handleReadFilterDocs 
} from '~/composables/useCollectionHandlers'; 
import type { CollectionHandlerProps } from '~/composables/useCollectionHandlers'; 

const COLLECTION_NAME = 'books';
const PAGE_NAME = 'books';

const {
  documents,
  loading,
  error,
  _handlerProps 
} = useCollectionHandlers(COLLECTION_NAME);

// Načíst všechny dokumenty při načtení komponenty
onMounted(() => {
  handleReadAllDocs(_handlerProps);
  console.log(documents);
});


</script>
