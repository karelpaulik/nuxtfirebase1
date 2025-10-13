<template>
  <q-input
    :model-value="formattedValue"
    @update:model-value="handleFormattedValueUpdate"
    type="date"
    :label="label"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Definuje v-model a získá Ref s typem Date | null | undefined
const modelValue = defineModel<Date | null | undefined>();

// Ručně definujeme 'label', který není součástí v-model
const props = defineProps<{
  label?: string;
}>();

/**
 * GET: Převede objekt Date (modelValue.value) na string 'YYYY-MM-DD'.
 */
const formattedValue = computed(() => {
  const date = modelValue.value;
  
  // převod Date -> string YYYY-MM-DD
  return date instanceof Date && !isNaN(date.getTime())
    ? date.toISOString().split('T')[0]
    : '';
});

/**
 * Zpracuje událost @update:model-value z Q-Inputu (formát YYYY-MM-DD)
 * a převádí string zpět na objekt Date nebo null pro modelValue.
 * * @param newValue Stringová hodnota z Q-Inputu
 */
const handleFormattedValueUpdate = (newValue: string | null) => {
  if (newValue === '' || newValue === null) {
    modelValue.value = null;
  } else {
    const parsedDate = new Date(newValue);    
    if (!isNaN(parsedDate.getTime())) {
      modelValue.value = parsedDate;
    } else {
      modelValue.value = null;
    }
  }
};
</script>