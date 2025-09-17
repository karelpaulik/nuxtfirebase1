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
interface StoredFile extends FileSchemaType {}//Pro případné budoucí rozžíření schematu. Např. uploadProgress

/**
 * Kompozitní funkce pro správu nahrávání a mazání souborů.
 * @param {string} collectionName Název kolekce, kam soubory patří.
 * @param {Ref<string | null>} docIdRef Ref na ID dokumentu, ke kterému soubory patří.
 * @param {Ref<StoredFile[]>} filesRef Ref na pole nahraných souborů ve formuláři.
 * @param {FormState & FormActions} formVee Celý objekt formuláře z VeeValidate.
 */
export function useStorageHandlers(
  collectionName: string,
  docIdRef: Ref<string | null>,
  filesRef: Ref<StoredFile[]>,
  formVee: FormState<UserFormType> & FormActions<UserFormType>
) {
  const isUploading = ref(false);
  const filesToUpload = ref<File[]>([]);
  const downloadProgress = ref(0); // Nová reaktivní proměnná pro zobrazení průběhu
  const currentDownloadingFileId = ref<string | null>(null); // Ukládá ID souboru, který se právě stahuje. Jinak se by progres stahování zobrazoval u všech souborů.

  // Funkce pro aktualizaci dokumentu.
  const updateDocInFirestore = async (newData: Partial<UserFormType>) => {
    if (!docIdRef.value || docIdRef.value === 'new') return;
  
    const dataToUpdate = { ...formVee.values, ...newData };// Vytvoříme dočasný objekt s daty pro aktualizaci
    const cleanedData = cleanObject(dataToUpdate);// Vyčištění dat od undefined hodnoty.
  
    // Aktualizace ve Firestore
    try {
      const success = await useUpdateDoc(collectionName, docIdRef.value, cleanedData);
      if (success) {
        formVee.resetForm({ values: dataToUpdate as UserFormType });// Po úspěšné aktualizaci resetujeme formulář s novými hodnotami
        // notify('Dokument byl úspěšně aktualizován!', 'positive'); // Notifikace se posílá z useStorageHandlers
      }
    } catch (e: any) {
      // notifyError('Chyba při aktualizaci dokumentu po nahrání souborů:', e); // Notifikace se posílá z useStorageHandlers
      throw e; // Přepošleme chybu pro další zpracování
    }
  };

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

    try {
      const filePromises = filesToUpload.value.map(file => useUploadFile(`${collectionName}/${docIdRef.value}`, file));// Vytoření pole promises pro paralelní nahrávání více souborů. Nic ale nenahrává.
      const newFiles = await Promise.all(filePromises);// Čekáme na dokončení nahrávání souborů, nyní se vrací objekt s metadaty

      const updatedFiles = [...filesRef.value, ...newFiles];// Přidáme nová data k existujícím
      await updateDocInFirestore({ files: updatedFiles });// Aktualizujeme Firestore a čekáme na potvrzení   
      filesRef.value = updatedFiles;// Teprve po úspěšné aktualizaci Firestore aktualizujeme lokální stav
      filesToUpload.value = [];    
      notify('Všechny soubory byly úspěšně nahrány a uloženy!', 'positive');
    } catch (e: any) {
      notifyError('Nahrávání souborů selhalo:', e);
    } finally {
      isUploading.value = false;
    }
  };

  const handleRemoveFile = async (fileToRemove: StoredFile) => {
    if (!docIdRef.value || docIdRef.value === 'new') {
      notify('Dokument není platný, nelze smazat soubor.', 'warning');
      return;
    }
    if (confirm(`Opravdu chcete smazat soubor '${fileToRemove.origName}'?`)) {
      try {
        await useDeleteFile(fileToRemove.url);
        filesRef.value = filesRef.value.filter(file => file.url !== fileToRemove.url);// Odstranění souboru z pole: formData.files
        await updateDocInFirestore({ files: filesRef.value });// Aktualizace dokumentu ve Firestore

        notify('Soubor byl úspěšně smazán a odstraněn z dokumentu.', 'positive');
      } catch (e: any) {
        notifyError('Mazání souboru selhalo:', e);
      }
    }
  };

  /**
   * Stáhne soubor pomocí URL, zobrazí průběh a použije jeho původní název.
   * Vytvoří dočasný <a> element a programově na něj klikne.
   */
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
    updateDocInFirestore,
    downloadProgress, // Průběh stahování
    currentDownloadingFileId // Id stahovaného souboru.
  };
}