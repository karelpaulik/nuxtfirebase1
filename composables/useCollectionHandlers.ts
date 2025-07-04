// composables/useCollectionHandlers.ts
import { ref, type Ref } from 'vue'; 
// Předpokládáme, že useReadDocsByFilter už umí zpracovat array filterů
import { useGetAllDocs, useReadDocsByFilter } from '~/composables/useFirestore'; 
import type { WhereFilterOp } from 'firebase/firestore';

interface DocData {
  id: string;
  data: Record<string, any>; 
}

export interface CollectionHandlerProps {
  collectionName: string;
  documents: Ref<DocData[]>; 
  loading: Ref<boolean>;     
  error: Ref<Error | null>;  
}

export function useCollectionHandlers(collectionName: string) {
  const documents = ref<DocData[]>([]);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  const handlerProps: CollectionHandlerProps = {
    collectionName,
    documents,
    loading,
    error,
  };

  return {
    documents,
    loading,
    error,
    _handlerProps: handlerProps, 
  };
}

export const handleReadAllDocs = async (props: CollectionHandlerProps): Promise<void> => {
  const { collectionName, documents, loading, error } = props;

  loading.value = true;
  error.value = null;
  try {
    documents.value = await useGetAllDocs(collectionName);
  } catch (e: any) {
    //error.value = e;
    notifyError(`Chyba při načítání všech dokumentů z kolekce '${collectionName}':`, e);
  } finally {
    loading.value = false;
  }
};

/**
 * Handler pro načtení dokumentů z dané kolekce s použitím jednoho nebo více filtrů.
 *
 * @param {CollectionHandlerProps} props Objekt s reaktivními proměnnými a názvem kolekce.
 * @param {Array<{ field: string; operator: '==' | '>=' | '<=' | '>' | '<' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in'; value: any }>} filters Pole objektů definujících filtry.
 * Příklad: [{ field: 'fName', operator: '==', value: 'Petr' }, { field: 'lName', operator: '>=', value: 'N' }]
 * @returns {Promise<void>}
 */
//Pozor: pokud je filtrů více, tak firestore může požadovat vytvoření: Composite indexu
export const handleReadFilterDocs = async (
  props: CollectionHandlerProps,
  filters: Array<{ field: string; operator: WhereFilterOp; value: any }> 
): Promise<void> => {
  const { collectionName, documents, loading, error } = props;

  if (!filters || filters.length === 0) {
    console.warn('handleReadFilterDocs: Nebyly poskytnuty žádné filtry. Načítání se neprovede.');
    // Můžete se rozhodnout zde volat handleReadAllDocs, pokud nechcete žádný filtr
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    documents.value = await useReadDocsByFilter(collectionName, filters);
  } catch (e: any) {
    //error.value = e;
    notifyError(`Chyba při načítání filtrovaných dokumentů z kolekce '${collectionName}':`, e);
  } finally {
    loading.value = false;
  }
};