// composables/useStorageHandlers.ts
import { useUploadFile, useDeleteFile } from './useFireStorage';
import { useUpdateDoc } from './useFirestore';
import { notifyError, notify } from './useNotify';
import type { UserFormType } from '@/schemas/userSchema';
import { ref, type Ref } from 'vue';
import { cleanObject } from '~/utils/cleanObject';
import type { FormActions, FormState } from 'vee-validate';

// Import typu ze separátního souboru
import type { FileSchemaType } from '@/schemas/fileSchema';
interface StoredFile extends FileSchemaType {
  uploadProgress?: number; // Nová volitelná vlastnost pro průběh nahrávání
}

/**
 * Kompozitní funkce pro správu nahrávání a mazání souborů.
 * @param {string} collectionName Název kolekce, kam soubory patří.
 * @param {Ref<string | null>} docIdRef Ref na ID dokumentu, ke kterému soubory patří.
 * @param {Ref<StoredFile[]>} filesRef Ref na pole nahraných souborů ve formuláři.
 * @param {(updatedFiles: StoredFile[]) => Promise<void>} updateDocCallback Callback funkce pro aktualizaci dokumentu
 */
export function useStorageHandlers(
  collectionName: string,
  docIdRef: Ref<string | null>,
  filesRef: Ref<StoredFile[]>,
  updateDocCallback: (updatedFiles: StoredFile[]) => Promise<void>
) {
  const isUploading = ref(false);
  const filesToUpload = ref<File[]>([]);
  const downloadProgress = ref(0); // Nová reaktivní proměnná pro zobrazení průběhu stahování
  const uploadProgress = ref(0); // Nová reaktivní proměnná pro zobrazení průběhu nahrávání
  const currentDownloadingFileId = ref<string | null>(null); // Ukládá ID souboru, který se právě stahuje. Jinak by se progres stahování zobrazoval u všech souborů.

  const handleUpload = async () => {
    if (!docIdRef.value || docIdRef.value === 'new') {// Pokud je ID dokumentu buď "new", nebo null, nebo undefined. null + undefined: neočekávané stavy.
      notify('Nejdříve uložte formulář, abyste mohli nahrávat soubory.', 'warning');
      return;
    }

    if (!filesToUpload.value.length) {
      notify('Nejsou vybrány žádné soubory k nahrání.', 'info');
      return;
    }

    isUploading.value = true;
    uploadProgress.value = 0; // Resetování průběhu na 0

    try {
      // Nyní se dá nahrávat buď 1. paraleně, nebo 2. sekvenčně 

      // Paralelní nahrávání. Rychlejší, ale progress je progress náhodného souboru.
      // const filePromises = filesToUpload.value.map(file => useUploadFile(`${collectionName}/${docIdRef.value}`, file, (progress: number) => uploadProgress.value = progress));// Vytoření pole promises pro paralelní nahrávání více souborů. Nic ale nenahrává.
      // const newFiles = await Promise.all(filePromises);// Čekáme na dokončení nahrávání souborů, nyní se vrací objekt s metadaty

      // Sekvenční nahrávání: Procházíme soubory jeden po druhém pomocí for...of. Pomalejší, ale jasný význam progressu.
      const newFiles: StoredFile[] = [];
      let fileIndex = 0; // Sledování indexu nahráváného souboru
      for (const file of filesToUpload.value) {
        fileIndex++;
        notify(`Nahrávám soubor ${fileIndex} z ${filesToUpload.value.length}`);
        const uploadedFile = await useUploadFile(`${collectionName}/${docIdRef.value}`, file, (progress: number) => uploadProgress.value = progress);
        newFiles.push(uploadedFile);
      }

      const updatedFiles = [...filesRef.value, ...newFiles];// Přidáme nová data k existujícím
      await updateDocCallback(updatedFiles); // Aktualizujeme přes callback
      filesToUpload.value = [];
      notify('Všechny soubory byly úspěšně nahrány a uloženy!', 'positive');
    } catch (e: any) {
      notifyError('Nahrávání souborů selhalo:', e);
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0; // Zajistíme, že progress bar zmizí
    }
  };

  const handleRemoveFile = async (fileToRemove: StoredFile) => {
    if (!docIdRef.value || docIdRef.value === 'new') {
      notify('Dokument není platný, nelze smazat soubor.', 'warning');
      return;
    }
    //if (confirm(`Opravdu chcete smazat soubor '${fileToRemove.origName}'?`)) {
      try {
        await useDeleteFile(fileToRemove.url);
        // const updatedFiles = filesRef.value.filter((file) => file.url !== fileToRemove.url);
        // await updateDocCallback(updatedFiles); // Aktualizujeme přes callback
        // notify('Soubor byl úspěšně smazán a odstraněn z dokumentu.', 'positive');
      } catch (e: any) {
        notifyError('Mazání souboru selhalo:', e);
      }
    //}
  };

  const handleDownloadFile = async (file: StoredFile) => {
    currentDownloadingFileId.value = file.currName; // Zde použijeme currName jako dočasné ID
    downloadProgress.value = 0; // Resetování průběhu

    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`Chyba při stahování: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      let downloadedBytes = 0;

      const reader = response.body?.getReader();
      const chunks = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          chunks.push(value);
          downloadedBytes += value.length;
          const progress = totalBytes > 0 ? (downloadedBytes / totalBytes) * 100 : 0;
          downloadProgress.value = progress;
        }
      } else {
        const blob = await response.blob();
        chunks.push(blob);
        downloadProgress.value = 100;
      }

      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.origName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notify(`Soubor '${file.origName}' byl úspěšně stažen!`, 'positive');

    } catch (e: any) {
      notifyError('Stahování souboru selhalo:', e);
    } finally {
      currentDownloadingFileId.value = null; // Resetování ID po dokončení
      downloadProgress.value = 0; // Ujistí se, že progress bar zmizí
    }
  };

  return {
    handleUpload,
    handleRemoveFile,
    handleDownloadFile,
    isUploading,
    filesToUpload,
    downloadProgress, // Průběh stahování
    currentDownloadingFileId, // Id stahovaného souboru.
    uploadProgress, // Průběh uploadu
  };
}