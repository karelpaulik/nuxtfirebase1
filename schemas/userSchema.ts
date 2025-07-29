import { z } from 'zod';
import { Timestamp } from 'firebase/firestore'; 

//coerce lze použít pouze u primitivních typů: number, string, boolean, ...
//coerce nelze použít u: array


//export const userSchema = z.object({
export const createUserSchema = (isFormValidation: boolean) => {
  return z.object({
    fName: z.string().min(1, 'Zadejte jméno').max(50, 'Max. 50 znaků'),
    lName: isFormValidation
      ? z.string().min(1, 'Zadejte příjmení')                   // Pro formulář: prázdné = chyba
      : z.string().min(1, 'Zadejte příjmení').catch(null),      // Pro API: prázdné/nevalidní = null
    born: z.string().nullable().optional(),                     // Pozn. I bez nullable().optional() šlo mazat hodnotu v inputu, protože po smazání je hodnota ''. Tj. prázdný řetězec. Takto je to ale robustnější.
    childrenCount: z.coerce.number().int().min(0).catch(null),  // Celé číslo
    userHeight: z.coerce.number().min(40).max(300).catch(null), // Desetinné číslo
    hasDrivingLic: z.boolean(),
    hobbies: z.array(z.string()).catch([]),
    picked: z.string(),

    createdDate: z.preprocess((val) => {
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
    }, z.date('Očekává se platné datum.').nullable().optional()), // Konečná validace jako Date, null nebo undefined
  });
};

// Schéma a type pro formulář
// Použití v komponentě
export const userFormSchema = createUserSchema(true);
export type UserForForm = z.infer<typeof userFormSchema>;

// Schéma type pro API
// Použití při načítání dat (useDocHandlers.ts, handleReadDoc)
export const userApiSchema = createUserSchema(false);
export type UserForApi = z.infer<typeof userApiSchema>;


// Původně bylo:
// export const userSchema = z.object({
//   fName: z.string().min(1),
//   lName: z.string().min(2),
//   born: z.string().nullable().optional(),   
//   atd.
// });

// export type User = z.infer<typeof userSchema>;