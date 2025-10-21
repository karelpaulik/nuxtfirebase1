<template>
  <NuxtLink :to="`/${PAGE_NAME}/${doc.id}`">
    {{ doc.data.title }} {{ doc.data.author }} (Created Date: {{ doc.data.createdDate }}) {{ doc.data.currUserRef?.id }}
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps({
  doc: {
    type: Object,
    required: true,
  },
  PAGE_NAME: {
    type: String,
    required: true,
  },
});
</script>
