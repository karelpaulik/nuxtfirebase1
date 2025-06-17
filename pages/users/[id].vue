<template>
  <section>
    <h2>{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h2>
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

    <div v-if="formId === 'new'" class="btn-field">
      <button @click="handleAddDoc">Vytvořit nový dokument</button>
    </div>
    
    <div v-else class="btn-field">
      <button @click="handleAddDoc">Vytvořit nový dokument ze stávajícího.</button>
      <button @click="handleUpdateDoc">Upravit dokument</button>
      <button @click="handleDelDoc">Smaž dokument</button>
    </div>

    <pre>{{formData}}</pre>
    <p v-if="formId && formId !== 'new'">Aktuální ID dokumentu: {{ formId }}</p>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users'; // Název složky pro navigaci

const createEmptyformData = () => {
  return {
    fName: '',
    lName: '',
    born: ''
  };
};

const route = useRoute();
const formId = ref(null); // Bude držet ID dokumentu nebo 'new'
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
      hasChanges.value = false;
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

watch(() => route.params.id, async (newIdParam) => {
  if (newIdParam === 'new') {
    // Pokud je ID 'new', připravujeme se na vytvoření nového dokumentu
    console.log('Routa je /users/new, inicializuji formulář pro nového uživatele.');
    formId.value = 'new';
    formData.value = createEmptyformData();
    hasChanges.value = false; // Nově inicializovaný formulář nemá změny
  } else if (newIdParam) {
    // Pokud je ID platné (nějaká hodnota kromě 'new'), snažíme se načíst existující dokument
    console.log(`ID v URL se změnilo na '${newIdParam}', načítám uživatele.`);
    formId.value = newIdParam;
    await handleReadDoc(newIdParam); // Použijeme await, abychom zajistili načtení před dalším renderováním
  } else {
    // Toto by se nemělo stát s routou [id].vue, ale pro jistotu
    console.warn('Neočekávaný stav: ID v URL chybí.');
    formId.value = null;
    formData.value = createEmptyformData();
    hasChanges.value = false;
  }
}, { immediate: true }); // immediate: true zajistí spuštění hned po naložení komponenty

async function handleRevertChanges() {
  if (!formId.value) {
    console.warn('Nelze vrátit změny: Není načten žádný dokument ani nový formulář.');
    return;
  }
  if (confirm('Opravdu chcete vrátit všechny neuložené změny?')) {
    if (formId.value === 'new') {
      // Pro 'new' formulář jednoduše resetujeme
      formData.value = createEmptyformData();
      hasChanges.value = false;
      console.log("Formulář pro nového uživatele byl resetován.");
    } else {
      // Pro existující dokument znovu načteme data
      await handleReadDoc(formId.value);
      hasChanges.value = false;
      console.log("Změny byly vráceny opětovným načtením dokumentu.");
    }
  }
}

async function handleReadDoc(idToRead) {
  try {
    const doc = await useReadDoc(COLLECTION_NAME, idToRead);
    if (doc) {
      formData.value = doc.data;
      formId.value = doc.id;
      hasChanges.value = false; // Po načtení nejsou žádné změny
    } else {
      // Dokument nebyl nalezen, přesměrujeme na 'new' nebo na seznam
      console.log(`Dokument s ID '${idToRead}' nebyl nalezen.`);
      alert(`Uživatel s ID '${idToRead}' nebyl nalezen. Budete přesměrováni na vytvoření nového uživatele.`);
      await navigateTo(`/${PAGE_NAME}/new`); // Přesměrování na /users/new
    }
  } catch (e) {
    console.error("Chyba při čtení dokumentu:", e);
    alert("Nastala chyba při načítání dokumentu. Budete přesměrováni na vytvoření nového uživatele.");
    await navigateTo(`/${PAGE_NAME}/new`); // Přesměrování na /users/new v případě chyby
  }
}

async function handleAddDoc() {
  // if (formId.value !== 'new') {
  //   console.warn('Nelze vytvořit dokument: Současný režim není "nový".');
  //   return;
  // }
  if (!confirm(`Opravdu chcete vytvořit nový dokument?`)) {
    console.log("Nevytvářím");
    return;
  }
  try {
    const docId = await useAddColl(COLLECTION_NAME, formData.value);
    if (docId) {
      hasChanges.value = false;
      await navigateTo(`/${PAGE_NAME}/${docId}`); // Po vytvoření přesměrujeme na detail nově vytvořeného dokumentu
      console.log(`Vytvořen dokument s ID: ${docId}`);
    }
  } catch (e) {
    console.error("Chyba při ukládání z komponenty:", e);
  }
}

async function handleUpdateDoc() {
  if (!formId.value || formId.value === 'new') {
    console.warn('Nelze aktualizovat: Žádné platné ID dokumentu k úpravě.');
    return;
  }
  if (!confirm(`Opravdu chcete updatovat data s ID: ${formId.value}?`)) {
    console.log("Neupravuji");
    return;
  }
  try {
    const success = await useUpdateDoc(COLLECTION_NAME, formId.value, formData.value);
    if (success) {
      console.log(`Dokument s ID '${formId.value}' byl úspěšně aktualizován!`);
      hasChanges.value = false;
    } else {
      console.log('Dokument nebyl aktualizován (neznámý důvod).');
    }
  } catch (e) {
    console.error('Došlo k chybě při aktualizaci dokumentu:', e);
  }
}

async function handleDelDoc() {
  if (!formId.value || formId.value === 'new') {
    console.warn('Žádné platné ID dokumentu k smazání.');
    return;
  }
  if (!confirm(`Opravdu chcete smazat data s ID: ${formId.value}?`)) {
    console.log("nemažu");
    return;
  }
  try {
    const success = await useDelDoc(COLLECTION_NAME, formId.value);
    if (success) {
      console.log(`Dokument s ID '${formId.value}' byl úspěšně smazán!`);
      // Po smazání je důležité přesměrovat na /users/new nebo na seznam
      formData.value = createEmptyformData(); // Resetujeme formulář
      formId.value = 'new'; // Nastavíme režim na 'new'
      hasChanges.value = false;
      await navigateTo(`/${PAGE_NAME}`); // Přesměrování na /users/new
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

.changes-row {
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 15px;
}

.changes-indicator {
  color: red;
  font-weight: bold;
  margin: 0;
  padding-right: 15px;
  white-space: nowrap;
}

.btn-field button {
  background-color: #3bb557;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 2px;
}

.btn-field button:hover {
  background-color: #079722;
}

.revert-button {
  background-color: #f0ad4e;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 2px;
}

.revert-button:hover {
  background-color: #ec971f;
}
</style>