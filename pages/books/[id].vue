<template>
  <div>
    <h4>Detail knihy {{ route.params.id }}</h4>
    <BookContainer class="q-ma-sm q-pa-sm" :documentId="route.params.id as string || 'new'" />
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import BookContainer from '~/components/books/BookContainer.vue';

  const route = useRoute();
</script>