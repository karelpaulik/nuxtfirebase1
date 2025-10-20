<template>
  <ListLayout
    :loading="loading"
    :error="error"
    :page-name="PAGE_NAME"
  >
    <ul>
      <li v-for="doc in documents" :key="doc.id" class="q-pa-xs">
        <NuxtLink :to="`/${PAGE_NAME}/${doc.id}`">
          {{ doc.data.title }} {{ doc.data.author }} (Created Date: {{ doc.data.createdDate }}) {{ doc.data.currUserRef?.id }}
        </NuxtLink>
      </li>
    </ul>
  </ListLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { useCollectionHandlers } from '~/composables/useCollectionHandlers';

// Layout
import ListLayout from '~/components/_shared/layout/ListLayout.vue';

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