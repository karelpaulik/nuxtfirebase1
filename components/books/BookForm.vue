<template>
  <section class="column border1">
    <q-toolbar class="bg-blue-grey text-white shadow-2">
      <div v-if="formId === 'new'" class="row q-pa-xs">
        <q-btn flat stretch no-caps @click="handleAddDoc" label="Create new doc." class="text-no-wrap" />
      </div>

      <q-btn v-if="formId !== 'new'" flat stretch no-caps :disable="!hasChanges" label="Save changes" @click="handleUpdateDoc" class="text-no-wrap" />
      <q-btn flat stretch no-caps :disable="!hasChanges" label="Revert changes" @click="handleRevertChanges" class="text-no-wrap" />

      <div v-if="formId !== 'new'" class="row no-wrap q-pa-xs">
        <q-btn flat stretch no-caps @click="handleAddDoc" label="Save as new doc." class="text-no-wrap" />
        <q-btn flat stretch no-caps @click="handleDelDoc" label="Del doc." class="text-no-wrap" />
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
          /><q-badge color="secondary" multi-line> Model: "{{ formData.currUserRefUsers }}" </q-badge>

        </div>

      </div>

    </div>

  </section>
</template>

<script setup lang="ts">
// Pozn. Ve vue/nuxt nebusí být všechny importy na začátku souboru.
// Tato podmínka platí pouze pro čisté javascript/typescript soubory.
import { toRef } from 'vue';

import { useDocHandlers } from '~/composables/useDocHandlers';

// Importujeme funkci pro vytvoření prázdných dat a schéma
import { bookFormSchema, createEmptyFormData } from '@/schemas/bookSchema';
import type { BookFormType } from '@/schemas/bookSchema';

const props = defineProps<{
  documentId?: string;
}>();

const documentIdPropRef = toRef(props, 'documentId');

const COLLECTION_NAME = 'books';
const PAGE_NAME = 'books';
const FORM_SCHEMA = bookFormSchema;
interface FormData extends Omit<BookFormType, 'id'> {}

const {
  formId,
  formData,
  hasChanges,
  docHandlers: { handleAddDoc, handleUpdateDoc, handleRevertChanges, handleDelDoc, useWatchDocumentId, useConfirmRouteLeave },
  formVee, // Přijímáme celou instanci VeeValidate formuláře s jasným názvem
} = useDocHandlers<FormData>(documentIdPropRef, COLLECTION_NAME, PAGE_NAME, createEmptyFormData, FORM_SCHEMA);

useWatchDocumentId();
useConfirmRouteLeave();

// --- Zde volám specifické "computed" ---
import { useDateFormatter } from '@/composables/useDateFormatter';
const createdDateFormatted = useDateFormatter(formData, 'createdDate');

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