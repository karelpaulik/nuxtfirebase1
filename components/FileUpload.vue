<template>
  <div class="q-gutter-sm">
    <q-file
      v-model="filesToUpload"
      label="Vyberte soubory"
      multiple
      dense
      outlined
      class="q-mb-md"
      :disable="!formId || formId === 'new'"
    >
      <template v-slot:prepend>
        <q-icon name="attach_file" />
      </template>
      <template v-slot:after>
        <q-btn
          round
          dense
          flat
          icon="cloud_upload"
          @click="handleUpload"
          :disable="!filesToUpload.length || isUploading || !formId || formId === 'new'"
          :loading="isUploading"
          title="Nahrát vybrané soubory"
        />
      </template>
      <template v-slot:hint v-if="!formId || formId === 'new'">
        <span class="text-negative">Nejdříve uložte formulář pro nahrání souborů</span>
      </template>
    </q-file>

    <div v-if="isUploading">
      <q-linear-progress
        :value="uploadProgress / 100"
        color="primary"
        stripe
        rounded
        animation-speed="200"
        class="q-mt-sm"
        style="height: 16px"
      >
        <div class="absolute-full flex flex-center">
          <q-badge
            color="white"
            text-color="primary"
            :label="`${uploadProgress.toFixed(0)}%`"
          />
        </div>
      </q-linear-progress>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue';
import { useStorageHandlers } from '~/composables/useStorageHandlers';
import type { FileSchemaType } from '@/schemas/fileSchema';

const props = defineProps<{
  formId: string | null;
  collectionName: string;
  files: FileSchemaType[];
}>();

// Definice emit událostí
const emit = defineEmits(['update:files', 'save-request']);

// Místní reaktivní stav pro soubory, který synchronizujeme s propsem
//const localFiles = ref<FileSchemaType[]>(props.files);
const localFiles = ref<FileSchemaType[]>(structuredClone(toRaw(props.files)));

// Hlídáme změny v `files` props a aktualizujeme `localFiles`
// To je důležité pro jednosměrný datový tok
watch(
  () => props.files,
  (newFiles) => {
    localFiles.value = newFiles;
  },
  { deep: true }
);

// Používáme useStorageHandlers composable
const {
  handleUpload,
  isUploading,
  filesToUpload,
  uploadProgress,
} = useStorageHandlers(
  props.collectionName,
  toRef(props, 'formId'),
  localFiles,
  (updatedFiles) => { // Callback pro aktualizaci a uložení
    emit('update:files', updatedFiles);
    emit('save-request');
  }
);
</script>