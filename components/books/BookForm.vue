<template>
  <section class="column border1">
    <q-toolbar class="bg-blue-grey text-white shadow-2">
      <div v-if="formId === 'new'" class="row q-pa-xs">
        <q-btn flat stretch no-caps @click="handleAddDoc(_handlerProps)" label="Create new doc." class="text-no-wrap" />
      </div>

      <q-btn v-if="formId !== 'new'" flat stretch no-caps :disable="!hasChanges" label="Save changes" @click="handleUpdateDoc(_handlerProps)" class="text-no-wrap" />
      <q-btn flat stretch no-caps :disable="!hasChanges" label="Revert changes" @click="handleRevertChanges(_handlerProps)" class="text-no-wrap" />

      <div v-if="formId !== 'new'" class="row no-wrap q-pa-xs">
        <q-btn flat stretch no-caps @click="handleAddDoc(_handlerProps)" label="Save as new doc." class="text-no-wrap" />
        <q-btn flat stretch no-caps @click="handleDelDoc(_handlerProps)" label="Del doc." class="text-no-wrap" />
      </div>

    </q-toolbar>

    <div class="column">
      <div class="form-content-scroll q-pa-md">

        <h4 class="q-pa-xs q-ma-xs">{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h4>

        <div class="q-pa-md" style="max-width: 300px">
          <q-input v-model="formData.title" label="title" />
          <q-input v-model="formData.author" label="Author" />
          <q-input type="date" v-model="createdDateFormatted" label="createdDate" />

          <q-select
            v-model="formData.currUserRefUsers"
            :options="userSelectOptions"
            label="Vyberte uživatele"
            clearable
            :loading="userSelectLoading"
            :option-value="opt => opt.id"
            :option-label="opt => `${opt.fName} ${opt.lName} ${opt.born}`"
            @popup-show="userHandleLoadOptions"
          /><!-- @popup-show vs. @focus -->
          <q-badge color="secondary" multi-line>  Model: "{{ formData.currUserRefUsers }}" </q-badge>

        </div>

      </div>

    </div>

  </section>
</template>

<script setup lang="ts">
// Pozn. Ve vue/nuxt nebusí být všechny importy na začátku souboru.
// Tato podmínka platí pouze pro čisté javascript/typescript soubory.
import { toRef, computed } from 'vue';
import {
  useDocHandlers,
  handleRevertChanges,
  handleAddDoc,
  handleUpdateDoc,
  handleDelDoc,
  useWatchDocumentId,
  useConfirmRouteLeave
} from '~/composables/useDocHandlers';

import { bookFormSchema  } from '@/schemas/bookSchema';
import type { BookFormType } from '@/schemas/bookSchema';

const props = defineProps<{
  documentId?: string;
}>();

const documentIdPropRef = toRef(props, 'documentId');

const COLLECTION_NAME = 'books';
const PAGE_NAME = 'books';
const FORM_SCHEMA = bookFormSchema;
interface FormData extends Omit<BookFormType, 'id'> {}

const createEmptyFormData = (): FormData => {
  return {
    title: '',
    author: '',
    createdDate: new Date(),
    currUserRefUsers: null
  };
};

const {
  formId,
  formData,
  hasChanges,
  _handlerProps,
  formVee, // Přijímáme celou instanci VeeValidate formuláře s jasným názvem
} = useDocHandlers<FormData>(documentIdPropRef, COLLECTION_NAME, PAGE_NAME, createEmptyFormData, FORM_SCHEMA);

useWatchDocumentId(_handlerProps);
useConfirmRouteLeave(_handlerProps);

// --- Zde volám specifické "computed" ---
import { useDateFormatter } from '@/composables/useDateFormatter';
const createdDateFormatted = useDateFormatter(formData, 'createdDate');

// const createdDateFormatted = computed({
//   get: () => {                              //Pro input nutno převést datum: Date -> string
//     const date = formData.value.createdDate;
//     return date instanceof Date && !isNaN(date.getTime())
//       ? date.toISOString().split('T')[0]
//       : '';
//   },
//   set: (newValue: string) => {              //Při změně data v inputu je nutno datum převést: string -> Date
//     const parsedDate = new Date(newValue);  //Vytvoří nový Date objekt z přijatého stringu
//     if (!isNaN(parsedDate.getTime())) {     //Kontrola jestli převod na datom proběhl v pořádku
//       formData.value.createdDate = parsedDate;
//     }
//   }
// });

// --- Použití nového generického composable pro uživatele ---
import { useInputSelectObjectOptions } from '@/composables/useInputSelectObjectOptions';
import { userSelectAttributes } from '@/schemas/userSchema';
const {
  selectOptions: userSelectOptions,
  loading: userSelectLoading,
  handleLoadOptions: userHandleLoadOptions
} = useInputSelectObjectOptions(
  'users', // Název kolekce
  userSelectAttributes// ['id', 'fName', 'lName', 'born']
);

</script>

<style scoped>
.form-content-scroll {
  overflow-y: auto;
  max-height: calc(100vh - 400px);

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.form-content-scroll::-webkit-scrollbar {
  display: none;
}

.border1 {
  border: 5px solid gray;
  border-radius: 5px;
}
</style>
