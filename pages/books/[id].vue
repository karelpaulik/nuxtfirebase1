<script setup lang="ts">
import { useRoute } from 'vue-router';
import BookDetail from '@/components/books/BookDetail.vue';

const route = useRoute();

// Už není potřeba ref na formulář ani useConfirmRouteLeave, protože guard je v composable

</script>

<template>
  <div>
    <h4>Detail knihy {{ route.params.id }}</h4>
    <BookDetail class="q-ma-sm q-pa-sm" :documentId="route.params.id as string || 'new'" />
  </div>
</template>