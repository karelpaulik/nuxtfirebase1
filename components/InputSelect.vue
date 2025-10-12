<template>
  <q-select
    v-model="model"
    :options="selectOptions"
    :label="label"
    clearable
    :loading="loading"
    :option-value="optionValueFn"
    :option-label="optionLabelFn"
    @popup-show="handleLoadOptions"
  /><q-badge color="secondary" multi-line v-if="model">Model: "{{ model }}"</q-badge>
</template>

<script setup lang="ts">
import { useInputSelectObjectOptions } from '@/composables/useInputSelectObjectOptions';

const props = defineProps<{ 
  label: string;// Popisek pole (label pro q-select)
  collectionName: string;// Název kolekce ve Firebase/Firestore (např. 'users')
  attributes: string[];// Pole atributů, které se mají z dokumentu načíst (např. ['id', 'fName', 'lName'])  
  optionLabelFn: (opt: any) => string;// Funkce, která definuje, jak se zobrazí položka v seznamu  
  optionValueFn: (opt: any) => any;// Funkce, která definuje, jaká hodnota se uloží do modelu
}>();

const model = defineModel<any>();

const {
  selectOptions, // Možnosti pro q-select
  loading,       // Indikátor načítání
  handleLoadOptions // Funkce pro načtení možností
} = useInputSelectObjectOptions(
  props.collectionName, // Název kolekce
  props.attributes      // Atributy, např. ['id', 'fName', 'lName', 'born']
);

</script>