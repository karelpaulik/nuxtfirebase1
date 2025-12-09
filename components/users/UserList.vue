<template>
  <ListLayout
    :loading="loading"
    :error="error"
    :page-name="PAGE_NAME"
  >
    <ul>
      <li v-for="doc in documents" :key="doc.id" class="q-pa-xs">
        <NuxtLink :to="`/${PAGE_NAME}/${doc.id}`">
          {{ doc.fName }} {{ doc.lName }} (Born: {{ doc.born }})
          Driv.lic:
          <q-checkbox v-model="doc.hasDrivingLic" label="Driv. lic" disable dense />
          {{ doc.hobbies }}
          {{ doc.createdDate }}
        </NuxtLink>
      </li>
    </ul>
    <div class="q-pa-lg flex flex-center">
      <q-btn
        @click="handleReadPaginatedDocs(DOCS_PER_PAGE, [], 'fName');"
        :loading="loading"
        :disable="!hasMoreDocs"
        label="Load More"
        color="primary"
      />
    </div>
  </ListLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { useCollectionHandlers } from '~/composables/useCollectionHandlers';

// Layout
import ListLayout from '~/components/_shared/ui/layout/ListLayout.vue';

// To edit----------------------------------------------------------------
import { userApiSchema } from '@/schemas/userSchema';
import type { UserApiType } from '@/schemas/userSchema'; // Typ pro data po validaci

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users';
const API_SCHEMA = userApiSchema;
type ApiType = UserApiType;
const DOCS_PER_PAGE = 5;
// ----------------------------------------------------------------------

const {
  documents,
  loading,
  error,
  hasMoreDocs,
  collectionHandlers: { handleReadPaginatedDocs, handleReadFilterDocs },
} = useCollectionHandlers<ApiType>(COLLECTION_NAME, {
  validationSchema: API_SCHEMA,
});

const loadMore = () => {
  handleReadPaginatedDocs(DOCS_PER_PAGE, [], 'fName');
};

onMounted(() => {
  handleReadPaginatedDocs(DOCS_PER_PAGE, [], 'fName', true);
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
  //handleReadAllDocs();
  handleReadPaginatedDocs(DOCS_PER_PAGE, [], 'fName', true);
};
</script>
