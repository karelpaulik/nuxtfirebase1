// schemas/bookSchema.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore'; 

// Importujeme userApiSchema pro vnoření
import { userApiSchema, userSelectSchema } from './userSchema'; 

export const createBookSchema = (isFormValidation: boolean) => {
  return z.object({
    // ID je zde, protože může být součástí dat z formuláře (při úpravě existujícího)
    // nebo z API (při načítání), ale pro nové záznamy nemusí existovat.
    // proto je volitelné.
    id: z.string().optional(), // ID dokumentu, volitelné
    
    title: isFormValidation
      ? z.string().min(1, 'Zadejte název knihy').max(100, 'Max. 100 znaků')
      : z.string().catch(null),
    
    author: isFormValidation
      ? z.string().min(1, 'Zadejte autora').max(100, 'Max. 100 znaků')
      : z.string().catch(null),

    createdDate: z.preprocess((val) => {
      if (val === null || typeof val === 'undefined') {
        return null;
      }
      if (val instanceof Timestamp) {
        return val.toDate();
      }
      if (val instanceof Date) {
        return val;
      }
      if (typeof val === 'string') {
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      }
      if (
        typeof val === 'object' &&
        val !== null &&
        typeof (val as any).seconds === 'number' &&
        typeof (val as any).nanoseconds === 'number'
      ) {
        return new Date((val as any).seconds * 1000);
      }
      return val;
    }, z.date('Očekává se platné datum pro vytvoření knihy.').nullable().optional()),

    currUserRefUsers: userSelectSchema.nullable().optional()

  });
};

// Schéma a type pro formulář
export const bookFormSchema = createBookSchema(true);
export type BookFormType = z.infer<typeof bookFormSchema>;

// Schéma a type pro API
// Není potřeba .extend(), protože 'id' je již součástí createBookSchema
export const bookApiSchema = createBookSchema(false); 
export type BookApiType = z.infer<typeof bookApiSchema>;

/**
 * Funkce pro vytvoření prázdných dat formuláře.
 * Umístěna zde, aby byla blízko definice typu BookFormType a schématu.
 */
export const createEmptyFormData = (): Omit<BookFormType, 'id'> => {
  return {
    id: undefined, // Toto být nemusí, ale asi je to čistější řešení
    title: '',
    author: '',
    createdDate: new Date(),
    currUserRefUsers: null
  };
};