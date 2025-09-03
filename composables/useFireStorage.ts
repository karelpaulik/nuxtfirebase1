// composables/useFireStorage.ts
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { notifyError, notify } from './useNotify';

/**
 * Nahraje soubor do Firebase Storage.
 * @param {File} file Objekt souboru k nahrání.
 * @param {string} path Cesta v rámci Storage (např. 'images/avatars').
 * @returns {Promise<string>} URL adresa nahraného souboru.
 */
export const useUploadFile = async (path: string, file: File): Promise<string> => {
  try {
    const { $fireStorage } = useNuxtApp();
    const fileRef = storageRef($fireStorage, `${path}/${file.name}`);
    const uploadTask = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(uploadTask.ref);
    notify(`Soubor '${file.name}' úspěšně nahrán!`, 'positive');
    return downloadURL;
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