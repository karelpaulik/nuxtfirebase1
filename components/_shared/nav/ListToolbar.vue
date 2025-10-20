<template>
  <q-toolbar class="bg-blue-grey text-white shadow-2">
    <q-btn flat stretch no-caps @click="navigateTo(`/${pageName}/new`)" label="Nový záznam" />
  </q-toolbar>
</template>

<script setup lang="ts">
defineProps({
  pageName: { type: String, required: true },
});
</script>
