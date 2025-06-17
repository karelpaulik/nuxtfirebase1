<template>
  <section>
    <button @click="navigateTo(`/${PAGE_NAME}/new`)" class="new-user-button">Nový záznam</button>

    <h2>Všechny dokumenty</h2>
    <p v-if="loading">Načítám data...</p>
    <p v-else-if="error">Chyba při načítání dat: {{ error.message }}</p>
    <div v-else-if="documents.length > 0">
      <ul>
        <li v-for="doc in documents" :key="doc.id" class="doc-item">
          <NuxtLink :to="`/${PAGE_NAME}/${doc.id}`">
            {{ doc.data.fName }} {{ doc.data.lName }} (Born: {{ doc.data.born }})
          </NuxtLink>
        </li>
      </ul>
    </div>
    <p v-else>Žádná data v databázi.</p>

  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users';

const documents = ref([]); //template: doc.data.atribut, doc.id
const loading = ref(true);
const error = ref(null);

// Funkce pro načtení všech uživatelů
async function handleReadAllDocs() {
  loading.value = true;
  error.value = null;
  try {
    documents.value = await useGetAllDocs(COLLECTION_NAME); //return: array.
  } catch (e) {
    error.value = e;
    console.error("Chyba při načítání všech uživatelů:", e);
  } finally {
    loading.value = false;
  }
}

// Načíst uživatele při naložení komponenty
onMounted(() => {
  handleReadAllDocs();
});
</script>


<style scoped>
.doc-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-user-button {
  margin-top: 20px; /* Přidá trochu mezery nad tlačítkem */
  padding: 5px 15px;
  background-color: #28a745; /* Příklad zelené barvy */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.new-user-button:hover {
  background-color: #218838;
}

</style>