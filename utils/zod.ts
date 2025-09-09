// utils/zod.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

/**
 * Předprocesorová funkce pro převod různých typů data na standardní Date objekt.
 * Podporuje: Firestore Timestamp, standardní Date, string a serializovaný objekt Timestampu.
 */
export const datePreprocessor = z.preprocess((val) => {
  // 1. Ošetření null/undefined na začátku
  if (val === null || typeof val === 'undefined') {
    return null; // Zod z.date().nullable().optional() to pak zpracuje
  }
  // 2. Pokud je to instance Firestore Timestamp
  if (val instanceof Timestamp) {
    return val.toDate();
  }
  // 3. Pokud je to instance JavaScript Date
  if (val instanceof Date) {
    return val;
  }
  // 4. Pokud je to string, zkusíme parsovat
  if (typeof val === 'string') {
    const parsed = new Date(val);
    // Pokud je datum neplatné, vrátíme undefined, což způsobí chybu ve z.date()
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }
  // 5. Pokud je to prostý objekt { seconds, nanoseconds } (serializovaný Timestamp)
  if (
    typeof val === 'object' &&
    val !== null &&
    typeof (val as any).seconds === 'number' &&
    typeof (val as any).nanoseconds === 'number'
  ) {
    // Převedeme sekundy na milisekundy a vytvoříme Date
    return new Date((val as any).seconds * 1000);
  }

  // Pokud se nic z toho neshoduje, vrátíme původní hodnotu,
  // a z.date() ji pak bude validovat a pravděpodobně selže.
  return val;
}, z.date());