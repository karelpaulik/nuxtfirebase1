// schemas/fileSchema.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import { datePreprocessor } from '@/utils/zod';

/**
 * Zod schéma pro jeden soubor.
 */
export const fileSchema = z.object({
  id: z.string().optional(),
  origName: z.string().min(1, 'Původní název souboru je povinný.'),
  currName: z.string().min(1, 'Aktuální název souboru je povinný.'),
  url: z.string().url('URL souboru musí být platná URL adresa.'),
  fileSize: z.number().nonnegative('Velikost souboru musí být nezáporné číslo.'),
  fileType: z.string().optional(),
  //uploadedDate: z.instanceof(Date, { message: 'Datum nahrání musí být platné' }).or(z.instanceof(Timestamp)).nullable().optional(),
  uploadedDate: datePreprocessor.nullable().optional().catch(null),
  note: z.string().nullable().optional(),
});

/**
 * TypeScript typ odvozený od fileSchema.
 */
export type FileSchemaType = z.infer<typeof fileSchema>;