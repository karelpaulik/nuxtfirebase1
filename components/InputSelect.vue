<template>
  <q-select
    v-model="model"
    :options="selectOptions"
    :label="label"
    clearable
    :loading="loading"
    :option-value="optionValueFn"
    :option-label="optionLabelFn"
    @popup-show="onPopupShow"
  /><q-badge color="secondary" multi-line v-if="model">Model: "{{ model }}"</q-badge>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useInputSelectObjectOptions } from '@/composables/useInputSelectObjectOptions';

const props = defineProps<{
  label: string; // Popisek pole (label pro q-select)
  collectionName: string; // Název kolekce ve Firebase/Firestore (např. 'users')
  attributes: string[]; // Pole atributů, které se mají z dokumentu načíst (např. ['id', 'fName', 'lName'])
  optionLabelFn: (opt: any) => string; // Funkce, která definuje, jak se zobrazí položka v seznamu
  optionValueFn: (opt: any) => any; // Funkce, která definuje, jaká hodnota se uloží do modelu
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

// LOKÁLNÍ STAV: Sleduje, zda již bylo provedeno první načtení dat
const hasLoaded = ref(false);

const onPopupShow = async () => {
  // Kontrola: Pokud již bylo načteno, ukončíme volání.
  if (hasLoaded.value) {
    //console.log(`InputSelect: Data pro ${props.collectionName} již načtena. Přeskočeno opakované volání.`);
    return;
  }

  await handleLoadOptions();// PRVNÍ NAČTENÍ: Zavoláme funkci z composable, která provede načtení dat z Firestore
  hasLoaded.value = true;// Po úspěšném volání nastavíme stav na načteno
};
</script>