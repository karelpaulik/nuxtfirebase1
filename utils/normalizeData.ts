// ~/utils/normalizeData.ts (nebo ~/utils/generalNormalization.ts)

// Definice typu pro Firestore Timestamp (zjednodušeno pro účely konverze)
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date; // Metoda, kterou Firebase Timestamp objekty poskytují
}

/**
 * Pomocná funkce pro zjištění, zda je objekt Firestore Timestamp.
 * @param obj Libovolný objekt.
 * @returns True, pokud je objekt Firestore Timestamp, jinak false.
 */
function isFirestoreTimestamp(obj: any): obj is FirestoreTimestamp {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.seconds === 'number' &&
    typeof obj.nanoseconds === 'number' &&
    typeof obj.toDate === 'function'
  );
}

/**
 * Normalizuje objekt dat podle poskytnutých výchozích hodnot.
 *
 * Tato funkce je generická a lze ji použít pro jakýkoli typ objektu.
 * Zajistí, že výsledný objekt bude mít všechny vlastnosti definované v `defaultSchema`,
 * a pokusí se správně přiřadit nebo koercovat hodnoty z `rawData`.
 * Speciálně řeší konverzi Firestore Timestamp na JavaScript Date objekty.
 *
 * @template T Typ objektu, který normalizujeme (např. FormData, ProductData apod.).
 * @param rawData Syrová data (částečná nebo s nesprávnými typy) z externího zdroje (např. Firestore).
 * @param defaultSchema Objekt obsahující výchozí hodnoty a správné typy pro každou vlastnost.
 * Tento objekt slouží jako šablona pro normalizaci.
 * @returns Normalizovaný objekt typu T.
 */
export function normalizeData<T extends Record<string, any>>(rawData: Partial<T>, defaultSchema: T): T {
  // Začneme s kompletním schématem, abychom zajistili přítomnost všech klíčů s výchozími hodnotami
  const normalized: T = { ...defaultSchema };

  // Projdeme každý klíč definovaný ve výchozím schématu
  for (const key in defaultSchema) {
    // Přeskočíme klíče, které nejsou vlastními vlastnostmi objektu (pro jistotu)
    if (!Object.prototype.hasOwnProperty.call(defaultSchema, key)) continue;

    const defVal = defaultSchema[key]; // Výchozí hodnota pro aktuální klíč
    const rawVal = rawData[key];       // Hodnota z načtených dat pro aktuální klíč

    // --- Nová logika pro konverzi Firestore Timestamp na Date ---
    if (isFirestoreTimestamp(rawVal)) {
      normalized[key] = rawVal.toDate() as T[typeof key];
      continue; // Pokračujeme na další klíč, pokud jsme už zpracovali Timestamp
    }

    // Logika pro přiřazení a typovou konverzi podle typu defaultní hodnoty
    if (Array.isArray(defVal)) {
      // Pokud je výchozí hodnota pole: použijeme rawVal, pokud je také pole. Jinak prázdné pole.
      normalized[key] = Array.isArray(rawVal) ? (rawVal as T[typeof key]) : ([] as T[typeof key]);
    } else if (typeof defVal === 'boolean') {
      // Pokud je výchozí hodnota boolean: použijeme rawVal, pokud je také boolean. Jinak false.
      normalized[key] = (typeof rawVal === 'boolean' ? rawVal : false) as T[typeof key];
    } else if (typeof defVal === 'string') {
      // Pokud je výchozí hodnota string: použijeme rawVal, pokud je také string. Jinak prázdný řetězec.
      normalized[key] = (typeof rawVal === 'string' ? rawVal : '') as T[typeof key];
    } else if (typeof defVal === 'object' && defVal !== null && !Array.isArray(defVal)) {
      // Normalizace vnořených datumů.
      // Pokud je výchozí hodnota objekt (ale ne pole a ne Date), rekurzivně normalizujeme
      // Důležité: 'Date' objekt se zde už nemůže objevit jako `defVal`, protože by byl `Timestamp` ošetřen výše
      normalized[key] = normalizeData(rawVal || {}, defVal);
    }
    else {
      // Pro všechny ostatní typy (čísla, atd.):
      // Použijeme rawVal, pokud není null nebo undefined. Jinak použijeme defVal.
      normalized[key] = (rawVal ?? defVal) as T[typeof key];
    }
  }

  return normalized;
}