// composables/useFireStorage.ts
import {
  ref as storageRef,
  uploadBytesResumable, // Změna: Použijeme resumable upload
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { notifyError, notify } from './useNotify';
import { v4 as uuidv4 } from 'uuid'; // Pro generování unikátního názvu
import type { FileSchemaType } from '@/schemas/fileSchema';

/**
 * Nahraje soubor do Firebase Storage pod unikátním jménem (UUID.pripona) a poskytuje průběh nahrávání.
 * @param {string} path Cesta v rámci Storage (např. 'images/avatars').
 * @param {File} file Objekt souboru k nahrání.
 * @param {Function} onProgress Callback funkce pro aktualizaci průběhu.
 * @returns {Promise<FileSchemaType>} Objekt s metadaty nahraného souboru.
 */
export const useUploadFile = async (path: string, file: File, onProgress: (progress: number) => void): Promise<FileSchemaType> => {
  try {
    const { $fireStorage } = useNuxtApp();

    const parts = file.name.split('.');//parts: Je to pole, skládající se z jednotlivých částí souboru, kde rozdělovač je: "."
    const fileExtension = parts.length > 1 ? parts.pop() : ''; // Získá příponu, nebo prázdný řetězec, pokud soubor nemá příponu.
    const newFileName = `${uuidv4()}${fileExtension ? '.' + fileExtension : ''}`;// Generování unikátního názvu pro soubor (UUID.pripona)  

    const fileRef = storageRef($fireStorage, `${path}/${newFileName}`);// Vytvoření reference na soubor s unikátním názvem

    // Používáme uploadBytesResumable pro sledování průběhu
    const uploadTask = uploadBytesResumable(fileRef, file);

    // Vracíme Promise, která se vyřeší, když je nahrávání dokončeno
    return new Promise((resolve, reject) => {
      // Sledujeme stav nahrávacího úkolu
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Získáváme průběh nahrávání, např. 50%
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          // Obsluha neúspěšného nahrání
          notifyError(`Chyba při nahrávání souboru '${file.name}':`, error);
          reject(error);
        },
        async () => {
          // Obsluha úspěšného nahrání
          notify(`Soubor '${file.name}' úspěšně nahrán!`, 'positive');
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Vrátíme objekt s požadovanými metadaty
          resolve({
            origName: file.name,
            currName: newFileName,
            url: downloadURL,
            fileSize: file.size,
            fileType: file.type,
            uploadedDate: new Date(), // Přidání aktuálního data a času
          });
        }
      );
    });
  } catch (e: any) {
    notifyError(`Chyba při nahrávání souboru '${file.name}':`, e);
    throw e;
  }
};

/**
 * Smaže soubor z Firebase Storage podle jeho URL.
 * @param {string} fileUrl URL adresa souboru ke smazání.
 * @returns {Promise<boolean>} True, pokud bylo smazání úspěšné.
 */
export const useDeleteFile = async (fileUrl: string): Promise<boolean> => { //fileUrl: může být 1.URL souboru (vrácené z: getDownloadURL), nebo 2. filePath (např. upload/1.png)
  try {
    const { $fireStorage } = useNuxtApp();
    const fileRef = storageRef($fireStorage, fileUrl);
    await deleteObject(fileRef);
    notify('Soubor byl úspěšně smazán!', 'positive');
    return true;
  } catch (e: any) {
    notifyError('Chyba při mazání souboru:', e);
    throw e;
  }
};