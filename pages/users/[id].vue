<template>
  <div>
    <h4>Detail uživatele {{ route.params.id }}</h4>
    <div class="">
      <UserContainer class="q-ma-sm q-pa-sm" :documentId="route.params.id as string || 'new'" />
      <!-- <UserForm class="q-ma-sm q-pa-sm" documentId="7HLRz0fN8ZxEpFiWF8nC" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import UserContainer from '~/components/users/UserContainer.vue';

  const route = useRoute();
</script>