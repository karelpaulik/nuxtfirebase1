<template>
  <section>
    <h4 class="q-pa-xs q-mt-md q-mb-xs">{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h4>
    <!-- <div class="form-fields"> -->

      <!-- fName<input v-model="formData.fName" placeholder="fName" @input="setHasChanges(_handlerProps)">
      lName<input v-model="formData.lName" placeholder="lName" @input="setHasChanges(_handlerProps)">
      born<input v-model="formData.born" placeholder="Born" @input="setHasChanges(_handlerProps)">
      createdDate<input type="date" v-model="createdDateFormatted" @input="setHasChanges(_handlerProps)">
      childrenCount<input v-model.number="formData.childrenCount" placeholder="childrenCount" @input="setHasChanges(_handlerProps)">
      userHeight<input v-model.number="formData.userHeight" placeholder="userHeight" @input="setHasChanges(_handlerProps)" @keydown="(event) => usePreventKeys([','], false)(event)" > -->

      <div class="q-pa-md" style="max-width: 300px">
      <q-input v-model="formData.fName" label="fName" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input v-model="formData.lName" label="lName" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input v-model="formData.born" label="Born" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input type="date" v-model="createdDateFormatted" label="createdDate" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input v-model.number="formData.childrenCount" label="childrenCount" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input v-model.number="formData.userHeight" label="userHeight" @update:modelValue="setHasChanges(_handlerProps)" @keydown="(event) => usePreventKeys([','], false)(event)" />
      </div>


      <!-- <div>
        <label for="hasDrivingLic">Řidičský průkaz</label>
        <input type="checkbox" id="hasDrivingLic" v-model="formData.hasDrivingLic" @change="setHasChanges(_handlerProps)"/>
      </div> -->

      <q-checkbox v-model="formData.hasDrivingLic" label="Řidičský průkaz" @update:modelValue="setHasChanges(_handlerProps)" />

      <!-- <div class="hobbies-group">
        <label>Zájmy:</label>
        <div class="hobbies-options">
          <input type="checkbox" id="hobbyFootball" value="fotbal" v-model="formData.hobbies" @change="setHasChanges(_handlerProps)" />
          <label for="hobbyFootball">Fotbal</label>

          <input type="checkbox" id="hobbyHockey" value="hokej" v-model="formData.hobbies" @change="setHasChanges(_handlerProps)" />
          <label for="hobbyHockey">Hokej</label>

          <input type="checkbox" id="hobbyCycling" value="cyklistika" v-model="formData.hobbies" @change="setHasChanges(_handlerProps)" />
          <label for="hobbyCycling">Cyklistika</label>
        </div>
      </div> -->

      <div>
      <q-checkbox v-model="formData.hobbies" val="Fotbal" label="fotbal" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-checkbox v-model="formData.hobbies" val="Hokej" label="hokej" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-checkbox v-model="formData.hobbies" val="Cyklistika" label="cyklistika" @update:modelValue="setHasChanges(_handlerProps)" />
      </div>

      <!-- <div>
        <div>Picked: {{ formData.picked }}</div>

        <input type="radio" id="one" value="One" v-model="formData.picked" @change="setHasChanges(_handlerProps)" />
        <label for="one">One</label>

        <input type="radio" id="two" value="Two" v-model="formData.picked" @change="setHasChanges(_handlerProps)" />
        <label for="two">Two</label>
      </div> -->

      <div>
      <q-radio v-model="formData.picked" val="One" label="One" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-radio v-model="formData.picked" val="Two" label="Two" @update:modelValue="setHasChanges(_handlerProps)" />
      </div>

    <div v-if="hasChanges" class="changes-row q-pa-xs">
      <!-- <button @click="handleRevertChanges(_handlerProps)" class="update-document-btn">Vrátit změny dokumentu</button>
      <button @click="handleUpdateDoc(_handlerProps)" class="update-document-btn">Uložit změny dokumentu</button> -->
        <q-btn label="Vrátit změny dokumentu" @click="handleRevertChanges(_handlerProps)" />
        <q-btn label="Uložit změny dokumentu" @click="handleUpdateDoc(_handlerProps)" />
    </div>

    <div v-if="formId === 'new'" class="btn-field">
      <!-- <button @click="handleAddDoc(_handlerProps)">Vytvořit nový dokument</button> -->
      <q-btn @click="handleAddDoc(_handlerProps)" label="Vytvořit nový dokument" />
    </div>
    
    <div v-else class="q-pa-xs">
      <!-- <button @click="handleAddDoc(_handlerProps)">Vytvořit nový dokument ze stávajícího.</button>
      <button @click="handleDelDoc(_handlerProps)">Smazat dokument</button> -->
      <q-btn @click="handleAddDoc(_handlerProps)" label="Vytvořit nový dokument ze stávajícího." />
      <q-btn @click="handleDelDoc(_handlerProps)" label="Smazat dokument" />
    </div>

    <!-- <pre>{{formData}}</pre>
    <p v-if="formId && formId !== 'new'">Aktuální ID dokumentu: {{ formId }}</p> -->
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

</style>