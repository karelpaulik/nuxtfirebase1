<template>
  <section>
    <div class="form-fields">
      fName<input v-model="formData.fName" placeholder="fName" @input="setHasChanges">
      lName<input v-model="formData.lName" placeholder="lName" @input="setHasChanges">
      born<input v-model="formData.born" placeholder="Born" @input="setHasChanges">
    </div>

    <div v-if="hasChanges" class="changes-row">
      <p class="changes-indicator">
        ⚠️ Data byla změněna! Nezapomeňte uložit.
      </p>
      <button @click="handleRevertChanges" class="revert-button">
        Vrátit změny dokumentu
      </button>
    </div>

    <button @click="handleAddDoc">Vytvořit nový dokument</button>
    <button @click="handleUpdateDoc">Upravit dokument</button>
    <button @click="handleDelDoc">Smaž dokument</button>
    <pre>{{formData}}</pre>
    <p v-if="formId">Aktuální ID dokumentu: {{ formId }}</p>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router' //kontrola před odejitím z routy bez uložení

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'user';

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
const hasChanges = ref(false);

const setHasChanges = () => {
  hasChanges.value = true;
};

onBeforeRouteLeave((to, from, next) => {
  if (hasChanges.value) {
    const confirmLeave = confirm(
      'Máte neuložené změny. Opravdu chcete odejít bez uložení?'
    );
    if (confirmLeave) {
      // DŮLEŽITÉ: Reset hasChanges, pokud uživatel potvrdí odchod bez uložení
      hasChanges.value = false;
      next(); // Pokračovat v navigaci
    } else {
      next(false); // Zrušit navigaci
    }
  } else {
    next(); // Nejsou žádné změny, navigace může proběhnout normálně
  }
});

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


async function handleRevertChanges() { // Přidáno 'async' pro konzistenci, i když zde není await nutný
  if (!formId.value) {
    console.warn('Nelze vrátit změny: Není načten žádný dokument.');
    return;
  }
  if (confirm('Opravdu chcete vrátit všechny neuložené změny?')) {
    // Jednoduše znovu načteme dokument z databáze
    await handleReadDoc(formId.value); // Použijeme await, protože handleReadDoc je async
    hasChanges.value=false;
    console.log("Změny byly vráceny opětovným načtením dokumentu.");
  }
}

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
  if (!confirm(`Opravdu chcete vytvořit nový dokument?`)) {  //Kontrola potvrzení mazání uživatelem
    console.log("Nevytvářím");
    return;
  }
  try {
    const docId = await useAddColl(COLLECTION_NAME, formData.value);
    if (docId) {
      hasChanges.value = false;
      await navigateTo(`/${PAGE_NAME}/${docId}`);
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
  if (!confirm(`Opravdu chcete updatovat data s ID: ${formId.value}?`)) {  //Kontrola potvrzení mazání uživatelem
    console.log("Neupravuji");
    return;
  }
  try {
    const success = await useUpdateDoc(COLLECTION_NAME, formId.value, formData.value);
    if (success) {
      console.log(`Dokument s ID '${formId.value}' byl úspěšně aktualizován!`);
      hasChanges.value=false;
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
  if (!confirm(`Opravdu chcete smazat data s ID: ${formId.value}?`)) {  //Kontrola potvrzení mazání uživatelem
    console.log("nemažu");
    return;
  }
  try {
    const success = await useDelDoc(COLLECTION_NAME, formId.value); // Použijeme aktuální formId.value
    if (success) {
      console.log(`Dokument s ID '${formId.value}' byl úspěšně smazán!`);
      // Po smazání je důležité resetovat stav formuláře
      formData.value = createEmptyformData();
      formId.value = null;
      hasChanges.value = false;
      await navigateTo(`/${PAGE_NAME}`);
    } else {
        console.log('Dokument nebyl smazán (neznámý důvod).');
    }
  } catch (e) {
    console.error('Došlo k chybě při mazání dokumentu:', e);
    alert('Nastala chyba při mazání dokumentu.');
  }
}

</script>

<style scoped>
.form-fields {
  display: flex;             
  flex-direction: column; 
  gap: 15px;
  margin-bottom: 20px; 
}


.form-fields input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
  box-sizing: border-box;
}

/* Upravená třída pro kontejner upozornění a tlačítka */
.changes-row {
  display: flex; /* Použijeme flexbox */
  align-items: center; /* Zarovnáme položky vertikálně na střed */
  /* justify-content: space-between; je odstraněno */
  margin-top: 10px;
  margin-bottom: 15px;
  /* width: 100%; je odstraněno, aby se kontejner neroztahoval přes celou šířku */
}

.changes-indicator {
  color: red;
  font-weight: bold;
  margin: 0;
  padding-right: 15px; /* Přidáme trochu mezery mezi textem a tlačítkem */
  white-space: nowrap; /* Zabrání zalomení textu, aby se tlačítko udrželo na stejném řádku */
}

.revert-button {
  background-color: #f0ad4e;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 0;
}

.revert-button:hover {
  background-color: #ec971f;
}

</style>