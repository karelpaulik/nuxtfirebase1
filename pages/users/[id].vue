<template>
  <section>
    <h2>{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h2>
    <div class="form-fields">
      fName<input v-model="formData.fName" placeholder="fName" @input="setHasChanges">
      lName<input v-model="formData.lName" placeholder="lName" @input="setHasChanges">
      born<input v-model="formData.born" placeholder="Born" @input="setHasChanges">

      <div>
        <label for="hasDrivingLic">Řidičský průkaz</label>
        <input type="checkbox" id="hasDrivingLic" v-model="formData.hasDrivingLic" @change="setHasChanges"/>
      </div>

      <div class="hobbies-group">
        <label>Zájmy:</label>
        <div class="hobbies-options">
          <input type="checkbox" id="hobbyFootball" value="fotbal" v-model="formData.hobbies" @change="setHasChanges" />
          <label for="hobbyFootball">Fotbal</label>

          <input type="checkbox" id="hobbyHockey" value="hokej" v-model="formData.hobbies" @change="setHasChanges" />
          <label for="hobbyHockey">Hokej</label>

          <input type="checkbox" id="hobbyCycling" value="cyklistika" v-model="formData.hobbies" @change="setHasChanges" />
          <label for="hobbyCycling">Cyklistika</label>
        </div>
      </div>

      <div>
        <div>Picked: {{ formData.picked }}</div>

        <input type="radio" id="one" value="One" v-model="formData.picked" @change="setHasChanges" />
        <label for="one">One</label>

        <input type="radio" id="two" value="Two" v-model="formData.picked" @change="setHasChanges" />
        <label for="two">Two</label>
      </div>
    </div>

    <div v-if="hasChanges" class="changes-row">
      <button @click="handleRevertChanges" class="update-document-btn">Vrátit změny dokumentu</button>
      <button @click="handleUpdateDoc" class="update-document-btn">Uložit změny dokumentu</button>
    </div>

    <div v-if="formId === 'new'" class="btn-field">
      <button @click="handleAddDoc">Vytvořit nový dokument</button>
    </div>
    
    <div v-else class="btn-field">
      <button @click="handleAddDoc">Vytvořit nový dokument ze stávajícího.</button>
      <button @click="handleDelDoc">Smazat dokument</button>
    </div>

    <pre>{{formData}}</pre>
    <p v-if="formId && formId !== 'new'">Aktuální ID dokumentu: {{ formId }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'; // Added useRouter for navigateTo

// Assuming these are custom composables and you'll need to define their types if they're not already
// For demonstration, I'm assuming they return Promise<any> or specific types if known.
// declare function useReadDoc(collection: string, id: string): Promise<{ id: string; data: FormData } | null>;
// declare function useAddColl(collection: string, data: FormData): Promise<string | null>;
// declare function useUpdateDoc(collection: string, id: string, data: FormData): Promise<boolean>;
// declare function useDelDoc(collection: string, id: string): Promise<boolean>;

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users';

/**
 * Interface defining the structure of the form data.
 */
interface FormData {
  fName: string;
  lName: string;
  born: string;
  hasDrivingLic: boolean;
  hobbies: string[];
  picked: string;
}

const createEmptyFormData = (): FormData => {
  return {
    fName: '',
    lName: '',
    born: '',
    hasDrivingLic: false,
    hobbies: [],
    picked: ''
  };
};

const route = useRoute();
const router = useRouter(); // Initialize useRouter for navigateTo
const formId = ref<string | null>(null); // Explicitly define type as string or null
const formData = ref<FormData>(createEmptyFormData()); // Explicitly define type as FormData
const hasChanges = ref<boolean>(false); // Explicitly define type as boolean

const setHasChanges = (): void => {
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
  const id = newIdParam as string; // Cast newIdParam to string for comparison and function calls

  if (id === 'new') {
    console.log('Routa je /users/new, inicializuji formulář pro nového uživatele.');
    formId.value = 'new';
    formData.value = createEmptyFormData();
    hasChanges.value = false;
  } else if (id) {
    console.log(`ID v URL se změnilo na '${id}', načítám uživatele.`);
    formId.value = id;
    await handleReadDoc(id);
  } else {
    console.warn('Neočekávaný stav: ID v URL chybí.');
    formId.value = null;
    formData.value = createEmptyFormData();
    hasChanges.value = false;
  }
}, { immediate: true });

async function handleRevertChanges(): Promise<void> {
  if (!formId.value) {
    console.warn('Nelze vrátit změny: Není načten žádný dokument ani nový formulář.');
    return;
  }
  if (confirm('Opravdu chcete vrátit všechny neuložené změny?')) {
    if (formId.value === 'new') {
      formData.value = createEmptyFormData();
      hasChanges.value = false;
      console.log('Formulář pro nového uživatele byl resetován.');
    } else {
      await handleReadDoc(formId.value);
      hasChanges.value = false;
      console.log('Změny byly vráceny opětovným načtením dokumentu.');
    }
  }
}

async function handleReadDoc(idToRead: string): Promise<void> {
  try {
    const doc = await useReadDoc(COLLECTION_NAME, idToRead);
    if (doc) {
      //-----------------------------------------------------------------------------------------
      const rawData = doc.data;
      // Zajisti, že hobbies je vždy pole
      const normalizedData = {
        ...createEmptyFormData(), // zajistí všechny požadované atributy
        ...rawData, // přepíše výchozí hodnoty těmi z DB
        hobbies: Array.isArray(rawData.hobbies) ? rawData.hobbies : [], // oprava jen pro hobbies
      };
      formData.value = normalizedData;
      //------------------------------------------------------------------------------------------


      //formData.value = doc.data;
      formId.value = doc.id;
      hasChanges.value = false;
    } else {
      console.log(`Dokument s ID '${idToRead}' nebyl nalezen.`);
      alert(`Uživatel s ID '${idToRead}' nebyl nalezen. Budete přesměrováni na vytvoření nového uživatele.`);
      await router.push(`/${PAGE_NAME}/new`); // Using router.push for navigation
    }
  } catch (e) {
    console.error('Chyba při čtení dokumentu:', e);
    alert('Nastala chyba při načítání dokumentu. Budete přesměrováni na vytvoření nového uživatele.');
    await router.push(`/${PAGE_NAME}/new`); // Using router.push for navigation
  }
}

async function handleAddDoc(): Promise<void> {
  if (!confirm(`Opravdu chcete vytvořit nový dokument?`)) {
    console.log('Nevytvářím');
    return;
  }
  try {
    const docId = await useAddColl(COLLECTION_NAME, formData.value);
    if (docId) {
      hasChanges.value = false;
      await router.push(`/${PAGE_NAME}/${docId}`); // Using router.push for navigation
      console.log(`Vytvořen dokument s ID: ${docId}`);
    }
  } catch (e) {
    console.error('Chyba při ukládání z komponenty:', e);
  }
}

async function handleUpdateDoc(): Promise<void> {
  if (!formId.value || formId.value === 'new') {
    console.warn('Nelze aktualizovat: Žádné platné ID dokumentu k úpravě.');
    return;
  }
  if (!confirm(`Opravdu chcete updatovat data s ID: ${formId.value}?`)) {
    console.log('Neupravuji');
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

async function handleDelDoc(): Promise<void> {
  if (!formId.value || formId.value === 'new') {
    console.warn('Žádné platné ID dokumentu k smazání.');
    return;
  }
  if (!confirm(`Opravdu chcete smazat data s ID: ${formId.value}?`)) {
    console.log('nemažu');
    return;
  }
  try {
    const success = await useDelDoc(COLLECTION_NAME, formId.value);
    if (success) {
      console.log(`Dokument s ID '${formId.value}' byl úspěšně smazán!`);
      formData.value = createEmptyFormData();
      formId.value = 'new';
      hasChanges.value = false;
      await router.push(`/${PAGE_NAME}`); // Using router.push for navigation
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

.update-document-btn {
  background-color: #f0ad4e;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 2px;
}

.update-document-btn:hover {
  background-color: #ec971f;
}

.hobbies-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
}

.hobbies-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.hobbies-options input[type="checkbox"] {
  width: auto;
}
</style>