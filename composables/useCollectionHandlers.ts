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
interface CollectionHandlerConfig {
  validationSchema?: ZodObject<ZodRawShape>; // Validační schéma je volitelné
  // Zde se přidají další volitelné parametry. Např.: anotherOptionalParam?: string;
}

/**
 * Hlavní composable pro správu kolekcí dokumentů.
 * Inicializuje reaktivní proměnné pro dokumenty, stav načítání a chyby.
 * Nyní vrací i handlery pro čtení dat.
 * @param collectionName Název kolekce Firestore.
 * @param config Volitelný objekt s dalšími parametry, včetně validationSchema.
 * @returns Objekt s reaktivními proměnnými a handlery.
 */
export function useCollectionHandlers<T extends Record<string, any>>(
  collectionName: string,
  config: CollectionHandlerConfig = {}
) {
  const documents = ref<DocData<T>[]>([]);
  const loading = ref(true);//true, protože se očekává, že se handler spustí hned po: onMounted
  const error = ref<Error | null>(null);

  /**
   * Handler pro načtení všech dokumentů z dané kolekce.
   * Validace proběhne, pokud je poskytnuto validační schéma v config.
   * @returns {Promise<void>}
   */
  const handleReadAllDocs = async (): Promise<void> => {
    // Destrukturalizujeme validationSchema z config
    const { validationSchema } = config;

    loading.value = true;// true na začátku každého volání asynchronní operace.
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
   * Validace proběhne, pokud je poskytnuto validační schéma v config.
   *
   * @param filters Pole objektů definujících filtry.
   * Příklad: [{ field: 'fName', operator: '==', value: 'Petr' }, { field: 'lName', operator: '>=', value: 'N' }]
   * @returns {Promise<void>}
   */
  const handleReadFilterDocs = async (
    filters: Array<{ field: string; operator: WhereFilterOp; value: any }>
  ): Promise<void> => {
    // Destrukturalizujeme validationSchema z config
    const { validationSchema } = config;

    if (!filters || filters.length === 0) {
      console.warn('handleReadFilterDocs: Nebyly poskytnuty žádné filtry. Načítání se neprovede.');
      // Možno rozhodnout, zda volat handleReadAllDocs, pokud žádný filtr
      return;
    }

    loading.value = true;// true na začátku každého volání
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

    return {
    documents,
    loading,
    error,
    collectionHandlers: {
        handleReadAllDocs, 
        handleReadFilterDocs, 
    },
  };
}