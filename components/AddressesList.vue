//component/AddressesList.vue
<template>
  <div class="q-pa-md q-gutter-md">
    <div class="text-h4">Seznam adres:</div>
    <div class="column">
      <q-card
        v-for="(item, index) in items"
        :key="index"
        class="q-pa-md q-my-sm"
      >
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Položka {{ index + 1 }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="removeItem(index)" />
        </q-card-section>

        <q-card-section>
          <AddressForm v-model="items[index]" />
        </q-card-section>
      </q-card>
    </div>
    <q-btn label="Přidat adresu" @click="addNewItem" color="primary" class="q-my-md" />
  </div>
</template>

<script setup lang="ts">
import { createEmptyAddress, type AddressType as ItemType } from '@/schemas/addressSchema';
import AddressForm from './AddressForm.vue';

type ItemsArrayType = ItemType[];
const items = defineModel<ItemsArrayType>();

const addNewItem = () => {
  if (items.value) {
    items.value.push(createEmptyAddress());
  } else {
    items.value = [createEmptyAddress()];
  }
};

const removeItem = (index: number) => {
  if (items.value) {
    items.value.splice(index, 1);
  }
};
</script>