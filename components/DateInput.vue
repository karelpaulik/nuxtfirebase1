<template>
  <q-input
    :model-value="formattedValue"
    @update:model-value="handleInput"
    type="date"
    :label="label"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

// v-model se automaticky mapuje na 'modelValue' prop a 'update:modelValue' event
const props = defineProps<{
  modelValue: Date | null | undefined;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void;
}>();


/**
 * Computed vlastnost pro obousměrnou konverzi.
 * GET: Převede objekt Date (modelValue) na string 'YYYY-MM-DD', který potřebuje HTML <input type="date">.
 * SET: Není potřeba, protože se používá metoda handleInput.
 */
const formattedValue = computed(() => {
  const date = props.modelValue;
  
  // převod Date -> string YYYY-MM-DD
  return date instanceof Date && !isNaN(date.getTime())
    ? date.toISOString().split('T')[0]
    : '';
});

/**
 * Zpracuje událost @update:model-value z Q-Inputu.
 * Převádí string 'YYYY-MM-DD' zpět na objekt Date nebo null.
 * @param newValue Stringová hodnota z Q-Inputu
 */
const handleInput = (newValue: string | null) => {
  if (newValue === '' || newValue === null) {
    emit('update:modelValue', null);// Pokud je vstup prázdný, odešle se null (pro databázi/schema)
  } else {
    const parsedDate = new Date(newValue);    
    if (!isNaN(parsedDate.getTime())) {
      emit('update:modelValue', parsedDate);// Odesílá se platný objekt Date zpět do v-model (formData.createdDate)
    } else {
       emit('update:modelValue', null);// Pokud by se parsování nezdařilo, můžeme volitelně odeslat null nebo neposílat nic
    }
  }
};
</script>