<template>
  <div>
    <q-list bordered separator v-if="fileModel">
      <ImageItem
        v-model="fileModel"       
        :is-downloading="currentDownloadingFileId === fileModel.currName" 
        :download-progress="currentDownloadingFileId === fileModel.currName ? downloadProgress : 0"
        @download-request="handleDownloadFile(fileModel)"
        @remove-file="removeItem(fileModel)"
      />
    </q-list>
    <div v-else>Žádný obrázek nebyl nahrán.</div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import ImageItem from './ImageItem.vue';
import type { FileSchemaType } from '@/schemas/fileSchema';
import { useStorageHandlers } from '~/composables/useStorageHandlers';
import { notify, notifyError } from '~/composables/useNotify'; 

// Vytvoření v-model pro jeden soubor (může být i null)
const fileModel = defineModel<FileSchemaType | null>({ required: true }); 

const props = defineProps<{
  formId: string | null;
  collectionName: string;
}>();

// Emitujeme pouze událost pro uložení
const emit = defineEmits(['save-request']);

// Získáváme VŠECHNY potřebné funkce a stavy POUZE ZDE
const {
  handleRemoveFile,
  handleDownloadFile,
  downloadProgress,
  currentDownloadingFileId,
} = useStorageHandlers(
  props.collectionName,
  toRef(props, 'formId'),
  fileModel as any, 
  () => { } // Prázdný callback VYPÍNÁ automatické ukládání do Firestore
);

/**
 * Odstraní soubor z úložiště a aktualizuje model.
 */
const removeItem = async (file: FileSchemaType) => {
    if (!confirm(`Opravdu chcete smazat soubor ${file.origName}? Tato akce je nevratná.`)) {
        return;
    }

    try {
        await handleRemoveFile(file); 
        
        fileModel.value = null;

        emit('save-request');
        notify(`Soubor '${file.origName}' byl úspěšně smazán a odstraněn z dokumentu.`, 'positive');
    } catch (error) {
        console.error('Chyba při mazání souboru:', error);
        notifyError('Mazání souboru selhalo. Změny nebyly uloženy.', error);
    }
};
</script>
