<template>
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

  <AddressList v-model="formData.addresses" />
  <q-separator spaced />

  <div class="q-pa-md text-h4">Nahrát soubory (vícenásobné)</div>
  <FileUpload
    :form-id="formId"
    :collection-name="COLLECTION_NAME"
    v-model="formData.files"
    :multiple="true"
    @save-request="emit('save-request')"
  />
  <q-separator spaced class="q-mt-lg" />

  <div class="q-pa-md text-h4">Seznam nahraných souborů</div>
  <FileList
    :form-id="formId"
    :collection-name="COLLECTION_NAME"
    v-model="formData.files"
    @save-request="emit('save-request')"
  />

  <div class="q-pa-md text-h4">Seznam nahraných obrázků</div>
  <ImageList
    :form-id="formId"
    :collection-name="COLLECTION_NAME"
    v-model="formData.files"
    @save-request="emit('save-request')"
  />

  <div class="q-pa-md text-h4">Nahrát soubor (jeden)</div>
  <FileUpload
    :form-id="formId"
    :collection-name="COLLECTION_NAME"
    v-model="formData.file"
    :multiple="false"
    @save-request="emit('save-request')"
  />

  <FileContainer
    :form-id="formId"
    :collection-name="COLLECTION_NAME"
    v-model="formData.file"
    @save-request="emit('save-request')"
  />
  <img v-if="formData.file && formData.file.url" :src="formData.file.url" />
</template>


<script setup lang="ts">
import type { UserFormType } from '@/schemas/userSchema';
import { hobbiesOptions, pickedOptions } from '@/schemas/userSchema';
import { usePreventKeys } from '~/composables/usePreventKeys';

import FileUpload from '~/components/_shared/data/file/FileUpload.vue';
import FileList from '~/components/_shared/data/file/FileList.vue';
import ImageList from '~/components/_shared/data/image/ImageList.vue';
import AddressList from '~/components/_shared/data/address/AddressList.vue'; // Import nové komponenty pro seznam adres
import AddressForm from '~/components/_shared/data/address/AddressForm.vue'; // Importujeme novou komponentu pro jednu adresu
import DateInput from '~/components/_shared/ui/form/DateInput.vue';
import FileContainer from '~/components/_shared/data/file/FileContainer.vue';

defineProps<{
  formId: string;
}>();

const formData = defineModel<UserFormType>({ required: true });

const emit = defineEmits<{
  (e: 'save-request'): void;
}>();

const COLLECTION_NAME = 'users';
</script>

