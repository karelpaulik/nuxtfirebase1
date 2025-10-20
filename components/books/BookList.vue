<template>
  <section>
    <ListToolbar :page-name="PAGE_NAME" />

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

import { useCollectionHandlers } from '~/composables/useCollectionHandlers';
import ListToolbar from '@/components/_shared/nav/ListToolbar.vue';

// To edit----------------------------------------------------------------
import { bookApiSchema } from '@/schemas/bookSchema';
import type { BookApiType } from '@/schemas/bookSchema'; // Typ pro data po validaci

const COLLECTION_NAME = 'books';
const PAGE_NAME = 'books';
const API_SCHEMA = bookApiSchema;
type ApiType = BookApiType;
// ----------------------------------------------------------------------

const {
  documents,
  loading,
  error,
  collectionHandlers: { handleReadAllDocs, handleReadFilterDocs },
} = useCollectionHandlers<ApiType>(COLLECTION_NAME, {
  validationSchema: API_SCHEMA // <-- Zde se předává schéma. No schema, nebo undefined = no validation.
});

// Načíst všechny dokumenty při načtení komponenty
onMounted(() => {
  handleReadAllDocs();
});
</script>