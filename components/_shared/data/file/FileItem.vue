<template>
  <q-item v-if="fileModel">
    <q-item-section>
      <q-item-label caption><a :href="fileModel.url" target="_blank">{{ fileModel.origName }}</a></q-item-label>
      <q-item-label caption v-if="fileModel.note">
        Poznámka: {{ fileModel.note }}
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <div class="row items-center q-gutter-xs">
        
        <q-btn
          icon="view_in_ar"
          color="secondary"
          round
          flat
          dense
          @click="openModelViewer"
          :disable="!fileModel.url"
          title="Otevřít v 3D prohlížeči"
        />
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

// --- KONFIGURACE A LOGIKA PRO 3D PROHLÍŽEČ --------------------------------------

// Cesta ke stránce, která obsahuje JavaScript pro načítání 3D modelu
// ZAJISTI, ABY TATO CESTA VEDLA NA STRÁNKU, KDE JE TVŮJ JAVASCRIPT
const VIEWER_PAGE_PATH = '/3dviewer/stl_viewer_34.html'; 

/**
 * Vytvoří kompletní URL pro prohlížeč s parametry 'model' a 'name'.
 * Příklad výstupu: /111_stl_viewer_33.html?model=https%3A%2F%2Ffirebase.zip&name=muj_dil.zip
 */
const modelViewerLink = computed(() => {
    // KLÍČOVÁ PODMÍNKA: Pokud URL NEBO Název neexistují, vrátí '#'.
    // Tímto se zajišťuje, že obě hodnoty musí existovat, aby kód pokračoval.
    if (!fileModel.value.url || !fileModel.value.origName) {
        return '#'; 
    }

    const params = new URLSearchParams();
    
    // Obě hodnoty jsou garantovány úvodní kontrolou, takže je můžeme bezpečně nastavit.
    params.set('model', fileModel.value.url); 
    params.set('name', fileModel.value.origName); 
    
    const generatedLink = `${VIEWER_PAGE_PATH}?${params.toString()}`;
    console.log('Vygenerovaný odkaz na 3D prohlížeč:', generatedLink);

    return generatedLink;
});

/**
 * Otevře sestavený odkaz v nové záložce.
 */
const openModelViewer = () => {
    if (modelViewerLink.value && modelViewerLink.value !== '#') {
        window.open(modelViewerLink.value, '_blank');
    }
};
// Konec bloku pro 3D prohlížeč --------------------------------------

// Model pro JEDNOTLIVÝ soubor (v-model)
const fileModel = defineModel<FileSchemaType>({ required: true }); 

// Definuje props s defaultními hodnotami pomocí `withDefaults`
const props = withDefaults(defineProps<{
    isDownloading?: boolean; // Změněno na volitelné
    downloadProgress?: number; // Změněno na volitelné
}>(), {
    isDownloading: false, // Defaultní hodnota: false
    downloadProgress: 0,  // Defaultní hodnota: 0
});

// NOVÉ EMITY: Událost pro stahování nese s sebou data souboru
const emit = defineEmits(['remove-file', 'download-request']); 

// --- LOGIKA PRO POZNÁMKY (nezměněno) ---
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
</script>