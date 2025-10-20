<script setup lang="ts">
import { useRoute } from 'vue-router';
import UserContainer from '~/components/users/UserContainer.vue';

const route = useRoute();

// Už není potřeba ref na formulář ani useConfirmRouteLeave, protože guard je v composable

</script>

<template>
  <div>
    <h4>Detail uživatele {{ route.params.id }}</h4>
    <div class="row">
      <UserContainer class="q-ma-sm q-pa-sm" :documentId="route.params.id as string || 'new'" />
      <!-- <UserForm class="q-ma-sm q-pa-sm" documentId="7HLRz0fN8ZxEpFiWF8nC" /> -->
    </div>
  </div>
</template>