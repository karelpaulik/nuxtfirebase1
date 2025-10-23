<template>
  <NuxtLink :to="`/${PAGE_NAME}/${doc.id}`">
    {{ doc.title }} {{ doc.author }} (Created Date: {{ doc.createdDate }}) {{ doc.currUserRef?.id }}
  </NuxtLink>
</template>

<script setup lang="ts">
import type { BookApiType } from '@/schemas/bookSchema';

// Type-based declaration, doporučovaný přístup pro composition API. Dále existuje: Runtime declaration
defineProps<{
  doc: BookApiType,
  PAGE_NAME: string,
}>();

</script>
