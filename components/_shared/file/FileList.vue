<template>
  <div class="q-gutter-sm">
    <q-list bordered separator v-if="filesModel && filesModel.length">
      <FileItem
        v-for="(file, index) in filesModel" 
        :key="file.url"
        v-model="filesModel[index]"       
        :is-downloading="currentDownloadingFileId === file.currName" 
        :download-progress="currentDownloadingFileId === file.currName ? downloadProgress : 0"
        @download-request="handleDownloadFile(file)"
        @remove-file="removeItem(file, index)"
      />
    </q-list>
    <div v-else>Žádné soubory nebyly nahrány.</div>
  </div>
</template>

<script setup lang="ts">
import { defineModel, defineProps, defineEmits, toRef } from 'vue';
import FileItem from './FileItem.vue';
import type { FileSchemaType } from '@/schemas/fileSchema';
import { useStorageHandlers } from '~/composables/useStorageHandlers';
import { notify, notifyError } from '~/composables/useNotify'; 

// Vytvoření v-model pro pole souborů (v-model="formData.files")
const filesModel = defineModel<FileSchemaType[]>({ required: true }); 

const props = defineProps<{
  formId: string | null;
  collectionName: string;
}>();

// Emitujeme pouze událost pro uložení
const emit = defineEmits(['save-request']);

// Získáváme VŠECHNY potřebné funkce a stavy POUZE ZDE
const {
  handleRemoveFile,     // Pro mazání (použito v removeItem)
  handleDownloadFile,   // Pro spuštění stahování (použito v handleFileDownload)
  downloadProgress,     // Stav pro progress bar (propouští se do FileItem)
  currentDownloadingFileId, // ID stahovaného souboru (propouští se do FileItem pro filtraci)
} = useStorageHandlers(
  props.collectionName,
  toRef(props, 'formId'),
  filesModel as any, 
  () => { } // Prázdný callback VYPÍNÁ automatické ukládání do Firestore
);

/**
 * Odstraní soubor z úložiště a aktualizuje pole filesModel.
 */
const removeItem = async (file: FileSchemaType, index: number) => {
    if (!confirm(`Opravdu chcete smazat soubor ${file.origName}? Tato akce je nevratná.`)) {
        return;
    }

    try {
        await handleRemoveFile(file); 
        
        if (filesModel.value) {
            filesModel.value.splice(index, 1);
        }

        emit('save-request');
        notify(`Soubor '${file.origName}' byl úspěšně smazán a odstraněn z dokumentu.`, 'positive');
    } catch (error) {
        console.error('Chyba při mazání souboru:', error);
        notifyError('Mazání souboru selhalo. Změny nebyly uloženy.', error);
    }
};
</script>