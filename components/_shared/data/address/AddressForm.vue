//components/AddressForm.vue
<template>
  <div class="q-gutter-xs">
    <q-input v-model="item.country" label="Stát" />
    <q-input v-model="item.city" label="Město" />
    <q-input v-model="item.street" label="Ulice (nepovinné)" />
    <q-input v-model="item.houseNr" label="Číslo popisné" />
    <q-input v-model="item.postalCode" label="PSČ" />
    <q-input v-model="item.note" label="Poznámka (nepovinné)" />
  </div>
</template>

<script setup lang="ts">
import type { AddressType as ItemType } from '@/schemas/addressSchema';

// Používáme defineModel pro obousměrnou vazbu na jednu položku.
const item = defineModel<ItemType>({ required: true });
</script>