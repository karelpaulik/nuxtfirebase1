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
              {{ doc.data.fName }} {{ doc.data.lName }} (Born: {{ doc.data.born }})
              Driv.lic:
              <q-checkbox v-model="doc.data.hasDrivingLic" label="Driv. lic" disable dense />
              {{ doc.data.hobbies }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <p v-else>Žádná data v databázi (nebo žádné výsledky filtru).</p>

      <q-btn @click="filterByPetrN()" label="Filtrovat: fName=Petr, lName začíná na N" />
      <q-btn @click="resetFilterAndLoadAll()" label="Zobrazit vše" />
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
import type { WhereFilterOp } from 'firebase/firestore';

// Importujeme schéma přímo zde v komponentě
import { userApiSchema } from '@/schemas/userSchema';
import type { UserForApi } from '@/schemas/userSchema'; // Typ pro data po validaci

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users';

const {
  documents,
  loading,
  error,
  _handlerProps
} = useCollectionHandlers<UserForApi>(COLLECTION_NAME, {
  validationSchema: userApiSchema // <-- Zde se předává schéma. No schema, nebo undefined = no validation.
});

// Načíst všechny dokumenty při načtení komponenty
onMounted(() => {
  handleReadAllDocs(_handlerProps);
});

//Dále již volitelné

//Jednoduchý filter, kde se filtruje podle jednoho pole
const handleFilterByFName = (name: string) => {
  const filters = [{ field: 'fName', operator: '==', value: name }];
  handleReadFilterDocs(_handlerProps, filters);
};

// Funkce pro aplikování komplexního AND filtru
const filterByPetrN = () => {
    //const filters = [
  const filters: Array<{ field: string; operator: WhereFilterOp; value: any }> = [
    { field: 'fName', operator: '==', value: 'Petr' },
    { field: 'lName', operator: '>=', value: 'N' }, // lName začíná na N nebo více
    { field: 'lName', operator: '<', value: 'O' }   // lName je menší než O (zachytí N, Na, Nb, ... Nz)
  ];
  handleReadFilterDocs(_handlerProps, filters);
};

// Funkce pro resetování filtru a opětovné načtení všech dat
const resetFilterAndLoadAll = () => {
  handleReadAllDocs(_handlerProps);
};
</script>
