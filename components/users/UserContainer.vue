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
    <UserForm
      v-model="formData"
      :form-id="formId"
      @save-request="handleUpdateDoc(false)"
    />

    <!-- <q-separator spaced />

    <div class="q-pa-md text-h4">Debug Data:</div>
    <p>
        POZN: formData je reaktivní objekt se Ref pro v-model.
        formVee.values je interní readonly stav VeeValidate.
        Oba by měly být synchronní.
    </p>
    <div class="bg-grey-2 q-pa-md q-gutter-md">
      <div>
        formData (pro v-model):<pre>{{ formData }}</pre>
      </div>
      <div>
        formVee.values (VeeValidate interní):<pre>{{ formVee.values }}</pre>
      </div>
      <div>
        formVee.errors:<pre>{{ formVee.errors }}</pre>
      </div>
      <div>
        formVee.meta:<pre>{{ formVee.meta }}</pre>
      </div>
      <div>
        hasChanges (Vlastní stav):<pre>{{ hasChanges }}</pre>
      </div>
    </div> -->
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
import { userFormSchema, userApiSchema, createEmptyFormData } from '@/schemas/userSchema';
import type { UserFormType } from '@/schemas/userSchema';
import UserForm from '~/components/users/UserForm.vue';

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users';
const FORM_SCHEMA = userFormSchema;
const API_SCHEMA = userApiSchema;
type FormDataType = UserFormType;
// ----------------------------------------------------------------------

const props = defineProps<{
  documentId?: string;
}>();

const documentIdPropRef = toRef(props, 'documentId'); // Převedeme props.userId na ref, abychom ho mohli předat do useDocHandlers

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
  API_SCHEMA,
  {
    watchIdOnLoad: true, // Chceme, aby se dokument načítal
    confirmLeave: true,  // Chceme varovat při odchodu
  }
);
</script>