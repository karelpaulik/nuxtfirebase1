// composables/useStorageHandlers.ts
import { useUploadFile, useDeleteFile } from './useFireStorage';
import { useUpdateDoc } from './useFirestore';
import { notifyError, notify } from './useNotify';
import type { UserFormType } from '@/schemas/userSchema';
import { ref, type Ref } from 'vue';
import { cleanObject } from '~/utils/cleanObject';
import type { FormActions, FormState } from 'vee-validate';

export interface UploadedFile {
  url: string;
  name: string;
}

/**
 * Kompozitní funkce pro správu nahrávání a mazání souborů.
 * @param {string} collectionName Název kolekce, kam soubory patří.
 * @param {Ref<string | null>} docIdRef Ref na ID dokumentu, ke kterému soubory patří.
 * @param {Ref<UploadedFile[]>} filesRef Ref na pole nahraných souborů ve formuláři.
 * @param {FormState & FormActions} formVee Celý objekt formuláře z VeeValidate.
 */
export function useStorageHandlers(
  collectionName: string,
  docIdRef: Ref<string | null>,
  filesRef: Ref<UploadedFile[]>,
  formVee: FormState<UserFormType> & FormActions<UserFormType>
) {
  const isUploading = ref(false);
  const filesToUpload = ref<File[]>([]);

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
    const urls = await Promise.all(filePromises);// Čekáme na dokončení nahrávání souborů
    const newFiles = urls.map((url, index) => ({// Vytvoříme nová data pro pole files
      url,
      name: filesToUpload.value[index].name,
    }));    
    
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

  const handleRemoveFile = async (fileToRemove: UploadedFile) => {
    if (!docIdRef.value || docIdRef.value === 'new') {
      notify('Dokument není platný, nelze smazat soubor.', 'warning');
      return;
    }
    if (confirm(`Opravdu chcete smazat soubor '${fileToRemove.name}'?`)) {
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

  return {
    handleUpload,
    handleRemoveFile,
    isUploading,
    filesToUpload,
    updateDocInFirestore,
  };
}