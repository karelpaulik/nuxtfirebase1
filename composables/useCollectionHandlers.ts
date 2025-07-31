// composables/useCollectionHandlers.ts
import { ref, type Ref } from 'vue';
import { useGetAllDocs, useReadDocsByFilter } from '~/composables/useFirestore';
import type { WhereFilterOp } from 'firebase/firestore';

// Importujeme typy pro Zod, ale samotné schéma se bude předávat
import { z } from 'zod'; // Zde je 'z' potřeba pro z.object a z.array
import type { ZodObject, ZodRawShape } from 'zod';
import { displayZodErrors, notifyError } from './useNotify'; // Importujeme funkce pro zobrazení chyb z useNotify


/**
 * Rozhraní pro data jednotlivého dokumentu po validaci.
 * Data jsou nyní genericky typována podle T, což zajišťuje, že odpovídají předanému schématu.
 */
interface DocData<T> {
  id: string;
  data: T; // Data dokumentu jsou nyní genericky typována
}

/**
 * Rozhraní pro volitelné parametry composable useCollectionHandlers.
 */
export interface CollectionHandlerOptions {
  validationSchema?: ZodObject<ZodRawShape>; // Validační schéma je volitelné
  // Zde se přidají další volitelné parametry. Např.: anotherOptionalParam?: string;
}

export interface CollectionHandlerProps<T> {
  collectionName: string;
  documents: Ref<DocData<T>[]>; // Dokumenty jsou nyní polem validovaných DocData s generickým typem
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  options: CollectionHandlerOptions;
}

/**
 * Hlavní composable pro správu kolekcí dokumentů.
 * Inicializuje reaktivní proměnné pro dokumenty, stav načítání a chyby.
 * Přijímá volitelné validační schéma pro generickou validaci dat.
 * @param collectionName Název kolekce Firestore.
 * @param options Volitelný objekt s dalšími parametry, včetně validationSchema.
 * @returns Objekt s reaktivními proměnnými a props pro handlery.
 */
export function useCollectionHandlers<T extends Record<string, any>>(
  collectionName: string,
  options: CollectionHandlerOptions = {} // Volitelný objekt s parametry, s výchozí prázdnou hodnotou
) {
  const documents = ref<DocData<T>[]>([]);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  const handlerProps: CollectionHandlerProps<T> = {
    collectionName,
    documents,
    loading,
    error,
    options, // Předáváme celý objekt options do props
  };

  return {
    documents,
    loading,
    error,
    _handlerProps: handlerProps,
  };
}

/**
 * Handler pro načtení všech dokumentů z dané kolekce.
 * Validace proběhne, pokud je poskytnuto validační schéma v options.
 * @param props Objekt s reaktivními proměnnými, názvem kolekce a volitelnými options.
 * @returns {Promise<void>}
 */
export const handleReadAllDocs = async <T extends Record<string, any>>(props: CollectionHandlerProps<T>): Promise<void> => {
  // Destrukturalizujeme validationSchema z options
  const { collectionName, documents, loading, error, options } = props;
  const { validationSchema } = options;

  loading.value = true;
  error.value = null;
  try {
    // //bez validace
    // documents.value = await useGetAllDocs(collectionName);

    // //validace přes array
    // //Tato validace ale není vhodná - při nevalidním jednom záznamu hlásí chybu.
    // const fetchedDocs = await useGetAllDocs(collectionName);
    // // Definujeme schéma pro JEDEN dokument tak, jak ho vrací useGetAllDocs ({ id, data })
    // const fullDocSchema = z.object({
    //   id: z.string(), // ID dokumentu je vždy string
    //   data: validationSchema, // 'data' část dokumentu validujeme předaným schématem
    // });
    // // Vytvoříme schéma pro POLE těchto celých dokumentů
    // const arrayOfFullDocsSchema = z.array(fullDocSchema);
    // // Provedeme validaci celého pole
    // const validatedResult = arrayOfFullDocsSchema.safeParse(fetchedDocs);
    // if (validatedResult.success) {
    //   // Pokud je validace celého pole úspěšná, přiřadíme validovaná data
    //   documents.value = validatedResult.data;
    //   console.log('Validovaná data:', documents.value);
    // } else {
    //   // Pokud validace celého pole selže, zobrazíme chyby
    //   console.warn('Validace celého pole dokumentů selhala:', validatedResult.error);
    //   displayZodErrors(validatedResult.error); // Zobrazíme notifikace pro Zod chyby
    //   documents.value = []; // Vyprázdníme seznam, protože data nejsou validní
    // }    
    const fetchedDocs = await useGetAllDocs(collectionName);

    // Validace proběhne pouze, pokud je validationSchema poskytnuto
    if (validationSchema) {
      const validatedDocs: DocData<T>[] = []; // Zde budeme sbírat pouze validní dokumenty

      fetchedDocs.forEach(doc => {
        // Provedeme validaci dat dokumentu pomocí předaného Zod schématu
        const parsedData = validationSchema.safeParse(doc.data);
        if (parsedData.success) {
          // Pokud je validace úspěšná, přidáme dokument do seznamu
          validatedDocs.push({ id: doc.id, data: parsedData.data as T }); // Přetypování na T
        } else {
          // Pokud validace selže, zobrazíme chyby a dokument nezahrneme
          console.warn(`Dokument s ID '${doc.id}' selhal validaci schématu:`, parsedData.error);
          displayZodErrors(parsedData.error); // Zobrazíme notifikace pro Zod chyby
        }
      });
      documents.value = validatedDocs; // Aktualizujeme seznam dokumentů pouze s platnými daty
      console.log('Validace povolena. Načtená validovaná data:', documents.value);
    } else {
      // Pokud validationSchema není poskytnuto, přiřadíme data tak, jak jsou
      documents.value = fetchedDocs as DocData<T>[]; // Přetypování na očekávaný typ
      console.log('Validace zakázána (schéma nebylo poskytnuto). Načtená data:', documents.value);
    }

  } catch (e: any) {
    notifyError(`Chyba při načítání všech dokumentů z kolekce '${collectionName}':`, e);
  } finally {
    loading.value = false;
  }
};

/**
 * Handler pro načtení dokumentů z dané kolekce s použitím jednoho nebo více filtrů.
 * Validace proběhne, pokud je poskytnuto validační schéma v options.
 *
 * @param {CollectionHandlerProps<T>} props Objekt s reaktivními proměnnými, názvem kolekce a volitelnými options.
 * @param {Array<{ field: string; operator: '==' | '>=' | '<=' | '>' | '<' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in'; value: any }>} filters Pole objektů definujících filtry.
 * Příklad: [{ field: 'fName', operator: '==', value: 'Petr' }, { field: 'lName', operator: '>=', value: 'N' }]
 * @returns {Promise<void>}
 */
export const handleReadFilterDocs = async <T extends Record<string, any>>(
  props: CollectionHandlerProps<T>,
  filters: Array<{ field: string; operator: WhereFilterOp; value: any }>
): Promise<void> => {
  // Destrukturalizujeme validationSchema z options
  const { collectionName, documents, loading, error, options } = props;
  const { validationSchema } = options;

  if (!filters || filters.length === 0) {
    console.warn('handleReadFilterDocs: Nebyly poskytnuty žádné filtry. Načítání se neprovede.');
    // Možno rozhodnout, zda volat handleReadAllDocs, pokud žádný filtr
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const fetchedDocs = await useReadDocsByFilter(collectionName, filters);

    // Validace proběhne pouze, pokud je validationSchema poskytnuto
    if (validationSchema) {
      const validatedDocs: DocData<T>[] = []; // Zde budeme sbírat pouze validní dokumenty

      fetchedDocs.forEach(doc => {
        // Provedeme validaci dat dokumentu pomocí předaného Zod schématu
        const parsedData = validationSchema.safeParse(doc.data);
        if (parsedData.success) {
          // Pokud je validace úspěšná, přidáme dokument do seznamu
          validatedDocs.push({ id: doc.id, data: parsedData.data as T }); // Přetypování na T
        } else {
          // Pokud validace selže, zobrazíme chyby a dokument nezahrneme
          console.warn(`Filtrovaný dokument s ID '${doc.id}' selhal validaci schématu:`, parsedData.error);
          displayZodErrors(parsedData.error); // Zobrazíme notifikace pro Zod chyby
        }
      });
      documents.value = validatedDocs; // Aktualizujeme seznam dokumentů pouze s platnými daty
      console.log('Validace povolena. Načtená filtrovaná validovaná data:', documents.value);
    } else {
      // Pokud validationSchema není poskytnuto, přiřadíme data tak, jak jsou
      documents.value = fetchedDocs as DocData<T>[]; // Přetypování na očekávaný typ
      console.log('Validace zakázána (schéma nebylo poskytnuto). Načtená filtrovaná data:', documents.value);
    }

  } catch (e: any) {
    notifyError(`Chyba při načítání filtrovaných dokumentů z kolekce '${collectionName}':`, e);
  } finally {
    loading.value = false;
  }
};
