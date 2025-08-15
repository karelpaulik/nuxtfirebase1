import { computed, isReactive, type Reactive, type Ref } from 'vue';

/**
 * Vytvoří computed getter a setter pro formátování a parsování data.
 * @param source Objekt, který obsahuje datum (může být reactive object nebo Ref).
 * @param key Klíč, pod kterým je datum uloženo (např. 'createdDate').
 * @returns Computed vlastnost s get/set logikou pro práci s datem.
 */
export function useDateFormatter(source: Reactive<any> | Ref<any>, key: string) {
  // Ověření, zda je 'source' platný objekt
  if (!source || !isReactive(source) && !('value' in source)) {
    console.error('The source object must be reactive or a Ref.');
    return computed({
      get: () => '',
      set: () => {}
    });
  }

  return computed({
    get: () => {
      // Získání hodnoty z reactive objektu nebo Ref
      const date = 'value' in source ? source.value[key] : source[key];
      
      // Vrátí datum ve formátu YYYY-MM-DD nebo prázdný string, pokud je neplatné
      return date instanceof Date && !isNaN(date.getTime())
        ? date.toISOString().split('T')[0]
        : '';
    },
    set: (newValue: string) => {
      // Získání referenci na objekt (pro Ref)
      const target = 'value' in source ? source.value : source;

      if (newValue === '') {
        // Nastavení na null, pokud je input prázdný
        target[key] = null;
      } else {
        const parsedDate = new Date(newValue);
        if (!isNaN(parsedDate.getTime())) {
          target[key] = parsedDate;
        }
      }
    }
  });
}