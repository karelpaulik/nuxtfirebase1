// composables/useFirestore.ts
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  or, // Import pro OR dotazy
  limit,
  startAfter,
  orderBy,
} from 'firebase/firestore'
import type { WhereFilterOp, QueryDocumentSnapshot } from 'firebase/firestore';
// const { $firestore } = useNuxtApp() //nelze volat na úrovní  modulu kvůli server side rendering


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
  } catch (e: any) {
      notifyError(`Chyba při přidávání dokumentu do kolekce '${collName}':`, e);
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
      notifyError(`Chyba při čtení dokumentu s ID '${docId}' z kolekce '${collName}':`, e);
      throw e;
  }
}

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
    throw new Error("ID dokumentu je povinné pro smazání.");
  }
  try {
    const { $firestore } = useNuxtApp();
    const docRef = doc($firestore, collName, docId);
    await deleteDoc(docRef);
    console.log(`Dokument s ID '${docId}' byl úspěšně smazán z kolekce '${collName}'.`);
    return true;
  } catch (e: any) {
    notifyError(`Chyba při mazání dokumentu s ID '${docId}' z kolekce '${collName}':`, e);
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
    await updateDoc(docRef, newData);
    console.log(`Dokument s ID '${docId}' v kolekci '${collName}' byl úspěšně aktualizován.`);
    return true;
  } catch (e: any) {
    notifyError(`useUpdateDoc: Chyba při aktualizaci dokumentu s ID '${docId}' v kolekci '${collName}':`, e);
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
    querySnapshot.forEach((documentSnapshot) => { // <--- ZMĚNA ZDE: Přejmenováno 'doc' na 'documentSnapshot'
      docs.push({ id: documentSnapshot.id, data: documentSnapshot.data() });
    });
    console.log(`Úspěšně načteno ${docs.length} dokumentů z kolekce '${collName}'.`);
    return docs;
  } catch (e: any) {
    notifyError(`Chyba při načítání všech dokumentů z kolekce '${collName}':`, e);
    throw e;
  }
}

/**
 * Načte dokumenty z dané kolekce s použitím jednoho nebo více filtrů.
 *
 * @param {string} collName Název kolekce.
 * @param {Array<{ field: string; operator: WhereFilterOp; value: any }>} filters Pole objektů definujících filtry.
 * @returns {Promise<Array<{ data: object, id: string }>>} Pole filtrovaných dokumentů.
 * @throws {Error} Pokud dojde k chybě při načítání.
 */
export const useReadDocsByFilter = async (
  collName: string,
  filters: Array<{ field: string; operator: WhereFilterOp; value: any }> 
): Promise<Array<{ data: object, id: string }>> => {
  try {
    const { $firestore } = useNuxtApp();
    const collRef = collection($firestore, collName);
    
    let q = query(collRef); 

    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });

    const querySnapshot = await getDocs(q);
    const docs: Array<{ data: object, id: string }> = [];
    querySnapshot.forEach((documentSnapshot) => { // <--- ZMĚNA ZDE: Přejmenováno 'doc' na 'documentSnapshot'
      docs.push({ id: documentSnapshot.id, data: documentSnapshot.data() });
    });
    console.log(`Úspěšně načteno ${docs.length} filtrovaných dokumentů z kolekce '${collName}'.`);
    return docs;
  } catch (e: any) {
    notifyError(`Chyba při načítání filtrovaných dokumentů z kolekce '${collName}':`, e);
    throw e;
  }
};

export const useGetDocsWithPagination = async (
  collName: string,
  limitNum: number,
  startAfterDoc: QueryDocumentSnapshot | null,
  filters: Array<{ field: string; operator: WhereFilterOp; value: any }> = [],
  orderByField: string | null = null,
): Promise<{ docs: Array<{ data: object, id: string }>, lastVisible: QueryDocumentSnapshot | null }> => {
  try {
    const { $firestore } = useNuxtApp();
    const collRef = collection($firestore, collName);
    
    let q = query(collRef);

    if (orderByField) {
      q = query(q, orderBy(orderByField));
    }

    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    q = query(q, limit(limitNum));

    const querySnapshot = await getDocs(q);
    const docs: Array<{ data: object, id: string }> = [];
    querySnapshot.forEach((documentSnapshot) => {
      docs.push({ id: documentSnapshot.id, data: documentSnapshot.data() });
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    console.log(`Úspěšně načteno ${docs.length} paginovaných dokumentů z kolekce '${collName}'.`);
    return { docs, lastVisible };
  } catch (e: any) {
    notifyError(`Chyba při načítání paginovaných dokumentů z kolekce '${collName}':`, e);
    throw e;
  }
};