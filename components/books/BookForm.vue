<template>
  <section class="column border1 relative-position">
    <div v-if="loading" class="loading-overlay"></div>
    
    <div v-if="loading" class="absolute-center q-pa-md text-center text-primary z-top">
      <q-spinner size="3em" color="primary" />
      <p class="q-mt-sm">Zpracovávám data, prosím čekejte...</p>
    </div>

    <FormToolbar
      :form-id="formId"
      :has-changes="hasChanges"
      @add-doc="handleAddDoc"
      @update-doc="handleUpdateDoc"
      @revert-changes="handleRevertChanges"
      @del-doc="handleDelDoc"
    />

    <div class="column">
      <div class="form-content-scroll q-pa-md">

        <q-banner v-if="error" inline-actions class="text-white bg-negative q-mb-md">
          <template v-slot:avatar>
            <q-icon name="warning" color="white" />
          </template>          
          <p class="q-ma-none">Chyba při zpracování dat: <strong>{{ error.message }}</strong></p>          
          <template v-slot:action>
            <q-btn flat color="white" label="Zavřít" @click="error = null" /> 
          </template>
        </q-banner>

        <h4 class="q-pa-xs q-ma-xs">{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h4>

        <div class="q-pa-md" style="max-width: 300px">
          <q-input v-model="formData.title" label="title" />
          <q-input v-model="formData.author" label="Author" />
          <DateInput v-model="formData.createdDate" label="createdDate" />

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
import FormToolbar from '~/components/FormToolbar.vue';
import DateInput from '~/components/DateInput.vue';

const props = defineProps<{
  documentId?: string;
}>();

const documentIdPropRef = toRef(props, 'documentId');

const COLLECTION_NAME = 'books';
const PAGE_NAME = 'books';
const FORM_SCHEMA = bookFormSchema;
type FormDataType = BookFormType

const {
  formId,
  formData,
  hasChanges,
  loading,
  error,
  docHandlers: { handleAddDoc, handleUpdateDoc, handleRevertChanges, handleDelDoc },
  formVee,
} = useDocHandlers<FormDataType>(documentIdPropRef, COLLECTION_NAME, PAGE_NAME, createEmptyFormData, FORM_SCHEMA,
  {
    watchIdOnLoad: true,
    confirmLeave: true,
  }
);

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