// ~/utils/normalizeData.ts (nebo ~/utils/generalNormalization.ts - název by měl naznačovat obecnost)

/**
 * Normalizuje objekt dat podle poskytnutých výchozích hodnot.
 *
 * Tato funkce je generická a lze ji použít pro jakýkoli typ objektu.
 * Zajistí, že výsledný objekt bude mít všechny vlastnosti definované v `defaultSchema`,
 * a pokusí se správně přiřadit nebo koercovat hodnoty z `rawData`.
 *
 * @template T Typ objektu, který normalizujeme (např. FormData, ProductData apod.).
 * @param rawData Syrová data (částečná nebo s nesprávnými typy) z externího zdroje.
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
    } else {
      // Pro všechny ostatní typy (čísla, objekty atd.):
      // Použijeme rawVal, pokud není null nebo undefined. Jinak použijeme defVal.
      normalized[key] = (rawVal ?? defVal) as T[typeof key];
    }
  }

  return normalized;
}