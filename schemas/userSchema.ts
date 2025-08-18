import { z } from 'zod';
import type { ZodType } from 'zod';
import { Timestamp } from 'firebase/firestore'; 

//coerce lze použít pouze u primitivních typů: number, string, boolean, ...
//coerce nelze použít u: array

//Pro potřeby seznamu ve schématu
export const hobbiesOptions = [
  { label: 'Fotbal', value: 'fotbal' },
  { label: 'Hokej', value: 'hokej' },
  { label: 'Cyklistika', value: 'cyklistika' },
  //{ label: 'Šachy', value: 'šachy' },
];

export const pickedOptions = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
  { label: 'Three', value: 'three' },
];

//Pro kontrolu ve schematu musí být použito pole hodnot, ne pole objektů, tj. [fotbal, hokej, cyklistika]
const hobbyValues = hobbiesOptions.map(option => option.value);

//export const userSchema = z.object({
export const createUserSchema = (isFormValidation: boolean) => {
  return z.object({
    // ID je zde, protože může být součástí dat z formuláře (při úpravě existujícího)
    // nebo z API (při načítání), ale pro nové záznamy nemusí existovat.
    // proto je volitelné.
    id: z.string().optional(), // ID dokumentu, volitelné

    fName: isFormValidation
      ? z.string().min(1, 'Zadejte jméno').max(50, 'Max. 50 znaků')
      : z.string().nullable().optional(),
    lName: isFormValidation
      ? z.string().min(1, 'Zadejte příjmení')                   // Pro formulář: prázdné = chyba
      : z.string().catch(null),                                 // Pro API: prázdné/nevalidní = null
    born: z.string().nullable().optional(),                     // Pozn. I bez nullable().optional() šlo mazat hodnotu v inputu, protože po smazání je hodnota ''. Tj. prázdný řetězec. Takto je to ale robustnější.
    
    //childrenCount: z.coerce.number().int().min(0).nullable().optional().catch(null),  // Celé číslo
    childrenCount: z.preprocess((val) => {  // Preprocess nutný, aby se povolila "null" hodnota
      if (val === '') {
        return null;
      }
      return val;
    }, z.coerce.number().int().min(0).nullable().optional().catch(null)),

    //userHeight: z.coerce.number().min(30).max(300).nullable().optional().catch(null), // Desetinné číslo
    userHeight: z.preprocess((val) => {  // Preprocess nutný, aby se povolila "null" hodnota
      if (val === '') {
        return null;
      }
      return val;
    }, z.coerce.number().min(30).max(300).nullable().optional().catch(null)),

    hasDrivingLic: z.boolean(),
    hobbies: z.array(z.string()).catch([]), // Bez kontroly "hobbiesOptions.value"  // Bez kontroly je to zde vhodnější, než s kontrolou.
    //hobbies: z.array(z.enum(hobbyValues as [string, ...string[]])).catch([]), // S kontrolou "hobbiesOptions.value" //Toto: hobbies: z.array(z.enum(hobbyValues)).catch([]), by mohlo selhat. Vylepšeno (přetypování):
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
    }, z.date('Očekává se platné datum.').nullable().optional().catch(null)), // Konečná validace jako Date, null nebo undefined
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

// //Návod, jak přidat .catch(null) ke každému atributu schematu
// export const userApiSchemaCatchAllNull = z.object(
//   Object.fromEntries(
//     Object.entries(userApiSchema.shape).map(([key, schema]) => {
//       const nullableSchema = (schema as ZodType).nullable();
//       return [key, nullableSchema.catch(null)];
//     })
//   )
// );

// Původně bylo:
// export const userSchema = z.object({
//   fName: z.string().min(1),
//   lName: z.string().min(2),
//   born: z.string().nullable().optional(),   
//   atd.
// });

// export type User = z.infer<typeof userSchema>;