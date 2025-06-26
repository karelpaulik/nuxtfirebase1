<template>
  <section>
    <h2>{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h2>
    <div class="form-fields">
      fName<input v-model="formData.fName" placeholder="fName" @input="setHasChanges(_handlerProps)">
      lName<input v-model="formData.lName" placeholder="lName" @input="setHasChanges(_handlerProps)">
      born<input v-model="formData.born" placeholder="Born" @input="setHasChanges(_handlerProps)">
      createdDate<input type="date" v-model="createdDateFormatted" @input="setHasChanges(_handlerProps)">
      childrenCount<input v-model.number="formData.childrenCount" placeholder="childrenCount" @input="setHasChanges(_handlerProps)">
      userHeight<input v-model.number="formData.userHeight" placeholder="userHeight" @input="setHasChanges(_handlerProps)" @keydown="(event) => usePreventKeys([','], false)(event)" >


      <div>
        <label for="hasDrivingLic">Řidičský průkaz</label>
        <input type="checkbox" id="hasDrivingLic" v-model="formData.hasDrivingLic" @change="setHasChanges(_handlerProps)"/>
      </div>

      <div class="hobbies-group">
        <label>Zájmy:</label>
        <div class="hobbies-options">
          <input type="checkbox" id="hobbyFootball" value="fotbal" v-model="formData.hobbies" @change="setHasChanges(_handlerProps)" />
          <label for="hobbyFootball">Fotbal</label>

          <input type="checkbox" id="hobbyHockey" value="hokej" v-model="formData.hobbies" @change="setHasChanges(_handlerProps)" />
          <label for="hobbyHockey">Hokej</label>

          <input type="checkbox" id="hobbyCycling" value="cyklistika" v-model="formData.hobbies" @change="setHasChanges(_handlerProps)" />
          <label for="hobbyCycling">Cyklistika</label>
        </div>
      </div>

      <div>
        <div>Picked: {{ formData.picked }}</div>

        <input type="radio" id="one" value="One" v-model="formData.picked" @change="setHasChanges(_handlerProps)" />
        <label for="one">One</label>

        <input type="radio" id="two" value="Two" v-model="formData.picked" @change="setHasChanges(_handlerProps)" />
        <label for="two">Two</label>
      </div>
    </div>

    <div v-if="hasChanges" class="changes-row">
      <button @click="handleRevertChanges(_handlerProps)" class="update-document-btn">Vrátit změny dokumentu</button>
      <button @click="handleUpdateDoc(_handlerProps)" class="update-document-btn">Uložit změny dokumentu</button>
    </div>

    <div v-if="formId === 'new'" class="btn-field">
      <button @click="handleAddDoc(_handlerProps)">Vytvořit nový dokument</button>
    </div>
    
    <div v-else class="btn-field">
      <button @click="handleAddDoc(_handlerProps)">Vytvořit nový dokument ze stávajícího.</button>
      <button @click="handleDelDoc(_handlerProps)">Smazat dokument</button>
    </div>

    <pre>{{formData}}</pre>
    <p v-if="formId && formId !== 'new'">Aktuální ID dokumentu: {{ formId }}</p>
  </section>
</template>

<script setup lang="ts">
// Importujeme useDocHandlers pro získání stavu a _handlerProps.
// Importujeme také všechny samostatné handlery a router-specifické Composables.
import { 
  useDocHandlers, 
  setHasChanges, 
  handleRevertChanges, 
  handleAddDoc, 
  handleUpdateDoc, 
  handleDelDoc, 
  useWatchRouteId, 
  useConfirmRouteLeave,
  type FormHandlerProps // Importujeme interface pro typování
} from '~/composables/useDocHandlers'; // Nový composable soubor

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
  createdDate: Date;     // datum
  childrenCount: number; // integer
  userHeight: number;    // float

}

const createEmptyFormData = (): FormData => {
  return {
    fName: '',
    lName: '',
    born: '',
    hasDrivingLic: false,
    hobbies: [],
    picked: '',
    createdDate: new Date(),  // Pro v-model nutno computed (převod na string a zpět). Maybe quasar?
    childrenCount: 0,         // v-model.number
    userHeight: 0.0,          // v-model.number // Desetinný oddělovač je tečka. // Jak zabránit čárce: @keydown="(event) => usePreventKeys([','])(event)"
  };
};

const {
  formId, //Používá se v Template
  formData, //Používá se v Template
  hasChanges, //Používá se v Template
  _handlerProps // Získáme objekt handlerProps pro volání funkcí
} = useDocHandlers<FormData>(COLLECTION_NAME, PAGE_NAME, createEmptyFormData);

// --- Zde voláme router-specifické Composables přímo z komponenty ---
useWatchRouteId(_handlerProps);    // Voláme watcher pro ID routy
useConfirmRouteLeave(_handlerProps); // Voláme ochranu před opuštěním stránky

const createdDateFormatted = computed({
  get: () => {
    const date = formData.value.createdDate;
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toISOString().split('T')[0]
      : '';
  },
  set: (newValue: string) => {
    const parsedDate = new Date(newValue);
    if (!isNaN(parsedDate.getTime())) {
      formData.value.createdDate = parsedDate;
    }
  }
});

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