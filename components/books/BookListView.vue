<template>
  <ul>
    <li v-for="doc in documents" :key="doc.id" class="q-pa-xs">
      <BookListViewItem :doc="doc" :PAGE_NAME="PAGE_NAME" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { BookApiType } from '@/schemas/bookSchema';
import BookListViewItem from './BookListViewItem.vue';

defineProps<{
  documents: BookApiType[],
  PAGE_NAME: string,
}>();
</script>
