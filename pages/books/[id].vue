<script setup lang="ts">
import { useRoute } from 'vue-router';
import BookForm from '@/components/books/BookForm.vue';

const route = useRoute();

// Už není potřeba ref na formulář ani useConfirmRouteLeave, protože guard je v composable

</script>

<template>
  <div>
    <h2>Detail knihy {{ route.params.id }}</h2>
    <BookForm class="q-ma-sm q-pa-sm" :documentId="route.params.id as string || 'new'" />
  </div>
</template>