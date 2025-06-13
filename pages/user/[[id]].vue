<template>
  <section>
    <div>Práce s firestore za použítí pluginu.</div>
    <div v-if="formData">
      fName<input v-model="formData.fName" placeholder="fName">
      lName<input v-model="formData.lName" placeholder="lName">
      born<input v-model="formData.born" placeholder="Born">
    </div>
    <button @click="handleAddDoc">Vytvořit dokument</button>
    <button @click="handleUpdateDoc">Upravit dokument</button>
    <button @click="handleDelDoc">Smaž dokument</button>
    <pre>{{formData}}</pre>
    <p v-if="formId">Aktuální ID dokumentu: {{ formId }}</p>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const COLLECTION_NAME = 'users';

const createEmptyformData = () => {
  return {
    fName: '',
    lName: '',
    born: ''
  };
};

const route = useRoute();
const formId=ref(null);
const formData = ref(createEmptyformData());

watch(() => route.params.id, (newId) => {
  if (newId) {
    console.log('ID v URL se změnilo, načítám uživatele:', newId);
    formId.value=newId;
    handleReadDoc(newId);
  } else {  // Pokud je ID v URL undefined (např. jsme na /user bez parametru)
    console.log('ID v URL není přítomno, resetuji formulář.');
	  formData.value = createEmptyformData();
    formId.value = null;
  }
}, { immediate: true }); // immediate: true zajistí spuštění hned po naložení komponenty

async function handleReadDoc(idToRead) {
  try {
    const doc = await useReadDoc(COLLECTION_NAME, idToRead);
    if (doc) {
      formData.value=doc.data; //console.log("handleReadDoc:", doc.data);
	  formId.value = doc.id;
    } else {
    // --- KLÍČOVÁ ZMĚNA ZDE: Explicitní reset, pokud dokument nebyl nalezen ---
    console.log(`Dokument s ID '${idToRead}' nebyl nalezen.`);
    formData.value = createEmptyformData();
    formId.value = null;
    }
  } catch (e) {
    console.error("Chyba při čtení dokumentu:", e);
	  formData.value = createEmptyformData();
    formId.value = null;
  }
}

async function handleAddDoc() {
  try {
    const docId = await useAddColl(COLLECTION_NAME, formData.value);
    if (docId) {
      await navigateTo('/user/' + docId)
      console.log(`Vytvořen dokument s ID: ${docId}`);
    }
  } catch (e) {
    console.error("Chyba při ukládání z komponenty:", e);
  }
}

async function handleUpdateDoc() {
  if (!formId.value) {
    console.warn('Nelze aktualizovat: Žádné ID dokumentu k úpravě. Vytvořte nový nebo načtěte existující.');
    return;
  }
  try {
    const success = await useUpdateDoc(COLLECTION_NAME, formId.value, formData.value);
    if (success) {
      console.log(`Dokument s ID '${formId.value}' byl úspěšně aktualizován!`);
      //handleReadDoc(formId.value)  Není třeba, formulář je aktuální.
    } else {
      console.log('Dokument nebyl aktualizován (neznámý důvod).');
    }
  } catch (e) {
    console.error('Došlo k chybě při aktualizaci dokumentu:', e);
  }
}

async function handleDelDoc() {
  if (!formId.value) { // Zkontrolujeme, zda vůbec nějaké ID máme
    console.warn('Žádné ID dokumentu k smazání.');
    return; // Pokud ID chybí, nic neděláme
  }
  try {
    const success = await useDelDoc(COLLECTION_NAME, formId.value); // Použijeme aktuální formId.value
    if (success) {
      console.log(`Dokument s ID '${formId.value}' byl úspěšně smazán!`);
      // Po smazání je důležité resetovat stav formuláře
      formData.value = createEmptyformData();
      formId.value = null;
    } else {
        console.log('Dokument nebyl smazán (neznámý důvod).');
    }
  } catch (e) {
    console.error('Došlo k chybě při mazání dokumentu:', e);
  }
}

</script>
