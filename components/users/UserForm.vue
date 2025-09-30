<template>
  <section class="column border1">    
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

        <h4 class="q-pa-xs q-ma-xs">{{ formId === 'new' ? 'Nový záznam' : 'Detail záznamu' }}</h4>

        <div class="q-pa-md" style="max-width: 300px">
          <q-input v-model="formData.fName" label="fName" />
          <q-input v-model="formData.lName" label="lName" />
          <q-input v-model="formData.born" label="Born" />
          <q-input type="date" v-model="createdDateFormatted" label="createdDate" />
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

        <h4>Hlavní adresa:</h4>
        <AddressForm v-model="formData.mainAddress" />

        <AddressesList v-model="formData.addresses" />
        
        <q-separator spaced />

        <FileUploader
          :form-id="formId"
          :collection-name="COLLECTION_NAME"
          :files="formData.files"
          @update:files="(newFiles: FileSchemaType[]) => formData.files = newFiles"
          @save-request="handleUpdateDoc(false)"
        />
        <q-separator spaced />

        <h4>Debug Data:</h4>
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
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Pozn. Ve vue/nuxt nebusí být všechny importy na začátku souboru.
// Tato podmínka platí pouze pro čisté javascript/typescript soubory.
import { ref, toRef } from 'vue';
import { usePreventKeys } from '~/composables/usePreventKeys';

import { useDocHandlers } from '~/composables/useDocHandlers';
import { userFormSchema, hobbiesOptions, pickedOptions, createEmptyFormData } from '@/schemas/userSchema';
import type { UserFormType } from '@/schemas/userSchema';
import FileUploader from '~/components/FileUploader.vue';
import type { FileSchemaType } from '@/schemas/fileSchema'; // Import nového typu souboru
import AddressesList from '~/components/AddressesList.vue'; // Import nové komponenty pro seznam adres
import AddressForm from '~/components/AddressForm.vue'; // Importujeme novou komponentu pro jednu adresu
import FormToolbar from '~/components/FormToolbar.vue';

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
  docHandlers: { handleAddDoc, handleUpdateDoc, handleRevertChanges, handleDelDoc, useWatchDocumentId, useConfirmRouteLeave },
  formVee,
} = useDocHandlers<FormDataType>(documentIdPropRef, COLLECTION_NAME, PAGE_NAME, createEmptyFormData, FORM_SCHEMA);

// --- Zde voláme router-specifické Composables přímo z komponenty ---
useWatchDocumentId(); // Pro načtení dokumentu
useConfirmRouteLeave(); // Hlídání odchodu ze stránky

// --- Zde volám specifické "computed" ---
import { useDateFormatter } from '@/composables/useDateFormatter';
const createdDateFormatted = useDateFormatter(formData, 'createdDate');
</script>

<style scoped>
/* Skrolovatelná část formuláře */
.form-content-scroll {
  overflow-y: auto; /* Povolí vertikální skrolování, když obsah přesáhne max-height */
  max-height: calc(100vh - 400px); /* Přibližný výpočet */

  /* Styly pro skrytí scrollbaru (volitelné, pro čistější vzhled) */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.form-content-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.border1 {
  border: 5px solid gray;
  border-radius: 5px;
}
</style>