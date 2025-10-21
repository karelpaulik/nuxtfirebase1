<template>
  <DetailLayout
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
    <BookForm
      v-model="formData" 
      :form-id="formId"
      @save-request="handleUpdateDoc(false)"
    />
  </DetailLayout>
</template>

<script setup lang="ts">
// Vue
import { toRef } from 'vue';

// Composables
import { useDocHandlers } from '~/composables/useDocHandlers';

// Layout
import DetailLayout from '~/components/_shared/ui/layout/DetailLayout.vue';

// To edit----------------------------------------------------------------
import { bookFormSchema, createEmptyFormData } from '@/schemas/bookSchema';
import type { BookFormType } from '@/schemas/bookSchema';
import BookForm from '~/components/books/BookForm.vue';

const COLLECTION_NAME = 'books';
const PAGE_NAME = 'books';
const FORM_SCHEMA = bookFormSchema;
type FormDataType = BookFormType
// ----------------------------------------------------------------------

const props = defineProps<{
  documentId?: string;
}>();

const documentIdPropRef = toRef(props, 'documentId');

const {
  formId,
  formData,
  hasChanges,
  loading,
  error,
  docHandlers: { handleAddDoc, handleUpdateDoc, handleRevertChanges, handleDelDoc },
  formVee,
} = useDocHandlers<FormDataType>(
  documentIdPropRef, 
  COLLECTION_NAME, 
  PAGE_NAME, 
  createEmptyFormData, 
  FORM_SCHEMA,
  {
    watchIdOnLoad: true, // Chceme, aby se dokument načítal
    confirmLeave: true,  // Chceme varovat při odchodu
  }
);
</script>