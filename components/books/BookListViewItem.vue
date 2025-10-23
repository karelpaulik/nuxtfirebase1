<template>
  <NuxtLink :to="`/${PAGE_NAME}/${doc.id}`">
    {{ doc.title }} {{ doc.author }} (Created Date: {{ doc.createdDate }}) {{ doc.currUserRef?.id }}
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
