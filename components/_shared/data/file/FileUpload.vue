<template>
  <div class="q-gutter-sm">
    <q-file
      v-model="filesToUpload"
      label="Vyberte soubory"
      :multiple="multiple"
      dense
      outlined
      class="q-mb-md"
      :disable="isDisabled"
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
          :disable="isDisabled"
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
import { toRef, computed } from 'vue';
import { useStorageHandlers } from '~/composables/useStorageHandlers';
import type { FileSchemaType } from '@/schemas/fileSchema';

const props = defineProps<{
    formId: string | null;
    collectionName: string;
    multiple: boolean;
}>();

const model = defineModel<FileSchemaType | FileSchemaType[] | null>({
    required: true,
});

const emit = defineEmits(['save-request']);

const isDisabled = computed((): boolean => {
    return isUploading.value || !props.formId || props.formId === 'new';
});

const {
    handleUpload,
    handleRemoveFile,
    isUploading,
    filesToUpload,
    uploadProgress,
} = useStorageHandlers(
    props.collectionName,
    toRef(props, 'formId'),
    model,
    async (updatedFiles: FileSchemaType[] | FileSchemaType) => { // Callback pro aktualizaci a uložení

      //Pouze pro režim single(ne-multiple), v režimu multiple se soubory přidávají.
      const oldFile = model.value as FileSchemaType | null;
      if (!props.multiple && oldFile && oldFile.url && !Array.isArray(updatedFiles)) { // 1. Jestliže jsme v režimu single(ne-multiple) AND jestli existuje již nahraný soubor AND jestli updatedFiles nejsou pole, pak
          if (oldFile.url !== updatedFiles.url) { // Pojistka (nepravděpodobná) - mažu opravdu starý soubor
              await handleRemoveFile(oldFile);
          }
      }
      
      model.value = updatedFiles;
      emit('save-request');
    }
);
</script>