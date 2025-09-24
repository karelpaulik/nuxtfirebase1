<template>
  <div class="q-gutter-md">
    <q-input v-model="item.country" label="Stát" />
    <q-input v-model="item.city" label="Město" />
    <q-input v-model="item.street" label="Ulice (nepovinné)" />
    <q-input v-model="item.houseNr" label="Číslo popisné" />
    <q-input v-model="item.postalCode" label="PSČ" />
    <q-input v-model="item.note" label="Poznámka (nepovinné)" />
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { addressSchema } from '@/schemas/addressSchema';

// V tomto případě je položka typu Adresa
type ItemType = z.infer<typeof addressSchema>;

// Používáme defineModel pro obousměrnou vazbu na jednu položku
const item = defineModel<ItemType>({ required: true });
</script>