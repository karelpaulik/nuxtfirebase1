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
import { ref, toRef } from 'vue';
import { useStorageHandlers } from '~/composables/useStorageHandlers';
import type { FileSchemaType } from '@/schemas/fileSchema';

const props = defineProps<{
  formId: string | null;
  collectionName: string;
}>();

const files = defineModel<FileSchemaType[]>({
  required: true,
  defaultValue: [], 
});

const emit = defineEmits(['save-request']);

const {
  handleUpload,
  isUploading,
  filesToUpload,
  uploadProgress,
} = useStorageHandlers(
  props.collectionName,
  toRef(props, 'formId'),
  files, 
  (updatedFiles: FileSchemaType[]) => { // Callback pro aktualizaci a uložení
    files.value = updatedFiles;     
    emit('save-request');
  }
);
</script>