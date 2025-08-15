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
          <q-input v-model="formData.fName" label="fName" />
          <q-input v-model="formData.lName" label="lName" />
          <q-input v-model="formData.born" label="Born" />
          <q-input type="date" v-model="createdDateFormatted" label="createdDate" />
          <q-input v-model.number="formData.childrenCount" label="childrenCount" />
          <q-input v-model.number="formData.userHeight" label="userHeight" @keydown="(event) => usePreventKeys([','], false)(event)" />
        </div>

        <q-checkbox v-model="formData.hasDrivingLic" label="Řidičský průkaz" />

        <!-- <div>
          <q-checkbox v-model="formData.hobbies" val="fotbal" label="Fotbal" />
          <q-checkbox v-model="formData.hobbies" val="hokej" label="Hokej" />
          <q-checkbox v-model="formData.hobbies" val="cyklistika" label="cyklistika" />
        </div> -->

        <div>
          <q-checkbox
            v-for="option in hobbiesOptions"
            v-model="formData.hobbies"
            :key="option.value"
            :val="option.value"
            :label="option.label"
          />
        </div>

        <!-- <div>
        <q-radio v-model="formData.picked" val="One" label="One" />
        <q-radio v-model="formData.picked" val="Two" label="Two" />
        </div> -->

        <div>
          <q-radio 
            v-for="option in pickedOptions"
            v-model="formData.picked" 
            :key="option.value"
            :val="option.value" 
            :label="option.label"
          />
        </div>

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
import { toRef, computed } from 'vue';
import { userFormSchema, hobbiesOptions, pickedOptions  } from '@/schemas/userSchema';
import type { UserForForm as User} from '@/schemas/userSchema';
import { usePreventKeys } from '~/composables/usePreventKeys';


interface FormData extends Omit<User, 'id'> {}

const props = defineProps<{
  documentId?: string;
}>();

const documentIdPropRef = toRef(props, 'documentId'); // Převedeme props.userId na ref, abychom ho mohli předat do useDocHandlers

const COLLECTION_NAME = 'users';
const PAGE_NAME = 'users';

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

import {
  useDocHandlers,
  handleRevertChanges,
  handleAddDoc,
  handleUpdateDoc,
  handleDelDoc,
  useWatchDocumentId,
  useConfirmRouteLeave
} from '~/composables/useDocHandlers';

const {
  formId,
  formData,
  hasChanges,
  _handlerProps,
  formVee, // Přijímáme celou instanci VeeValidate formuláře s jasným názvem
} = useDocHandlers<FormData>(documentIdPropRef, COLLECTION_NAME, PAGE_NAME, createEmptyFormData, userFormSchema);

// --- Zde voláme router-specifické Composables přímo z komponenty ---
useWatchDocumentId(_handlerProps);
useConfirmRouteLeave(_handlerProps);


const createdDateFormatted = computed({
  get: () => {
    const date = formData.createdDate;
    // Pokud je datum null/undefined nebo neplatné, vrátí prázdný string pro input
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toISOString().split('T')[0]
      : '';
  },
  set: (newValue: string) => {
    if (newValue === '') { // <-- Pokud je input prázdný string
      formData.createdDate = null; // <-- Nastavte na null (nebo undefined)
    } else {
      const parsedDate = new Date(newValue);
      if (!isNaN(parsedDate.getTime())) {
        formData.createdDate = parsedDate;
      }
    }
  }
});


</script>

<style scoped>
/* Skrolovatelná část formuláře */
.form-content-scroll {
  overflow-y: auto; /* Povolí vertikální skrolování, když obsah přesáhne max-height */
  max-height: calc(100vh - 400px); /* Přibližný výpočet */

  /* Styly pro skrytí scrollbaru (volitelné, pro čistší vzhled) */
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