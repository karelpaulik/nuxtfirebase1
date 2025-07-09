// composables/useRefSelectHandlers.ts
import { ref, type Ref } from 'vue';
import { useGetAllDocs } from '@/composables/useFirestore';
import { notifyError } from '@/composables/useNotify';

/**
 * Rozhraní pro jednu možnost v q-select.
 */
interface SelectOption {
  label: string;
  value: string; // ID dokumentu z Firestore
}

/**
 * Generické composable pro načítání dat z kolekce Firestore
 * a jejich formátování pro použití v q-select.
 *
 * @param collectionName Název kolekce, ze které se mají načíst data (např. 'users').
 * @param labelFields Pole názvů polí, která se mají použít pro vytvoření 'label' možnosti.
 * Pokud je polí více, budou spojena mezerou (např. ['fName', 'lName'] -> "Jan Novák").
 * @returns Objekt s reaktivními proměnnými a funkcí pro načítání možností.
 */
export function useRefSelectHandlers(collectionName: string, labelFields: string[]) {
  const selectOptions: Ref<SelectOption[]> = ref([]);
  const loading: Ref<boolean> = ref(false);
  const error: Ref<Error | null> = ref(null);

  /**
   * Načte data z určené kolekce a naformátuje je pro q-select.
   */
  const loadOptions = async () => {
    loading.value = true;
    error.value = null;
    try {
      console.log(`Načítám možnosti z kolekce: '${collectionName}' s poli pro popisek: ${labelFields.join(', ')}`);
      const docs = await useGetAllDocs(collectionName);
      console.log(`Načteno ${docs.length} dokumentů z kolekce '${collectionName}'.`);

      selectOptions.value = docs.map(doc => {
        // Vytvoření labelu spojením hodnot z určených polí
        const label = labelFields
          .map(field => doc.data[field])
          .filter(Boolean) // Odstraní null/undefined hodnoty
          .join(' ');

        // Pokud je label stále prázdný, použijeme ID dokumentu jako záložní
        const finalLabel = label || doc.id;

        return {
          label: finalLabel,
          value: doc.id,
        };
      });

    } catch (e: any) {
      error.value = e;
      notifyError(`Chyba při načítání možností pro ${collectionName}:`, e);
    } finally {
      loading.value = false;
    }
  };

  return {
    selectOptions,
    loading,
    error,
    loadOptions,
  };
}
