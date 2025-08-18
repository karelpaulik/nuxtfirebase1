// Vyčistí objekt od vlastností, jejichž hodnota je rovna "undefined"
// Undefined vznikne v zod validaci, jejichž hodnoty nebyly definovány.
// Undefined nelze uložit do firestore. Při pokusu o uložení do Firestore, vyskočí chyba.

export function cleanObject<T extends Record<string, any>>(obj: T): T {
  // 1. Vytvoříme novou, mělkou kopii objektu
  const newObj: T = {} as T;

  // 2. Procházíme všechny klíče a hodnoty původního objektu
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      console.log(key, value, typeof value);
      // 3. Pokud je hodnota objekt (ale ne pole a ne null), rekurzivně ji vyčistíme
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
        newObj[key as keyof T] = cleanObject(value);
      } else {
        // 4. Jinak ji jednoduše přidáme do nového objektu
        newObj[key as keyof T] = value;
      }
    }
  }

  return newObj;
}