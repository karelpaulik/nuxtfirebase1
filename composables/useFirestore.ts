import { doc, getDoc, collection, addDoc, updateDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore'
//const { $firestore } = useNuxtApp() //nelze volat na úrovní  modulu kvůli server side rendering

/**
 * Přidá nový dokument do zadané kolekce.
 * @param {string} collName Název kolekce.
 * @param {object} body Objekt s daty pro nový dokument.
 * @returns {Promise<string>} ID nově vytvořeného dokumentu.
 * @throws {Error} Pokud dojde k chybě při přidávání dokumentu.
 */
export const useAddColl = async(collName: string, body: object): Promise<string> => {
  try {
    const { $firestore } = useNuxtApp();
    const collRef = collection($firestore, collName);
    const docRef = await addDoc(collRef, body);
    console.log(`Dokument úspěšně přidán s ID: ${docRef.id} do kolekce '${collName}'.`);
    return docRef.id;
  } catch (e: any) { // Používáme 'any' pro typ chyby kvůli variabilitě typů chyb
      console.error(`Chyba při přidávání dokumentu do kolekce '${collName}':`, e.message || e);
      throw e;
  }
}

/**
 * Načte dokument z zadané kolekce podle ID.
 * @param {string} collName Název kolekce.
 * @param {string} docId ID dokumentu, který má být načten.
 * @returns {Promise<{ data: object, id: string } | null>} Objekt s daty a ID, nebo null, pokud dokument neexistuje/ID chybí.
 * @throws {Error} Pokud dojde k chybě při čtení dokumentu.
 */
export const useReadDoc = async(collName: string, docId: string): Promise<{ data: object, id: string } | null> => {
  try {
    const { $firestore } = useNuxtApp();
    const docRef = doc($firestore, collName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log(`Dokument s ID '${docId}' načten z kolekce '${collName}'.`);
        return { data: docSnap.data(), id: docSnap.id };
    } else {
        console.log(`useGetDoc: Dokument s ID '${docId}' v kolekci '${collName}' nenalezen.`);
        return null;
    }
  } catch (e: any) {
      console.error(`Chyba při čtení dokumentu s ID '${docId}' z kolekce '${collName}':`, e.message || e);
      throw e;
  }
}

// Příklad: Generické useReadDoc
// export const useReadDoc = async <T extends object>(collName: string, docId: string): Promise<{ data: T, id: string } | null> => {
//   try {
//     const { $firestore } = useNuxtApp();
//     const docRef = doc($firestore, collName, docId);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       console.log(`Dokument s ID '${docId}' načten z kolekce '${collName}'.`);
//       // Zde bychom `docSnap.data()` typovali přímo na `T`
//       return { data: docSnap.data() as T, id: docSnap.id };
//     } else {
//       console.log(`useGetDoc: Dokument s ID '${docId}' v kolekci '${collName}' nenalezen.`);
//       return null;
//     }
//   } catch (e: any) {
//     console.error(`Chyba při čtení dokumentu s ID '${docId}' z kolekce '${collName}':`, e.message || e);
//     throw e;
//   }
// }

/**
 * Smaže dokument z zadané kolekce podle ID.
 * @param {string} collName Název kolekce.
 * @param {string} docId ID dokumentu, který má být smazán.
 * @returns {Promise<boolean>} True, pokud bylo smazání úspěšné.
 * @throws {Error} Pokud dojde k chybě při mazání dokumentu.
 */
export const useDelDoc = async(collName: string, docId: string): Promise<boolean> => {
  if (!docId) {
    console.warn(`useDelDoc: Chybí ID dokumentu pro smazání v kolekci '${collName}'.`);
    throw new Error("ID dokumentu je povinné pro smazání."); // Měli byste vždy vyžadovat ID pro mazání
  }
  try {
    const { $firestore } = useNuxtApp();
    const docRef = doc($firestore, collName, docId);
    await deleteDoc(docRef);
    console.log(`Dokument s ID '${docId}' byl úspěšně smazán z kolekce '${collName}'.`);
    return true; // Indikuje úspěšné smazání
  } catch (e: any) {
    console.error(`Chyba při mazání dokumentu s ID '${docId}' z kolekce '${collName}':`, e.message || e);
    throw e;
  }
}


/**
 * Aktualizuje existující dokument ve Firestore.
 * @param {string} collName Název kolekce.
 * @param {string} docId ID dokumentu, který má být aktualizován.
 * @param {object} newData Objekt s daty, která se mají aktualizovat (merge).
 * @returns {Promise<boolean>} True, pokud byla aktualizace úspěšná.
 * @throws {Error} Pokud chybí ID nebo data, nebo dojde k chybě při aktualizaci.
 */
export const useUpdateDoc = async (collName: string, docId: string, newData: object): Promise<boolean> => {
  try {
    const { $firestore } = useNuxtApp();
    const docRef = doc($firestore, collName, docId);
    await updateDoc(docRef, newData); // updateDoc provede merge dat
    console.log(`Dokument s ID '${docId}' v kolekci '${collName}' byl úspěšně aktualizován.`);
    return true; // Úspěšná aktualizace
  } catch (e: any) {
    console.error(`useUpdateDoc: Chyba při aktualizaci dokumentu s ID '${docId}' v kolekci '${collName}':`, e.message || e);
    throw e;
  }
};

/**
 * Načte všechny dokumenty z zadané kolekce.
 * @param {string} collName Název kolekce.
 * @returns {Promise<Array<{ data: object, id: string }>>} Pole objektů, kde každý obsahuje data dokumentu a jeho ID.
 * @throws {Error} Pokud dojde k chybě při čtení dokumentů.
 */
export const useGetAllDocs = async (collName: string): Promise<Array<{ data: object, id: string }>> => {
  try {
    const { $firestore } = useNuxtApp();
    const collRef = collection($firestore, collName);
    const querySnapshot = await getDocs(collRef);
    const docs: Array<{ data: object, id: string }> = [];
    querySnapshot.forEach((doc) => {
      docs.push({ id: doc.id, data: doc.data() });
    });
    console.log(`Úspěšně načteno ${docs.length} dokumentů z kolekce '${collName}'.`);
    return docs;
  } catch (e: any) {
    console.error(`Chyba při načítání všech dokumentů z kolekce '${collName}':`, e.message || e);
    throw e;
  }
}