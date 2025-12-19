<template>
  <q-item v-if="fileModel && isImage">
    <q-item-section>
      <q-img
          :src="fileModel.url"
          :alt="fileModel.origName"
          style="width: 100px; height: 100px;"
          fit="contain"
      />
      <q-item-label caption><a :href="fileModel.url" target="_blank">{{ fileModel.origName }}</a></q-item-label>
      <q-item-label caption v-if="fileModel.note">
        {{ fileModel.note }}
      </q-item-label>
    </q-item-section>



    <q-item-section side>
      <div class="row items-center q-gutter-xs">
        <q-btn
          v-if="!isDownloading"
          icon="download"
          color="primary"
          round
          flat
          dense
          @click="emit('download-request', fileModel)" 
          title="Stáhnout soubor"
        />
        <q-circular-progress
          v-else
          :value="downloadProgress"
          size="24px"
          :thickness="0.2"
          color="primary"
          :title="`Stahování ${downloadProgress.toFixed(0)}%`"
        />

        <q-btn
          icon="edit_note"
          color="primary"
          round
          flat
          dense
          @click="openNoteDialog"
          title="Přidat/upravit poznámku"
        />

        <q-btn
          icon="delete"
          color="negative"
          round
          flat
          dense
          @click="emit('remove-file')"
          title="Smazat soubor"
        />
      </div>
    </q-item-section>
  </q-item>

  <q-dialog v-model="showNoteDialog">
    <q-card style="width: 350px">
      <q-card-section>
        <div class="text-h6">Poznámka k souboru</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input
          v-model="currentNote"
          filled
          type="textarea"
          placeholder="Zadejte poznámku..."
        />
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Zrušit" v-close-popup />
        <q-btn flat label="Uložit" @click="saveNote" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FileSchemaType } from '@/schemas/fileSchema';

// Model pro JEDNOTLIVÝ soubor (v-model)
const fileModel = defineModel<FileSchemaType>({ required: true }); 

  // Definuje props s defaultními hodnotami pomocí `withDefaults`
const props = withDefaults(defineProps<{
    isDownloading?: boolean;
    downloadProgress?: number;
}>(), {
    isDownloading: false,
    downloadProgress: 0,
});

// NOVÉ EMITY: Událost pro stahování nese s sebou data souboru
const emit = defineEmits(['remove-file', 'download-request']); 

// --- LOGIKA PRO POZNÁMKY ---
const showNoteDialog = ref(false);
const currentNote = ref('');

const openNoteDialog = () => {
    currentNote.value = fileModel.value.note || '';
    showNoteDialog.value = true;
};

/**
 * Uloží poznámku a signalizuje rodiči, že se změnil stav (hasChanges = true).
 */
const saveNote = () => {
    fileModel.value.note = currentNote.value; 
    fileModel.value = fileModel.value; 
    showNoteDialog.value = false;
};

const isImage = computed(() => {
    if (!fileModel.value.fileType) return false;
    return fileModel.value.fileType.startsWith('image/');
});
</script>