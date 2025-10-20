<template>
  <ListLayout
    :loading="loading"
    :error="error"
    :page-name="PAGE_NAME"
  >
    <ul>
      <li v-for="doc in documents" :key="doc.id" class="q-pa-xs">
        <NuxtLink :to="`/${PAGE_NAME}/${doc.id}`">
          {{ doc.data.fName }} {{ doc.data.lName }} (Born: {{ doc.data.born }})
          Driv.lic:
          <q-checkbox v-model="doc.data.hasDrivingLic" label="Driv. lic" disable dense />
          {{ doc.data.hobbies }}
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
import { userApiSchema } from '@/schemas/userSchema';
import type { UserApiType } from '@/schemas/userSchema'; // Typ pro data po validaci

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users';
const API_SCHEMA = userApiSchema;
type ApiType = UserApiType;
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

// Dále již volitelné --------------------------------------------------------

//Jednoduchý filter, kde se filtruje podle jednoho pole
const handleFilterByFName = (name: string) => {
  const filters = [{ field: 'fName', operator: '==', value: name }];
  handleReadFilterDocs(filters);
};

// Funkce pro aplikování komplexního AND filtru
const filterByPetrN = () => {
    const filters = [ // Typová anotace WhereFilterOp je nyní zbytečná
        { field: 'fName', operator: '==', value: 'Petr' },
        { field: 'lName', operator: '>=', value: 'N' },
        { field: 'lName', operator: '<', value: 'O' }
    ];
    handleReadFilterDocs(filters);
};

// Funkce pro resetování filtru a opětovné načtení všech dat
const resetFilterAndLoadAll = () => {
  handleReadAllDocs();
};
</script>
