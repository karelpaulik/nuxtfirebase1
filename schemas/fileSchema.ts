// schemas/fileSchema.ts
import { z } from 'zod';

/**
 * Zod schéma pro jeden soubor.
 */
export const fileSchema = z.object({
  url: z.string().url('URL souboru musí být platná URL adresa.'),
  name: z.string().min(1, 'Název souboru je povinný.'),
  // Můžete přidat další metadata, např. velikost, typ, ID pro správu
});

/**
 * TypeScript typ odvozený od fileSchema.
 */
export type FileSchemaType = z.infer<typeof fileSchema>;