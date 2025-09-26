<template>
  <q-toolbar class="bg-blue-grey text-white shadow-2">
    <div v-if="formId === 'new'" class="row q-pa-xs">
      <q-btn 
        flat 
        stretch 
        no-caps 
        :disable="!hasChanges" 
        @click="emit('add-doc')" 
        label="Create new doc." 
        class="text-no-wrap" 
      />
    </div>

    <q-btn 
      v-if="formId !== 'new'" 
      flat 
      stretch 
      no-caps 
      :disable="!hasChanges" 
      label="Save changes" 
      @click="emit('update-doc', true)" 
      class="text-no-wrap" 
    />
    
    <q-btn 
      flat 
      stretch 
      no-caps 
      :disable="!hasChanges" 
      label="Revert changes" 
      @click="emit('revert-changes')" 
      class="text-no-wrap" 
    />

    <div v-if="formId !== 'new'" class="row no-wrap q-pa-xs">
      <q-btn 
        flat 
        stretch 
        no-caps 
        @click="emit('add-doc')" 
        label="Save as new doc." 
        class="text-no-wrap" 
      />
      <q-btn 
        flat 
        stretch 
        no-caps 
        @click="emit('del-doc')" 
        label="Del doc." 
        class="text-no-wrap" 
      />
    </div>

  </q-toolbar>
</template>

<script setup lang="ts">
// Definujeme Props pro stav (data dolů)
const props = defineProps<{
  formId: string | null;
  hasChanges: boolean;
}>();

/**
 * Definuje události, které tato komponenta vysílá (Events Up).
 * Událost 'update-doc' přijímá boolean pro argument 'confirmUpdate'.
 */
const emit = defineEmits<{
  (e: 'add-doc'): void;
  (e: 'update-doc', confirmUpdate: boolean): void; // Přidáme typ pro argument confirmUpdate
  (e: 'revert-changes'): void;
  (e: 'del-doc'): void;
}>();
</script>