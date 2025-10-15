<template>
  <FormLayout
    :loading="loading"
    :form-id="formId"
    :has-changes="hasChanges"
    :error="error"
    @add-doc="handleAddDoc"
    @update-doc="handleUpdateDoc"
    @revert-changes="handleRevertChanges"
    @del-doc="handleDelDoc"
    @clear-error="error = null"
  >
    <h4 class="q-pa-xs q-ma-xs">{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h4>

    <div class="q-pa-md" style="max-width: 300px">
      <q-input v-model="formData.title" label="title" />
      <q-input v-model="formData.author" label="Author" />
      <DateInput v-model="formData.createdDate" label="createdDate" />

      <InputSelect
        v-model="formData.currUserRefUsers"
        label="Vyberte uživatele"
        collection-name="users"
        :attributes="userSelectAttributes"
        :option-value-fn="opt => opt.id"
        :option-label-fn="opt => `${opt.fName} ${opt.lName} ${opt.born}`"
      />
      <!-- 
      :attributes  Které atributy se uloží do db v rererenci.
      :option-value-fn  Ponechat téměř vždy "opt.id". I bez "emit-value" a "map-option" je vhodné ponechat. V "multiple" téměř nutné, v "single" není nezbytné - ale stále vhodné (porovnání záznamů).
      :option-label-fn  Které atributy se zobrazí po vybrání v q-select (podmnožina :attribute)
      -->
    </div>
  </FormLayout>
</template>

<script setup lang="ts">
// Pozn. Ve vue/nuxt nebusí být všechny importy na začátku souboru.
// Tato podmínka platí pouze pro čisté javascript/typescript soubory.
import { toRef } from 'vue';

// Composables
import { useDocHandlers } from '~/composables/useDocHandlers';

// Schémata a typy
import { bookFormSchema, createEmptyFormData } from '@/schemas/bookSchema';
import type { BookFormType } from '@/schemas/bookSchema';

// Atributy pro reference
import { userSelectAttributes } from '@/schemas/userSchema'; // Atributy pro výběr uživatele

// Komponenty
import FormLayout from '~/components/_shared/layout/FormLayout.vue';
import DateInput from '~/components/_shared/form/DateInput.vue';
import InputSelect from '~/components/_shared/form/InputSelect.vue'; // Generická komponenta

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
</script>
