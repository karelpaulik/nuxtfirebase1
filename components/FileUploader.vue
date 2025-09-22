<template>
  <div class="q-gutter-sm">
    <h4>Soubory</h4>

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

    <q-list bordered separator v-if="files && files.length">
      <q-item v-for="file in files" :key="file.url">
        <q-item-section>
          <q-item-label>{{ file.origName }}</q-item-label>
          <q-item-label caption v-if="file.note">
            Note: {{ file.note }}
          </q-item-label>
          <q-item-label caption><a :href="file.url" target="_blank">{{ file.origName }}</a></q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center q-gutter-xs">
            <q-btn
              v-if="currentDownloadingFileId !== file.currName"
              icon="download"
              color="primary"
              round
              flat
              dense
              @click="handleDownloadFile(file)"
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
              @click="openNoteDialog(file)"
              title="Přidat/upravit poznámku"
            />
            <q-btn
              icon="delete"
              color="negative"
              round
              flat
              dense
              @click="handleRemoveFile(file)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <div v-else>Žádné soubory nebyly nahrány.</div>
    
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useStorageHandlers } from '~/composables/useStorageHandlers';
import type { FileSchemaType } from '@/schemas/fileSchema';

const props = defineProps<{
  formId: string | null;
  collectionName: string;
  files: FileSchemaType[];
  targetPath: string[]; //Zanořená cesta např. pro person.files: ['person', 'files']
}>();

// Definice emit událostí
const emit = defineEmits(['update:files']);

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
  handleRemoveFile,
  handleDownloadFile,
  isUploading,
  filesToUpload,
  downloadProgress,
  currentDownloadingFileId,
  uploadProgress,
} = useStorageHandlers(
  props.collectionName,
  ref(props.formId),
  localFiles,
  (updatedFiles) => emit('update:files', props.targetPath, updatedFiles)
);

// --- LOGIKA PRO POZNÁMKY ---
const showNoteDialog = ref(false);
const currentNote = ref('');
const fileToUpdate = ref<FileSchemaType | null>(null);

/**
 * Otevře dialogové okno pro přidání/editaci poznámky.
 */
const openNoteDialog = (file: FileSchemaType) => {
  fileToUpdate.value = file;// Uložení objektu souboru, který se má aktualizovat
  currentNote.value = file.note || ''; // Načte existující poznámku, pokud existuje
  showNoteDialog.value = true;
};

/**
 * Uloží poznámku do lokálního stavu a následně emituje událost pro aktualizaci nadřazené komponenty.
 */
const saveNote = async () => {
  if (!fileToUpdate.value) return;

  // Aktualizace poznámky v lokálním stavu
  fileToUpdate.value.note = currentNote.value;

  // Emitování události s aktualizovaným polem souborů
  // Díky tomu, že `localFiles` je ref a je propojen s propsem `files`, můžeme emitovat `update:files` přímo s `localFiles.value`
  emit('update:files', props.targetPath, localFiles.value);

  // Vyčistíme stavy dialogu
  currentNote.value = '';
  fileToUpdate.value = null;
};
</script>