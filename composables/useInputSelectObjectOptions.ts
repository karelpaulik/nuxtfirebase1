// composables/useInputSelectObjectOptions.ts
import { ref, type Ref } from 'vue';
import { useGetAllDocs } from '@/composables/useFirestore';
import { notifyError } from '@/composables/useNotify';

// Definice typu pro data dokumentu, která se načítají z Firestore
interface DocData {
  id: string;
  data: Record<string, any>;
}

/**
 * Generický composable pro správu dat pro q-select komponenty.
 * Načítá všechny dokumenty z dané kolekce a poskytuje je jako možnosti pro výběr.
 *
 * @param collectionName Název kolekce ve Firestore, ze které se mají načíst data.
 * @param attributesToSelect Volitelné pole řetězců. Pokud je poskytnuto, budou z načtených objektů vybrány pouze tyto atributy.
 * Pokud je pole prázdné nebo nedefinované, načte se celý objekt dokumentu.
 * @returns Objekt obsahující reaktivní proměnné pro možnosti výběru, stav načítání a funkci pro načtení možností.
 */
export function useInputSelectObjectOptions<T extends Record<string, any>>(
  collectionName: string,
  attributesToSelect?: string[] // Přidání volitelného argumentu
) {
  // Reaktivní proměnná pro ukládání možností pro q-select
  const selectOptions: Ref<object[]> = ref([{}]);
  // Reaktivní proměnná pro indikaci stavu načítání dat
  const loading: Ref<boolean> = ref(false);

  /**
   * Načte možnosti z Firestore kolekce.
   *
   * Tato funkce nastaví stav načítání na true, pokusí se načíst všechny dokumenty
   * z určené kolekce a poté je transformuje do formátu vhodného pro q-select.
   * V případě chyby zobrazí notifikaci.
   */
  const handleLoadOptions = async () => {
    loading.value = true; // Nastaví načítání na true
    try {
      // Načte všechny dokumenty z kolekce pomocí useGetAllDocs
      const docs: DocData[] = await useGetAllDocs(collectionName);

      // Krok 1: Inicializujeme selectOptions.value s kompletními daty dokumentů.
      // Toto je výchozí stav – pokud nejsou vybrány žádné atributy, zůstane to tak.
      selectOptions.value = docs.map(doc => ({ id: doc.id, ...doc.data })) as object[];

      // Krok 2: Pokud jsou specifikovány atributy, provedeme dodatečnou transformaci
      // a zúžíme data pouze na požadované atributy.
      if (attributesToSelect && attributesToSelect.length > 0) {
        selectOptions.value = selectOptions.value.map(item => {
          // Vytvoříme nový objekt, který bude obsahovat jen vybrané atributy a ID.
          const selectedData: Record<string, any> = { id: (item as any).id };

          // Projdeme seznam požadovaných atributů a přidáme je, pokud existují v původním objektu.
          attributesToSelect.forEach(attr => {
            if (item.hasOwnProperty(attr)) {
              selectedData[attr] = (item as any)[attr];
            }
          });
          return selectedData;
        }) as object[];
      }
      // Pokud 'attributesToSelect' nebylo definováno nebo je prázdné,
      // 'selectOptions.value' již obsahuje plné objekty z kroku 1 a žádná další akce není potřeba.

      console.log(`Načteno ${selectOptions.value.length} možností z kolekce '${collectionName}'.`);
    } catch (e: any) {
      // Zobrazí chybovou notifikaci, pokud dojde k problému při načítání
      notifyError(`Chyba při načítání možností pro výběr z kolekce '${collectionName}':`, e);
    } finally {
      loading.value = false; // Nastaví načítání zpět na false po dokončení
    }
  };

  return {
    selectOptions, // Pole možností pro q-select
    loading,        // Stav načítání
    handleLoadOptions     // Funkce pro načtení možností
  };
}