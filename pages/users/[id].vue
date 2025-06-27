<template>
  <section>
    <h4 class="q-pa-xs q-mt-md q-mb-xs">{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h4>

    <div class="q-pa-md" style="max-width: 300px">
      <q-input v-model="formData.fName" label="fName" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input v-model="formData.lName" label="lName" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input v-model="formData.born" label="Born" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input type="date" v-model="createdDateFormatted" label="createdDate" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input v-model.number="formData.childrenCount" label="childrenCount" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-input v-model.number="formData.userHeight" label="userHeight" @update:modelValue="setHasChanges(_handlerProps)" @keydown="(event) => usePreventKeys([','], false)(event)" />
    </div>

    <q-checkbox v-model="formData.hasDrivingLic" label="Řidičský průkaz" @update:modelValue="setHasChanges(_handlerProps)" />

    <div>
      <q-checkbox v-model="formData.hobbies" val="Fotbal" label="fotbal" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-checkbox v-model="formData.hobbies" val="Hokej" label="hokej" @update:modelValue="setHasChanges(_handlerProps)" />
      <q-checkbox v-model="formData.hobbies" val="Cyklistika" label="cyklistika" @update:modelValue="setHasChanges(_handlerProps)" />
    </div>

    <div>
    <q-radio v-model="formData.picked" val="One" label="One" @update:modelValue="setHasChanges(_handlerProps)" />
    <q-radio v-model="formData.picked" val="Two" label="Two" @update:modelValue="setHasChanges(_handlerProps)" />
    </div>

    <div v-if="hasChanges" class="changes-row q-pa-xs">
        <q-btn label="Vrátit změny dokumentu" @click="handleRevertChanges(_handlerProps)" />
        <q-btn label="Uložit změny dokumentu" @click="handleUpdateDoc(_handlerProps)" />
    </div>

    <div v-if="formId === 'new'" class="btn-field">
      <q-btn @click="handleAddDoc(_handlerProps)" label="Vytvořit nový dokument" />
    </div>
    
    <div v-else class="q-pa-xs">
      <q-btn @click="handleAddDoc(_handlerProps)" label="Vytvořit nový dokument ze stávajícího." />
      <q-btn @click="handleDelDoc(_handlerProps)" label="Smazat dokument" />
    </div>

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