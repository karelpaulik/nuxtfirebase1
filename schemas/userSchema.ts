// schemas/userSchema.ts
import { z } from 'zod';
import type { ZodType } from 'zod';
import { Timestamp } from 'firebase/firestore';
import { datePreprocessor } from '@/utils/zod';

// Importy samostatných schématů
import { fileSchema } from './fileSchema';
import { addressSchema, createEmptyAddress } from './addressSchema';

// coerc lze použít pouze u primitivních typů: number, string, boolean, ...
// coerc nelze použít u: array

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
      ? z.string().min(1, 'Zadejte příjmení')               // Pro formulář: prázdné = chyba
      : z.string().nullable().optional(),                   // Pro API: prázdné/nevalidní = null
    born: z.string().nullable().optional(),                  // Pozn. I bez nullable().optional() šlo mazat hodnotu v inputu, protože po smazání je hodnota ''. Tj. prázdný řetězec. Takto je to ale robustnější.

    //childrenCount: z.coerce.number().int().min(0).nullable().optional().catch(null), // Celé číslo
    childrenCount: z.preprocess((val) => {    // Preprocess nutný, aby se povolila "null" hodnota
      if (val === '') {
        return null;
      }
      return val;
    }, z.coerce.number().int().min(0).nullable().optional().catch(null)),

    //userHeight: z.coerce.number().min(30).max(300).nullable().optional().catch(null), // Desetinné číslo
    userHeight: z.preprocess((val) => {    // Preprocess nutný, aby se povolila "null" hodnota
      if (val === '') {
        return null;
      }
      return val;
    }, z.coerce.number().min(30).max(300).nullable().optional().catch(null)),

    hasDrivingLic: z.boolean().catch(null),
    hobbies: z.array(z.string()).catch([]), // Bez kontroly "hobbiesOptions.value"  // Bez kontroly je to zde vhodnější, než s kontrolou.
    //hobbies: z.array(z.enum(hobbyValues as [string, ...string[]])).catch([]), // S kontrolou "hobbiesOptions.value" //Toto: hobbies: z.array(z.enum(hobbyValues)).catch([]), by mohlo selhat. Vylepšeno (přetypování):
    picked: z.string().catch(null),
    createdDate: datePreprocessor.nullable().optional().catch(null),
    files: z.array(fileSchema).optional().catch([]),
    mainAddress: addressSchema.optional().catch(createEmptyAddress()),
    addresses: z.array(addressSchema).optional().catch([]),
  });
};

// Schéma a type pro formulář
// Použití v komponentě
export const userFormSchema = createUserSchema(true);
export type UserFormType = z.infer<typeof userFormSchema>;

// Schéma type pro API
// Použití při načítání dat (useDocHandlers.ts, handleReadDoc)
export const userApiSchema = createUserSchema(false);
export type UserApiType = z.infer<typeof userApiSchema>;

// Redukované schema pro potřeby, kdy je objekt použit jako REFERENCE do jiného objektu.-------
export const userSelectAttributes = ['id', 'fName', 'lName', 'born'] as const;

export const userSelectSchema = userApiSchema
  .pick(Object.fromEntries(userSelectAttributes.map((key) => [key, true])) as any)
  .nullable()
  .optional();

// Toto odpovídá:
// Nepoužívám, protože výše definuji seznam polí, který používám v dalším kódu.
// export const userSelectSchema = userApiSchema.pick({
//     id: true,
//     fName: true,
//     lName: true,
//     born: true,
// }).nullable().optional();
  
//----------------------------------------------------------------------------------------------


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