<template>
  <ul>
    <li v-for="doc in documents" :key="doc.id" class="q-pa-xs">
      <BookListViewItem :doc="doc" :PAGE_NAME="PAGE_NAME" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import BookListViewItem from './BookListViewItem.vue';

defineProps({
  documents: {
    type: Array,
    required: true,
  },
  PAGE_NAME: {
    type: String,
    required: true,
  },
});
</script>
