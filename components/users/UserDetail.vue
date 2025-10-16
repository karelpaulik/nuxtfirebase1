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
    <div class="text-h4 q-pa-xs q-ma-xs">{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</div>
  
    <div class="q-pa-md" style="max-width: 300px">
      <q-input v-model="formData.fName" label="fName" />
      <q-input v-model="formData.lName" label="lName" />
      <q-input v-model="formData.born" label="Born" />
      <DateInput v-model="formData.createdDate" label="createdDate" />
      <q-input v-model.number="formData.childrenCount" label="childrenCount" />
      <q-input v-model.number="formData.userHeight" label="userHeight" @keydown="(event) => usePreventKeys([','], false)(event)" />
    </div>

    <q-checkbox v-model="formData.hasDrivingLic" label="Řidičský průkaz" />

    <div>
      <q-checkbox
        v-for="option in hobbiesOptions"
        v-model="formData.hobbies"
        :key="option.value"
        :val="option.value"
        :label="option.label"
      />
    </div>

    <div>
      <q-radio
        v-for="option in pickedOptions"
        v-model="formData.picked"
        :key="option.value"
        :val="option.value"
        :label="option.label"
      />
    </div>

    <div class="q-pa-md text-h4">Hlavní adresa:</div>
    <AddressForm v-model="formData.mainAddress" />

    <AddressesList v-model="formData.addresses" />
    <q-separator spaced />

    <div class="q-pa-md text-h4">Nahrát soubory</div>
    <FileUpload
      :form-id="formId"
      :collection-name="COLLECTION_NAME"
      v-model="formData.files"
      @save-request="handleUpdateDoc(false)"
    />
    <q-separator spaced class="q-mt-lg" />

    <div class="q-pa-md text-h4">Seznam nahraných souborů</div>
    <FileList
      :form-id="formId"
      :collection-name="COLLECTION_NAME"
      v-model="formData.files"
      @save-request="handleUpdateDoc(false)"
    />
    <q-separator spaced />

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
    </div>
  </DetailLayout>
</template>

<script setup lang="ts">
// Pozn. Ve vue/nuxt nebusí být všechny importy na začátku souboru.
// Tato podmínka platí pouze pro čisté javascript/typescript soubory.
import { toRef } from 'vue';
import { usePreventKeys } from '~/composables/usePreventKeys';

import { useDocHandlers } from '~/composables/useDocHandlers';
import { userFormSchema, hobbiesOptions, pickedOptions, createEmptyFormData } from '@/schemas/userSchema';
import type { UserFormType } from '@/schemas/userSchema';
import FileUpload from '~/components/_shared/file/FileUpload.vue';
import FileList from '~/components/_shared/file/FileList.vue';

import AddressesList from '~/components/_shared/form/AddressesList.vue'; // Import nové komponenty pro seznam adres
import AddressForm from '~/components/_shared/form/AddressForm.vue'; // Importujeme novou komponentu pro jednu adresu
import DetailLayout from '~/components/_shared/layout/DetailLayout.vue';
import DateInput from '~/components/_shared/form/DateInput.vue';

const props = defineProps<{
  documentId?: string;
}>();

const documentIdPropRef = toRef(props, 'documentId'); // Převedeme props.userId na ref, abychom ho mohli předat do useDocHandlers

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users';
const FORM_SCHEMA = userFormSchema;
type FormDataType = UserFormType

const {
  formId,
  formData,
  hasChanges,
  loading, // Nově importováno
  error, // Nově importováno
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