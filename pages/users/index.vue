<template>
  <section>
    <button @click="navigateTo(`/${PAGE_NAME}/new`)" class="new-user-button">Nový záznam</button>

    <h4 class="q-pa-xs q-mt-md q-mb-xs">Všechny dokumenty</h4>
    <p v-if="loading">Načítám data...</p>
    <p v-else-if="error?.message">Chyba při načítání dat: {{ error.message }}</p>
    <div v-else-if="documents && documents.length > 0">
      <ul>
        <li v-for="doc in documents" :key="doc.id" class="doc-item">
          <NuxtLink :to="`/${PAGE_NAME}/${doc.id}`">
            {{ doc.data.fName }} {{ doc.data.lName }} (Born: {{ doc.data.born }}) 
            Driv.lic: 
            <input type="checkbox" :checked="doc.data.hasDrivingLic" disabled />
            {{ doc.data.hobbies }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <p v-else>Žádná data v databázi (nebo žádné výsledky filtru).</p>
    
    <button @click="filterByPetrN()" class="filter-button">Filtrovat: fName=Petr, lName začíná na N</button>
    <button @click="resetFilterAndLoadAll()" class="filter-button">Zobrazit vše</button>
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

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users';

const {
  documents,
  loading,
  error,
  _handlerProps 
} = useCollectionHandlers(COLLECTION_NAME);

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

<style scoped>
.doc-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-user-button {
  margin-top: 20px; 
  padding: 5px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px; 
}

.new-user-button:hover {
  background-color: #218838;
}

.filter-button {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 5px;
}

.filter-button:hover {
  background-color: #0056b3;
}
</style>